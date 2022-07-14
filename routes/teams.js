const express = require("express")

const controller = require("../controllers/teams")

const router = express.Router()

router.get("/", controller.getTeams)
router.get("/", controller.getTeam)
router.post("/", controller.createTeam)
router.put("/", controller.updateTeam)
router.delete("/", controller.deleteTeam)

module.exports = router 