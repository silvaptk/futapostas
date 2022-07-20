const express = require("express")

const controller = require("../controllers/users")
const { authenticationMiddleware } = require("../middlewares/auth")

const router = express.Router()

router.post("/auth", controller.authUser)
router.post("/", controller.createUser)
router.use("/", authenticationMiddleware)
router.get("/", controller.getUser)
router.put("/", controller.updateUser)

module.exports = router 