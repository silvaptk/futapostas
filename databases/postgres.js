const pgp = require("pg-promise")()

const getConnection = (database = "futapostas") => {
  const databaseConnection = pgp(`postgres://postgres:admin@localhost:5432/${database}`)

  return databaseConnection
}

const query = (query, database) => {
  const connection = getConnection(database)

  return connection.any(query)
}


module.exports = { query }