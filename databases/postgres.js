const pgp = require("pg-promise")()

const db = pgp('postgres://postgres:admin@localhost:5432/ep4');

module.exports = { query: db.any }