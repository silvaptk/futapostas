const express = require("express")

const router = express.Router()
const controller = require("../controllers/deposits")

router.get("/", controller.getDeposits)
router.post("/", controller.createDeposit)

module.exports = router