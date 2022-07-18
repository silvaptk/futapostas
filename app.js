const express = require("express")
const bodyParser = require("body-parser")
const dotenv = require("dotenv")

dotenv.config()

const betsRoutes = require("./routes/bets")
const gamesRoutes = require("./routes/games")
const playersRoutes = require("./routes/players")
const teamsRoutes = require("./routes/teams")
const usersRoutes = require("./routes/users")
const depositRoutes = require("./routes/deposit")

const { authenticationMiddleware } = require("./middlewares/auth")

const app = express()

app.use(bodyParser.json())

app.use("/bets", authenticationMiddleware)
app.use("/bets", betsRoutes)

app.use("/games", authenticationMiddleware)
app.use("/games", gamesRoutes)

app.use("/players", authenticationMiddleware)
app.use("/players", playersRoutes)

app.use("/players", authenticationMiddleware)
app.use("/teams", teamsRoutes)

app.use("/users", usersRoutes)
app.use("/deposit", depositRoutes)

app.listen(9876)