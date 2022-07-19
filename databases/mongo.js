const { MongoClient } = require("mongodb")

const getConnection = async (databaseName = "futapostas") => {
  const url = `mongodb://localhost:27017/${databaseName}`

  let database;

  try {
    const client = await MongoClient.connect(url)

    database = client.db(databaseName)
  } catch (error) {
    console.log(error)
  }

  return database  
}

module.exports = { getConnection }