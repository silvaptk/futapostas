const { query: postgresQuery } = require("../databases/postgres")
const { get: getFromRedis, set: setOnRedis } = require("../databases/redis")
const { run: runOnNeo4j } = require("../databases/neo4j")
const { slugToCamelCase } = require("../util/formatting")

module.exports = class User {
  constructor(name, email, password, personalIdentifier, profilePrivacy, wallet) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.personalIdentifier = personalIdentifier;
    this.profilePrivacy = profilePrivacy;
    this.wallet = wallet;
  }

  static async get ({ email, password, ids }) {
    if (ids) {
      try {
        const result = await postgresQuery(
          `SELECT * FROM usuario WHERE id IN (${ids.join(", ")})`
        )

        return result.map(item => ({
          id: item.id,
          name: item.nome,
          email: item.email,
          personalIdentifier: item.cpf,
          profilePrivacy: item.privacidade_do_perfil,
          wallet: item.carteira
        }))
      } catch (error) {
        console.log(error)

        throw new Error("Registro não encontrado no banco de dados relacional")
      }
    } else {
      const storedPassword = await getFromRedis(email)

      console.log(storedPassword)

      if (storedPassword !== password) {
        throw new Error("E-mail ou senha incorretos")
      }

      try {
        const result = await postgresQuery(
          `SELECT * FROM usuario WHERE email = '${email}'`
        )

        return result[0]
      } catch (error) {
        console.log(error)

        throw new Error("Registro não encontrado no banco de dados relacional")
      }
    }
  }

  async save () {
    try {
      await postgresQuery(
        `
          INSERT INTO 
            usuario (nome, email, cpf, privacidade_do_perfil, carteira)
          VALUES 
            (
              '${this.name}', 
              '${this.email}', 
              '${this.personalIdentifier}', 
              '${this.profilePrivacy}', 
              0.0
            )
        `
      )
    } catch (error) {
      console.log(error);
      return false
    }
    
    try {
      const result = await postgresQuery(`SELECT MAX(id) FROM usuario`)
      this.id = result[0].max;
    } catch (error) {
      console.log(error);
      return false;
    }


    try {
      await setOnRedis(this.email, this.password)
    } catch (error) {
      console.log(error);
      return false;
    }

    try {
      await runOnNeo4j(
        `CREATE (:Usuário { Email: "${this.email}" })`
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

  static async updateWalletByEmail(email, newValue) {
    const usuario = await postgresQuery(`SELECT * FROM Usuario u WHERE u.email=\'${email}\'`);
    postgresQuery(`UPDATE Usuario SET carteira = ${usuario[0].carteira + newValue} WHERE email = \'${email}\'`);
  }
  static async getWalletByEmail(email) {
    return (await postgresQuery(`SELECT * FROM Usuario u WHERE u.email=\'${email}\'`))[0].carteira;
  }
}