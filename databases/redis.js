const getConnection = async () => {
  const USER = process.env.REDIS_USER
  const PASSWORD = process.env.REDIS_PASSWORD
  const HOST = process.env.REDIS_HOST
  const PORT = process.env.REDIS_PORT

  const client = redis.createClient(
    USER &&
      PASSWORD &&
      HOST &&
      PORT && {
        url: `redis://${USER}:${PASSWORD}@${HOST}:${PORT}`,
      }
  )

  client.on("error", (error) => {
    throw new Error(error)
  })

  await client.connect()

  return client
}

const run = async (query) => {
  const connection = await getConnection()

  const result = await connection[query.type](query.key, query.value)

  closeConnection(connection)

  return result 
}

const runWithCallback = async (callback) => {
  const connection = await getConnection()

  await callback(connection)

  closeConnection(connection)
}

const closeConnection = (client) => {
  client.quit()
}

module.exports = { getConnection, run, runWithCallback, closeConnection }