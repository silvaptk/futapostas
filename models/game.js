const postgres = require("../databases/postgres")
const neo4j = require("../databases/neo4j")
const mongo = require("../databases/mongo");
const betTypes = require("./betTypes");
const User = require("./user");

module.exports = class Game {
  constructor (local, dataHorario, timeA, timeB) {
    this.local = local;
    this.dataHorario = dataHorario;
    this.timeA = timeA;
    this.timeB = timeB;
  }

  static async get (id) {
    if (id) {
      //
      let gameSql 

      try {
        gameSql = await postgres.query(`
          SELECT 
            j.id AS "gameId", j.local AS "gamePlace", j.data_horario AS "gameDate",
            tA.id AS "homeTeamId", tA.nome AS "homeTeamName",
            tB.id AS "awayTeamId", tB.nome AS "awayTeamName"
          FROM jogo j 
            JOIN "time" tA ON j.timea = tA.id 
            JOIN "time" tB ON j.timeb = tB.id
          WHERE 
            j.id = ${id}
        `)
        console.log(result)
      } catch (error) {
        console.log(error)
      }

      let gameMongo

      try {
        gameMongo = await mongoConnection.collection("Jogo").find({
          "códigoJogo": id
        })
      } catch(error) {
        console.log(error)
      }

      return {
        id: gameSql.gameId,
        place: gameSql.gamePlace,
        date: gameSql.gameDate,
        home_team: {
          id: gameSql.homeTeamId, 
          name: gameSql.homeTeamName,
          score: gameMongo.homeTeam
        },
        away_team: {
          id: gameSql.awayTeamId, 
          name: gameSql.awayTeamName,
          score: gameMongo.awayTeam
        }
      }
      //
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

      console.log(result)
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
          ${this.timeA},
          ${this.timeB},
          '${this.dataHorario}',
          '${this.local}',
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
          data_horario = '${this.dataHorario}' AND local = '${this.local}'
      `)

      this.id = result[0].id
    } catch (error) {
      console.log(error)

      return false 
    }
    
    try {
      await neo4j.run(`
        CREATE (:Jogo { Id: ${this.id}, Data: "${this.dataHorario}" })
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

  static async finishGame(id, homeTeam, awayTeam) {
    await this.addResults(id, homeTeam, awayTeam);
    await this.calculatePrizes(id);
  }

  static async addResults(id, homeTeam, awayTeam) {
    const mongoConnection = await mongo.getConnection();
    await mongoConnection.collection("Jogo").updateOne({
      'códigoJogo': Number(id)
    },
    {
      $set: {
        "homeTeam": Number(homeTeam),
        "awayTeam": Number(awayTeam)
      }
    });
    return await mongoConnection.collection("Jogo").find({'códigoJogo': Number(id)}).toArray()[0];
  }

  static async getWinningTeam(id) {
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

  static async calculatePrizes(id) {
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
