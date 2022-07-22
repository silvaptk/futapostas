const express = require("express")

const controller = require("../controllers/teams")

const router = express.Router()

router.get("/", controller.getTeams)
router.get("/:id", controller.getTeam)
router.post("/", controller.createTeam)
router.put("/:id", controller.updateTeam)

module.exports = router 