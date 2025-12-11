const express = require("express");
const router = express.Router();
const controller = require("../controllers/RevenueStatsController");

router.get("/overview", controller.getRevenueStats);

module.exports = router;
