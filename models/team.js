const postgres = require("../databases/postgres")
const mongo = require("../databases/mongo")

module.exports = class Team {
  constructor(name) {
    this.name = name
  }

  static async get (id) {
    if (id) {
      let team = { id: Number(id) }

      try {
        const result = await postgres.query(`
          SELECT  
            t.nome AS team_name,
            j.id AS player_id,
            j.nome AS player_name
          FROM time t 
          LEFT JOIN jogador j ON t.id = j.time 
          WHERE t.id = ${id}
        `)

        team = {
          ...team,
          name: result[0].team_name,
          players: result.filter(item => !!item.player_name).map(item => ({ 
            name: item.player_name, 
            id: item.player_id 
          }))
        }
      } catch (error) {
        console.log(error)

        throw new Error("Não foi possível obter os dados do time do banco relacional")
      }

      try {
        const mongoConnection = await mongo.getConnection()

        const result = await mongoConnection
          .collection("Time")
          .find({ "códigoTime": Number(team.id) }).toArray()

          team.statistics = {
            scoredGoals: result[0]["EstatísticasTime"]["golsFeitos"],
            concededGoals: result[0]["EstatísticasTime"]["golsSofridos"],
            playedMatches: result[0]["EstatísticasTime"]["jogosParticipados"],
          }
      } catch (error) {
        console.log(error)
      }

      return team
    }

    try {
      const result = await postgres.query(`
        SELECT * FROM time
      `)

      return result.map(team => ({
        id: team.id,
        name: team.nome,
      }))
    } catch (error) {
      console.log(error)

      throw new Error("Não foi possível recuperar os times do banco relacional")
    }
  }

  async save () {
    try {
      await postgres.query(
        `INSERT INTO "time"(nome) VALUES ('${this.name}')`
      )
    } catch (error) {
      console.log(error)

      throw new Error("Não foi possível inserir o time no banco de dados relacional")
    }
    
    try {
      const result = await postgres.query(`SELECT MAX(id) FROM "time"`)

      this.id = result[0].max
    } catch (error) {
      console.log(error)

      throw new Error(
        "Não foi possível obter o identificador do time do banco de dados relacional"
      )
    }
    
    try {
      const mongoConnection = await mongo.getConnection()

      await mongoConnection.collection("Time").insertOne({
        "códigoTime": this.id, 
        "EstatísticasTime": {
          "jogosParticipados": 0,
          "golsFeitos": 0,
          "golsSofridos": 0
        }
      })

      this.statistics = {
        playedMatches: 0, 
        concededGoals: 0,
        scoredGoals: 0
      }
    } catch (error) {
      console.log(error)

      throw new Error("Não foi possível armazenar o time no banco de dados de documentos")
    }

    return true 
  }

  async update ({ 
    name, 
    statistics: { playedMatches, scoredGoals, concededGoals } 
  }) {

  }
}
