const express = require("express");
const router = express.Router();
const lectureProgressController = require("../controllers/LectureProgressController");

// Cập nhật tiến độ
router.post("/update", lectureProgressController.updateProgress);

// Lấy tiến độ theo lecture (dùng trong sidebar)
router.get(
  "/by-lecture/:lectureId/by-user/:userId",
  lectureProgressController.getProgressByLecture
);

router.get(
  "/section/:sectionId",
  lectureProgressController.getProgressBySection
);

module.exports = router;
