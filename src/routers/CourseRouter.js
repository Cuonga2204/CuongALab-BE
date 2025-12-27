const express = require("express");
const router = express.Router();
const courseController = require("../controllers/CourseController");
const uploadImage = require("../middleware/uploadImage.middleware");
// const { authAdminMiddleware } = require("../middleware/Auth.middleware");

router.post(
  "/create",
  // authAdminMiddleware,
  uploadImage.single("avatar"),
  courseController.createCourse
);

router.get("/get-all", courseController.getAllCourses);
router.get("/get-all/public", courseController.getAllCoursesPublic);
router.get("/get-detail/:id", courseController.getCourseDetails);

router.get("/teacher/:teacherId", courseController.getCoursesByTeacher);

router.put(
  "/update/:id",
  // authAdminMiddleware,
  uploadImage.single("avatar"),
  courseController.updateCourse
);

router.delete(
  "/delete/:id",
  // authAdminMiddleware,
  courseController.deleteCourse
);

module.exports = router;
