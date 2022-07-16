const { query: postgresQuery } = require("../databases/postgres")
const { get: getFromRedis, set: setOnRedis } = require("../databases/redis")
const { run: runOnNeo4j } = require("../databases/neo4j")
const { slugToCamelCase } = require("../util/formatting")

module.exports = class User {
  constructor(name, email, password, personalIdentifier, profilePrivacy) {
    this.name = name 
    this.email = email 
    this.password = password 
    this.personalIdentifier = personalIdentifier 
    this.profilePrivacy = profilePrivacy
  }

  static async get ({ email, password }) {
    const result = await getFromRedis(email)

    const parsedUser = JSON.parse(result)

    if (parsedUser.senha !== password) {
      return false 
    }

    return parsedUser
  } 

  async save () {
    try {
      await postgresQuery(
        `
          INSERT INTO 
            usuario (id, nome, email, senha, cpf, privacidade_do_perfil, carteira) 
          VALUES 
            ((SELECT MAX(id) FROM usuario) + 1, $1, $2, $3, $4, $5, 0.0)
        `,
        [this.name, this.email, this.password, this.identifier, this.profilePrivacy]
      )
    } catch (error) {
      return false 
    }
    
    try {
      await postgresQuery(`SELECT MAX(id) FROM usuario`)
    } catch (error) {
      return false 
    }

    this.id = result.rows[0].max
    
    try {
      await setOnRedis(email, JSON.stringify(this))
    } catch (error) {
      return false 
    }

    try {
      await runOnNeo4j(
        `CREATE (:Usuaŕio { email: "${this.email}" })`
      )
    } catch (error) {
      console.log(error)

      return false 
    }

    return true 
  }

  async update (newData) {
    if (!this.id) {
      return false 
    }

    delete newData.email

    const filteredData = {}

    for (const key in newData) {
      if (![undefined, null].includes(newData[key])) {
        filteredData[key] = newData[key]
      }
    }

    const fieldMap = {
      name: "nome", password: "senha", personal_identifier: "cpf", profile_privacy: "privacidade_do_perfil"
    }

    let result 

    const query = 
      `
        UPDATE usuario SET 
          ${Object.keys(filteredData).map(
            (key, index) => `${fieldMap[key]} = $${index + 1}`
          ).join(",\n").trim()}
        WHERE id = $${Object.keys(filteredData).length + 1}
      `

    try {
      result = await postgresQuery(
        query,
        Object.values(filteredData).concat(this.id)
      )

      for (const key in filteredData) {
        this[slugToCamelCase(key)] = filteredData[key]
      }
    } catch (error) {
      return false    
    }

    try {
      result = await setOnRedis(
        this.email,
        JSON.stringify({
          nome: this.name,
          email: this.email,
          senha: this.password,
          carteira: this.wallet,
          privacidade_do_perfil: this.profilePrivacy,
          id: this.id,
          cpf: this.personalIdentifier,
        })
      )
    } catch (error) {
      return false 
    }
    
    return result 
  }
}