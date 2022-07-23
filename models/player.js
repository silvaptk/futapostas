const postgres = require("../databases/postgres")
const mongo = require("../databases/mongo")
const redis = require("../databases/redis")
const { ReviewsPageSize } = require("../util/constants")
const Review = require("./review")
module.exports = class Player {
  constructor (name, birthDate, birthplace, height, weight, team) {
    this.name = name
    this.birthDate = birthDate 
    this.birthplace = birthplace
    this.height = height 
    this.weight = weight 
    this.team = team 
  }

  static async get (ids) {
    if (ids) {
      let players

      try {
        const result = await postgres.query(`
          SELECT  
            j.id AS "id",
            j.nome AS "name",
            j.data_de_nascimento AS "birthDate",
            j.local_de_nascimento AS "birthplace",
            j.peso AS "weight",
            j.altura AS "height",
            t.nome AS "teamName",
            t.id AS "teamId"
          FROM jogador j 
            JOIN time t 
              ON j.time = t.id 
          WHERE j.id IN (${ids.join(", ")})
        `)

        players = result.map(item => ({
          id: item.id,
          name: item.name,
          birthDate: item.birthDate,
          birthplace: item.birthplace,
          weight: item.weight,
          height: item.height,
          team: {
            id: item.teamId,
            name: item.teamName,
          }
        }))
      } catch (error) {
        console.log(error)
      }

      if (ids.length > 1) {
        return players 
      }

      const mongoConnection = await mongo.getConnection()

      try {
        const result = await mongoConnection
          .collection("Jogador")
          .findOne({ "códigoJogador": Number(ids[0]) })

        players[0].statistics = {
          playedGames: result["EstatísticasJogador"]["jogosParticipados"],
          offsides: result["EstatísticasJogador"]["impedimentos"],
        }
      } catch (error) {
        console.log(error)
      }

      return players
    }

    let players

    try {
      players = await postgres.query(`
        SELECT 
          j.id AS "jogadorId", j.nome AS "jogadorNome", j.data_De_Nascimento AS "jogadorNascimento",
          tA.id AS "jogadorTimeId", tA.nome AS "jogadorTimeNome"
        FROM Jogador j 
          JOIN "time" tA ON j.time = tA.id 
      `)
    } catch (error) {
      console.log(error)
    }

    return players.map(player => ({
      id: player.jogadorId,
      name: player.jogadorNome,
      born: player.dataDeNascimento,
      team: {
        id: player.jogadorTimeId,
        name: player.jogadorTimeNome
      }
    }))  
  }

  async save () {
    try {
      await postgres.query(`
        INSERT INTO jogador(
          nome, 
          data_de_nascimento, 
          local_de_nascimento,
          numero_de_resenhas, 
          altura, 
          peso, 
          time
        ) VALUES (
          '${this.name}',
          '${this.birthDate}',
          ${this.birthplace ? `'${this.birthplace}'` : `NULL`},
          0,
          ${this.height ?? "NULL"},
          ${this.weight ?? "NULL"},
          ${this.team}
        )
      `)
    } catch (error) {
      console.log(error)
      return false 
    }

    try {
      const result = await postgres.query(`SELECT MAX(id) FROM jogador`)

      this.id = result[0].max 
    } catch (error) {
      console.log(error)

      return false 
    }

    const mongoConnection = await mongo.getConnection()

    try {
      mongoConnection.collection("Jogador").insertOne({
        "códigoJogador": this.id,
        "EstatísticasJogador": {
          "jogosParticipados": 0,
          "impedimentos": 0
        }
      })
    } catch (error) {
      console.log(error)

      return false 
    }

    return true
  }

  static async offSide (id) {
    const mongoConnection = await mongo.getConnection()

    try {
      await mongoConnection.collection("Jogador").updateOne(
        { "códigoJogador": id },
        { "EstatísticasJogador": { $inc: { "impedimentos": 1 } } }
      )
    } catch (error) {
      console.log(error)

      return false 
    }

    return true 
  }
}
