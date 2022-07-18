const neo4j = require('neo4j-driver')

const getSession = () => {
  const NEO4J_URL = process.env.NEO4J_URL
  const USER = process.env.NEO4J_USER
  const PASSWORD = process.env.NEO4J_PASSWORD

  const driver = neo4j.driver(NEO4J_URL)

  return driver.session()
}

const closeSession = (session) => {

}

const run = async (query) => {
  const session = getSession()

  await session.run(query)

  closeSession(session)
}

const runWithCallback = async (callback) => {
  const session = getSession()

  await callback(session.run)

  closeSession(session)
}

module.exports = { getSession, closeSession, run, runWithCallback }