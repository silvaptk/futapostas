const insertUsers = require("./users")
const insertTeams = require("./teams")
const insertPlayers = require("./players")

const seed = async () => {
  await insertUsers()
  await insertTeams()
  await insertPlayers()

  process.exit()
}

seed()