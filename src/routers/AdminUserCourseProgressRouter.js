const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/AdminUserCourseProgressController");

// Danh sách user mua khóa
router.get("/course/:courseId/users", ctrl.getUsersProgressOfCourse);

// Danh sách khóa user đã mua
router.get("/user/:userId/courses", ctrl.getUserCoursesWithProgress);

// Tính lại % tiến độ học
router.get("/compute/:userCourseId", ctrl.computeUserCourseProgress);

// Lấy progress tất cả lecture trong khóa
router.get("/lectures/:userId/:courseId", ctrl.getLectureProgressOfCourse);
router.get("/all-users-course", ctrl.getAllUsersWithCourseInfo);

module.exports = router;
