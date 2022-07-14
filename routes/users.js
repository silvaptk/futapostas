const express = require("express")

const controller = require("../controllers/users")

const router = express.Router()

router.get("/", controller.getUsers)
router.get("/", controller.getUser)
router.post("/", controller.createUser)
router.put("/", controller.updateUser)
router.delete("/", controller.deleteUser)

module.exports = router 