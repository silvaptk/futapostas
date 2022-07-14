const express = require("express")

const controller = require("../controllers/games")

const router = express.Router()

router.get("/", controller.getGames)
router.get("/", controller.getGame)
router.post("/", controller.createGame)
router.put("/", controller.updateGame)
router.delete("/", controller.deleteGame)

module.exports = router 