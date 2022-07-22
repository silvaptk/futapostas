const express = require("express")

const controller = require("../controllers/games")

const router = express.Router()

router.get("/", controller.getGames)
router.get("/:id", controller.getGame)
router.post("/", controller.createGame)
router.put("/:id/starting-players", controller.updateGameStartingPlayers)
router.post("/:id/add-event", controller.addEvent)
router.post("/:id/finish", controller.finishGame)

module.exports = router 