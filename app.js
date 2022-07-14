const express = require("express")
const bodyParser = require("body-parser")

const betsRoutes = require("./routes/bets")
const gamesRoutes = require("./routes/games")
const playersRoutes = require("./routes/players")
const teamsRoutes = require("./routes/teams")
const usersRoutes = require("./routes/users")

const app = express()

app.use(bodyParser.json())

app.use("/bets", betsRoutes)
app.use("/games", gamesRoutes)
app.use("/players", playersRoutes)
app.use("/teams", teamsRoutes)
app.use("/users", usersRoutes)

app.listen(8080)