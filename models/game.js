const postgres = require("../databases/postgres")
const neo4j = require("../databases/neo4j")
const mongo = require("../databases/mongo")

module.exports = class Game {
  constructor (local, dataHorario, timeA, timeB) {
    this.local = local;
    this.dataHorario = dataHorario;
    this.timeA = timeA;
    this.timeB = timeB;
  }

  static async get (id) {
    if (id) {
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
          // Depende de como vai ser adicionado o campo titulares no mongo
          titulares: gameMongo.gameTitulares
        },
        away_team: {
          id: gameSql.awayTeamId, 
          name: gameSql.awayTeamName,
          // Depende de como vai ser adicionado o campo titulares no mongo
          titulares: gameMongo.gameTitulares
        },
          // Depende de como vai ser adicionado o campo eventos no mongo
        eventos: gameMongo.gameEvents
      }
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
}
