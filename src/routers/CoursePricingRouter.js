const express = require("express");
const router = express.Router();

const pricingController = require("../controllers/CoursePricingController");

router.get("/admin/all", pricingController.getAllPricing);
router.put("/update", pricingController.updatePricing);
router.get("/course/:courseId", pricingController.getPricingByCourse);

// Tracking (optional)
router.post("/track/view/:courseId", pricingController.increaseViewCount);
router.post(
  "/track/purchase/:courseId",
  pricingController.increasePurchasedCount
);

module.exports = router;
