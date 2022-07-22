const postgres = require("../databases/postgres")
const mongo = require("../databases/mongo")
const redis = require("../databases/redis")
const { ReviewsPageSize } = require("../util/constants")
const Review = require("./review")

module.exports = class Team {
  constructor (name) {
    this.name = name
  }

  static async get (id) {
    if (id) {
      let team = { id: Number(id) }
      let teamReviews = 0

      try {
        const result = await postgres.query(`
          SELECT  
            t.nome AS team_name,
            t.numero_de_resenhas AS reviews,
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
        teamReviews = Number(result[0].reviews)
      } catch (error) {
        console.log(error)

        throw new Error("Não foi possível obter os dados do time do banco relacional")
      }

      try {
        const mongoConnection = await mongo.getConnection()

        const result = await mongoConnection
          .collection("Time")
          .findOne({ "códigoTime": Number(team.id) })

        team.statistics = {
          scoredGoals: result["EstatísticasTime"]["golsFeitos"],
          concededGoals: result["EstatísticasTime"]["golsSofridos"],
          playedMatches: result["EstatísticasTime"]["jogosParticipados"],
        }
      } catch (error) {
        console.log(error)
      }

      if (teamReviews) {
        try {
          const lastReviewsPage = Math.floor(teamReviews / ReviewsPageSize) + 1

          team.lastReviews = JSON
            .parse(await redis.get(
              `team-${team.id}-reviews-${lastReviewsPage}`
            ))
            .map(item => {
              const review = new Review(
                item["comentário"], 
                item["tipo"], 
                item["referência"],
                item["códigoUsuário"]
              )

              review.date = item["data"]

              return review 
            })
        } catch (error) {
          console.log(error)
        }
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
        `INSERT INTO "time"(nome, numero_de_resenhas) VALUES ('${this.name}', 0)`
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

  static async update (id, newTeam) {
    try {
      await postgres.query(`
        UPDATE 
          time 
        SET ${
          Object
            .keys(newTeam)
            .map(key => `${fieldMap[key]} = '${newTeam[key]}'`)
            .join(", ")
        }
        WHERE id = ${id} 
      `)
    } catch (error) {
      console.log(error)
    } 

    return await this.get(id)
  }
}

const fieldMap = {
  name: "nome"
}