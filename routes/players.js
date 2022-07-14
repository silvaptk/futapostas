const express = require("express")

const controller = require("../controllers/players")

const router = express.Router()

router.get("/", controller.getPlayers)
router.get("/", controller.getPlayer)
router.post("/", controller.createPlayer)
router.put("/", controller.updatePlayer)
router.delete("/", controller.deletePlayer)

module.exports = router 