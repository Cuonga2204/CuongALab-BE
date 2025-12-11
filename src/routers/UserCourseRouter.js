// routes/UserCourseRouter.js
const express = require("express");
const userCourseController = require("../controllers/UserCourseController");
const {
  authUserMiddleware,
  // authAdminMiddleware,
} = require("../middleware/Auth.middleware");
const { validateRequest } = require("../middleware/validateRequest.middleware");
const router = express.Router();
const { UserCourseSchema } = require("../validations/userCourse/index");
// Ghi danh vào khóa học
router.post(
  "/enroll",
  validateRequest(UserCourseSchema, "body"),
  userCourseController.enrollCourse
);

// Cập nhật trạng thái học
router.put(
  "/update-status/:id",
  // authUserMiddleware,
  validateRequest(UserCourseSchema, "body"),
  userCourseController.updateStatus
);

// Lấy danh sách khóa học của user
router.get(
  "/user/:user_id",
  // authUserMiddleware,
  userCourseController.getCoursesByUser
);

// Lấy danh sách user của 1 khóa học
router.get(
  "/course/:course_id",
  // authAdminMiddleware,
  userCourseController.getUsersByCourse
);

// Xóa ghi danh
router.delete("/:id", authUserMiddleware, userCourseController.deleteEnroll);

module.exports = router;
