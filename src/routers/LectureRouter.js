const express = require("express");
const router = express.Router();
const lectureController = require("../controllers/LectureController");
const uploadVideo = require("../middleware/uploadVideo.middleware");
// === CRUD LECTURE ===
router.post(
  "/create",
  uploadVideo.single("video"),
  lectureController.createLecture
);
router.get("/section/:sectionId", lectureController.getLecturesBySection);
router.get("/:id", lectureController.getLectureDetail);
router.put(
  "/update/:id",
  uploadVideo.single("video"),
  lectureController.updateLecture
);
router.delete("/delete/:id", lectureController.deleteLecture);
router.put("/reorder", lectureController.reorderLectures);
router.get("/stream/:id", lectureController.streamLecture);
module.exports = router;
