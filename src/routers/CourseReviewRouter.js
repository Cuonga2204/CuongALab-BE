const express = require("express");
const router = express.Router();
const controller = require("../controllers/CourseReviewController");

/* ===== ADMIN ===== */
router.get("/review-form", controller.getReviewForm);
router.put("/review-form", controller.updateReviewForm);
router.get("/", controller.getAllCourseReviews);

/* ===== USER ===== */
router.post("/:courseId/review", controller.submitCourseReview);
router.get("/:courseId/my-review", controller.getMyCourseReview);

module.exports = router;
