const { MongoClient } = require("mongodb")

const getConnection = (dbName = "futapostas") => {
  const url = process.env.MONGO_URL || "mongodb://db:27017/";
  const client = new MongoClient(url);

  try {
    await client.connect();
    console.log("Database connected");
    const db = client.db(dbName)
    return db;
  } catch (e) {
    console.log(e.message);
  }
};

module.exports = { getConnection }