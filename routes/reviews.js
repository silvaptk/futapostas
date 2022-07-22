const express = require("express")

const controller = require("../controllers/reviews")

const router = express.Router()

router.post("/", controller.createReview)
router.put("/:id", controller.updateReview)
router.delete("/:id", controller.deleteReview)

module.exports = router 