const redis = require("redis")

const getConnection = async () => {
  const HOST = process.env.REDIS_HOST
  const PORT = process.env.REDIS_PORT

  const client = redis.createClient({
    socket: {
      host: HOST,
      port: PORT
    }
  })

  client.on("error", (error) => {
    console.log(error)
    throw new Error(error)
  })

  await client.connect()

  return client
}

const get = async (key) => {
  const connection = await getConnection()

  const result = await connection.get(key)

  closeConnection(connection)

  return result 
}

const set = async (key, value) => {
  const connection = await getConnection()

  const result = await connection.set(key, value)

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

module.exports = { getConnection, get, set, closeConnection }