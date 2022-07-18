const pgp = require("pg-promise")()

global.postgresConnections = {}

const getConnection = (database = "futapostas") => {
  if (global.postgresConnections[database]) {
    return global.postgresConnections[database]
  }

  global.postgresConnections[database] = pgp(
    `postgres://postgres:admin@localhost:5432/${database}`
  )

  return global.postgresConnections[database]
}

const query = (query, database) => {
  const connection = getConnection(database)

  return connection.any(query)
}


module.exports = { query }