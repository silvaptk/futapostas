const pg = require("pg")

const pool = new pg.Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
})


const query = (text, params) => {
  return pool.query(text, params)
}

module.exports = { query }