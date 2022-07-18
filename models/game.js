const { query: postgresQuery } = require("../databases/postgres")
const { run: runOnNeo4j } = require("../databases/neo4j")
const { getConnection: getMongoConnection } = require("../databases/mongo")

module.exports = class Game {
  constructor(local, dataHorario, timeA, timeB) {
    this.local = local;
    this.dataHorario = dataHorario;
    this.timeA = timeA;
    this.timeB = timeB;
  }

  async save () {
    try {
      const query = `
        INSERT INTO jogo(timea, timeb, data_horario, local, numero_de_resenhas)
        VALUES (
          ${this.timeA},
          ${this.timeB},
          '${this.dataHorario}',
          '${this.local}',
          0
        )
      `
      
      await postgresQuery(query)
    } catch (error) {
      console.log(error)

      return false 
    }

    try {
      const result = await postgresQuery(`
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
      await runOnNeo4j(`
        CREATE (:Jogo { Id: ${this.id}, Data: "${this.dataHorario}" })
      `)
    } catch (error) {
      console.log(error)

      return false 
    }

    try {
      const mongo = await getMongoConnection()

      mongo.collection("Jogo").insertOne({
        "códigoJogo": this.id 
      })
    } catch (error) {
      console.log(error)
    }

    return true
  }
}
