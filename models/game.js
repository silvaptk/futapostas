const postgres = require("../databases/postgres")
const neo4j = require("../databases/neo4j")
const mongo = require("../databases/mongo")
const betTypes = require("./betTypes")
const User = require("./user")
const Player = require("./player")
const Bet = require("./bet")

module.exports = class Game {
  constructor (place, date, homeTeam, awayTeam) {
    this.place = place
    this.date = date
    this.homeTeam = homeTeam
    this.awayTeam = awayTeam
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
        { 
          $push: { 
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

    switch (event.type) {
      case "GOAL":
        break
      case "OWN-GOAL":
        break 
      case "OFF-SIDE":
        await Player.offSide(event.author)
        break
      case "RED-CARD":
        break
      case "YELLOW-CARD":
        break
      default:
        break
    }

    return true 
  }

  static async finishGame (id) {
    const winningTeam = await this.getWinningTeam(id)

    try {
      neo4j.run(`
        MATCH (g:Jogo { Id: ${id} })
        SET g.Resultado = ${winningTeam}
      `)
    } catch (error) {
      console.log(error)
    }

    const promises = betTypes.map(async type => {
      const allBets = (await neo4j.run(`
        MATCH (a:Usuário)-[r:${type}]->(b:Jogo)
        WHERE b.Id = ${id}
        RETURN r.Resultado, r.Valor, a.Email, r.Id
      `)).records.map(bet => ({
        result: bet._fields[0],
        value: bet._fields[1].low,
        userEmail: bet._fields[2],
        id: bet._fields[3].low
      }))
      
      const loserAmount = allBets.reduce(
        (acc, bet) => 
          bet.result !== winningTeam ? 
          acc + bet.value : acc,
        0
      )
        
      const winnerAmount = allBets.reduce(
        (acc, bet) => 
          bet.result === winningTeam ?
          acc + bet.value : acc,
        0
      )

      const allPrizes = allBets.map(bet => {
        if (bet.result === winningTeam) {
          let amount

          if (winnerAmount > 0) {
            amount = bet.value * (1 + loserAmount / winnerAmount)
          } else {
            amount = bet.value
          }

          return (async () => {
            await Bet.setUserAmount(bet.id, amount)
            await User.updateWalletByEmail(bet.userEmail, amount)
          })()
        }
      })

      await Promise.all(allPrizes)
    })

    await Promise.all(promises)
  }

  static async getWinningTeam (id) {
    const mongoConnection = await mongo.getConnection()

    let gameEvents

    try {
      const game = await mongoConnection.collection("Jogo").findOne({
        "códigoJogo": Number(id) 
      })

      gameEvents = game["Eventos"].map(event => ({
        type: event["tipo"],
        author: event["autor"],
      }))
    } catch (error) {
      throw new Error(error)
    }

    const gameGoals = gameEvents.filter(
      event => ["GOAL", "OWN-GOAL"].includes(event.type)
    )

    let players 

    try {
      players = await Player.get(
        Array.from(new Set(gameGoals.map(goal => goal.author)))
      )
    } catch (error) {
      throw new Error(error)
    }

    const result = {}

    gameGoals.forEach(goal => {
      const author = players.find(player => player.id === goal.author)

      if (result[author.team.id]) {
        result[author.team.id] += 1 
      } else {
        result[author.team.id] = 1
      }
    })

    const [firstTeam, secondTeam] = Object.keys(result)

    if (firstTeam && secondTeam) {
      if (result[firstTeam] > result[secondTeam]) {
        return firstTeam
      } else if (result[firstTeam] < result[secondTeam]) {
        return secondTeam
      }
    } else if (!secondTeam) {
      return firstTeam 
    }

    return "TIE"
  }
}
