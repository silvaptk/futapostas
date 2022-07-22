const postgres = require("../databases/postgres")
const neo4j = require("../databases/neo4j")
const mongo = require("../databases/mongo");
const betTypes = require("./betTypes");
const User = require("./user");

module.exports = class Game {
  constructor (place, date, homeTeam, awayTeam) {
    this.place = place;
    this.date = date;
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
  }

  static async get (id) {
    if (id) {
      let game  

      try {
        const result = await postgres.query(`
          SELECT 
            j.id AS "id", 
            j.local AS "place", 
            j.data_horario AS "date",
            tA.id AS "homeTeamId", tA.nome AS "homeTeamName",
            tB.id AS "awayTeamId", tB.nome AS "awayTeamName"
          FROM jogo j 
            JOIN "time" tA ON j.timea = tA.id 
            JOIN "time" tB ON j.timeb = tB.id
          WHERE 
            j.id = ${id}
        `)

        game = {
          id: result[0].id,
          place: result[0].place,
          date: result[0].date,
          homeTeam: {
            id: result[0].homeTeamId,
            name: result[0].homeTeamName,
          },
          awayTeam: {
            id: result[0].awayTeamId,
            name: result[0].awayTeamName,
          }
        }
      } catch (error) {
        console.log(error)
      }

      const mongoConnection = await mongo.getConnection()

      try {
        const result = await mongoConnection.collection("Jogo").findOne({
          "códigoJogo": Number(id)
        })

        if (result["Eventos"]) {
          game.events = result["Eventos"].map(item => ({ 
            type: item.tipo,
            author: item.autor,
            secondaryAuthor: item.autor2,
            minute: item.minuto
          }))
        }

        if (result["Titulares"]) {
          game.startingPlayers = {
            homeTeam: result["Titulares"].timeA,
            awayTeam: result["Titulares"].timeB,
          }
        }

        if (result["EstatísticasJogo"]) {
          game.statistics = {
            bets: result["EstatísticasJogo"]["numeroDeApostas"]
          }
        }
      } catch (error) {
        console.log(error)
      } 

      return game
    }

    let games 

    try {
      games = await postgres.query(`
        SELECT 
          j.id AS "gameId", j.local AS "gamePlace", j.data_horario AS "gameDate",
          tA.id AS "homeTeamId", tA.nome AS "homeTeamName",
          tB.id AS "awayTeamId", tB.nome AS "awayTeamName"
        FROM jogo j 
          JOIN "time" tA ON j.timea = tA.id 
          JOIN "time" tB ON j.timeb = tB.id
      `)
    } catch (error) {
      console.log(error)
    }

    return games.map(game => ({
      id: game.gameId,
      place: game.gamePlace,
      date: game.gameDate,
      home_team: {
        id: game.homeTeamId, 
        name: game.homeTeamName,
      },
      away_team: {
        id: game.awayTeamId, 
        name: game.awayTeamName,
      }
    }))  
  }

  async save () {
    try {
      await postgres.query(`
        INSERT INTO jogo(timea, timeb, data_horario, local, numero_de_resenhas)
        VALUES (
          ${this.homeTeam},
          ${this.awayTeam},
          '${this.date}',
          '${this.place}',
          0
        )
      `)
    } catch (error) {
      console.log(error)

      return false 
    }

    try {
      const result = await postgres.query(`
        SELECT 
          id 
        FROM 
          jogo 
        WHERE 
          data_horario = '${this.date}' AND local = '${this.place}'
      `)

      this.id = result[0].id
    } catch (error) {
      console.log(error)

      return false 
    }
    
    try {
      await neo4j.run(`
        CREATE (:Jogo { Id: ${this.id}, Data: "${this.date}" })
      `)
    } catch (error) {
      console.log(error)

      return false 
    }

    try {
      const mongoConnection = await mongo.getConnection()

      mongoConnection.collection("Jogo").insertOne({
        "códigoJogo": this.id 
      })
    } catch (error) {
      console.log(error)

      return false
    }

    return true
  }

  static async updateStartingPlayers (gameId, home, away) {
    const mongoConnection = await mongo.getConnection()

    try {
      await mongoConnection.collection("Jogo").updateOne(
        { "códigoJogo": Number(gameId) },
        { $set: { "Titulares": { "timeA": home, "timeB": away } }}
      )
    } catch (error) {
      console.log(error)

      return false 
    }

    return true 
  }

  static async addEvent (gameId, event) {
    const mongoConnection = await mongo.getConnection()

    try {
      await mongoConnection.collection("Jogo").updateOne(
        { "códigoJogo": Number(gameId) },
        { $push: { 
            "Eventos": { 
              tipo: event.type,
              autor: event.author,
              autor2: event.secondary_author,
              minuto: event.minute,
            } 
          } 
        }
      )
    } catch (error) {
      console.log(error)

      return false 
    }

    return true 
  }

  static async finishGame (id, homeTeam, awayTeam) {
    await this.addResults(id, homeTeam, awayTeam)
    await this.calculatePrizes(id)
  }

  static async addResults (id, homeTeam, awayTeam) {
    const mongoConnection = await mongo.getConnection()
    await mongoConnection.collection("Jogo").updateOne({
      "códigoJogo": Number(id)
    },
    {
      $set: {
        "homeTeam": Number(homeTeam),
        "awayTeam": Number(awayTeam)
      }
    })
    return await mongoConnection.collection("Jogo").find({'códigoJogo': Number(id)}).toArray()[0]
  }

  static async getWinningTeam (id) {
    const collection = (await mongo.getConnection()).collection('Jogo');
    const gameResult = await collection.findOne({'códigoJogo': Number(id)});
    const jogoTeams = await postgres.query(`
    SELECT a.nome as homeTeam, b.nome as awayTeam FROM Jogo j
    INNER JOIN Time a ON a.id = j.timeA
    INNER JOIN Time b ON b.id = j.timeB
    WHERE j.id = ${id}
    `);
    if (gameResult.homeTeam > gameResult.awayTeam) {
      return jogoTeams[0].hometeam;
    } else if (gameResult.homeTeam < gameResult.awayTeam) {
      return jogoTeams[0].awayteam;
    } else {
      return 'EMPATE';
    }
  }

  static async calculatePrizes (id) {
    const promises = betTypes.map(async type => {
      const allBets = (await neo4j.run(`
        MATCH (a:Usuário)-[r:${type}]->(b:Jogo)
        WHERE b.Id = ${id}
        RETURN r.Resultado, r.Valor, a.email
      `)).records.map(bet => ({
        resultado: bet._fields[0],
        valor: bet._fields[1].low,
        email: bet._fields[2],
      }));
      const winningTeam = await this.getWinningTeam(id);
      
      const montantePerdedor = allBets.reduce(
          (acc, bet) => 
            bet.resultado !== winningTeam ? 
            acc + bet.valor : acc,
          0
        )
        
      const montanteVencedor = allBets.reduce(
          (acc, bet) => 
            bet.resultado === winningTeam ?
            acc + bet.valor : acc,
          0
        )
      const allPrizes = allBets.map(bet => {
        if (bet.resultado === winningTeam) {
          let montante;
          if (montanteVencedor > 0) {
            montante = bet.valor * (1 + montantePerdedor/montanteVencedor);
          } else {
            montante = bet.valor;
          }
          return User.updateWalletByEmail(bet.email, montante);
        }
      })
      await Promise.all(allPrizes)
    });
    await Promise.all(promises);
  }
}
