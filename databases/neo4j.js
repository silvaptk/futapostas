const getSession = () => {
  const URI = process.env.NEO4J_URI
  const USER = process.env.NEO4J_USER
  const PASSWORD = process.env.NEO4J_PASSWORD

  if (!USER || !PASSWORD) {
    throw new Error("Sem credenciais para estabelecer conexão com Neo4J")
  }

  const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD))

  return driver.session()
}

const closeSession = (session) => {

}

const run = (query) => {
  const session = getSession()

  await session.run(query)

  closeSession(session)
}

const runWithCallback = (callback) => {
  const session = getSession()

  await callback(session.run)

  closeSession(session)
}

module.exports = { getSession, closeSession, run, runWithCallback }