const users = require("../dados/usuarios.json")
const postgres = require("../databases/postgres")
const redis = require("../databases/redis")
const neo4j = require("../databases/neo4j")
const { getConnection: getMongoConnection } = require("../databases/mongo")

const insertUsers = async () => {
  try {
    await postgres.query(`
      INSERT INTO 
        usuario(nome, email, carteira, privacidade_do_perfil, cpf) 
      VALUES
        ${users.map(user => [
          `('${user.nome}'`,
          `'${user.email}'`,
          `${user.carteira}`,
          `${user.privacidade_do_perfil}`,
          `'${user.cpf}')`,
        ]).join(", ")}
    `)
  } catch (error) {
    console.log(error)
  }

  try {
    for (const user of users) {
      await redis.set(user.email, user.senha)
    }
  } catch (error) {
    console.log(error)
  }

  try {
    for (const user of users) {
      await neo4j.run(`
        CREATE (:Usuário { Email: "${user.email}" })
      `)
    }
  } catch (error) {
    console.log(error)
  }

  try {
    const mongo = await getMongoConnection()

    await mongo
      .collection("Usuário")
      .insertMany(users.map(user => ({ email: user.email })))
  } catch (error) {
    console.log(error)
  }
}

module.exports = insertUsers