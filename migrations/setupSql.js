const { query } = require("../databases/postgres")
const { QueryFile } = require("pg-promise")

const {join: joinPath} = require("path")

function sql (file) {
    const fullPath = joinPath(__dirname, file) 
    return new QueryFile(fullPath, { minify: true })
}

async function runMigration () {
  try {
    await query("CREATE DATABASE futapostas", "postgres")
  } catch (error) {
    console.log(error)
  } 

  const creationScript = sql("setup.sql")

  try {
    await query(creationScript)
  } catch(e) {
    console.error(e)
  }
}

runMigration()