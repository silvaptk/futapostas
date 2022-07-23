const express = require("express")

const controller = require("../controllers/bets")

const router = express.Router()
const {authenticationMiddleware} = require('../middlewares/auth');

router.use("/", authenticationMiddleware)
router.get("/", controller.getBets)
router.get("/:id", controller.getBet)
router.post("/", controller.createBet)

module.exports = router 