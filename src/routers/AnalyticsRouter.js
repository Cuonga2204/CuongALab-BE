const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/RevenueStatsController");

router.get("/overview", analyticsController.getOverview);
router.get("/revenue-chart", analyticsController.getRevenueChart);

module.exports = router;
