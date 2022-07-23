const neo4j = require('neo4j-driver')

const getSession = () => {
  const driver = neo4j.driver("neo4j://localhost")

  return driver.session()
}

const closeSession = (session) => {
  session.close()
}

const run = async (query) => {
  const session = getSession()

  const result = await session.run(query)

  closeSession(session)

  return result
}

const runWithCallback = async (callback) => {
  const session = getSession()

  await callback(session)

  closeSession(session)
}

module.exports = { getSession, closeSession, run, runWithCallback }