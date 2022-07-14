const express = require("express")

const controller = require("../controllers/bets")

const router = express.Router()

router.get("/", controller.getBets)
router.get("/", controller.getBet)
router.post("/", controller.createBet)
router.put("/", controller.updateBet)
router.delete("/", controller.deleteBet)

module.exports = router 