const teams = require("../dados/times.json")
const { query } = require("../databases/postgres")

const insertTeams = async () => {
  try {
    await query(`
      INSERT INTO time(nome) VALUES
      ${teams.map(team => `('${team.nome}')`).join(", ")}
    `)
  } catch (error) {
    console.log(error)
  }
}

module.exports = insertTeams