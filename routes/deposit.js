const express = require('express');

const router = express.Router();
const controller = require("../controllers/deposit");

const {authenticationMiddleware} = require('../middlewares/auth');

router.use("/", authenticationMiddleware);
router.post("/", controller.createDeposit);

module.exports = router