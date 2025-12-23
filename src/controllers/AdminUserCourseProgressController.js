const UserCourse = require("../models/UserCourseModel");
// const Course = require("../models/CourseModel");
const LectureProgress = require("../models/LectureProgressModel");
const Lecture = require("../models/LectureModel");
const User = require("../models/UserModel");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const { ERRORS } = require("../errors");
const { USER_COURSE_STATUS } = require("../constants/userCourse.constants");
const mongoose = require("mongoose");

// ==============================
// 1) Tính tiến độ học (%)
// ==============================
const computeUserCourseProgress = async (req, res) => {
  try {
    const { userCourseId } = req.params;

    const userCourse = await UserCourse.findById(userCourseId);
    if (!userCourse) return errorHandler(res, ERRORS.USER_COURSE_NOT_FOUND);

    const { user_id, course_id } = userCourse;

    const allLectures = await Lecture.find({ course_id });
    const totalLectures = allLectures.length || 1;

    const userObj = new mongoose.Types.ObjectId(user_id);
    const courseObj = new mongoose.Types.ObjectId(course_id);

    const completedCount = await LectureProgress.countDocuments({
      user_id: userObj,
      course_id: courseObj,
      is_completed: true,
    });

    const progress = Math.round((completedCount / totalLectures) * 100);

    // Lưu lại
    userCourse.progress = progress;
    userCourse.last_access_at = new Date();
    await userCourse.save();

    return successHandler(res, {
      progress,
      totalLectures,
      completedCount,
    });
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

// ==============================
// 2) Lấy chi tiết tiến độ lecture
// ==============================
const getLectureProgressOfCourse = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    const progressList = await LectureProgress.find({
      user_id: userId,
      course_id: courseId,
    });

    return successHandler(res, progressList);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

// ==============================
// 3) Danh sách user trong 1 khóa
// ==============================
const getUsersProgressOfCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const list = await UserCourse.find({ course_id: courseId })
      .populate("user_id")
      .populate("course_id");

    return successHandler(res, list);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

// ==============================
// 4) Danh sách khóa học user đã mua
// ==============================
const getUserCoursesWithProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    const list = await UserCourse.find({ user_id: userId }).populate(
      "course_id"
    );

    const result = [];

    for (const uc of list) {
      const courseObj = uc.course_id._id;

      // Lấy danh sách lecture của course
      const lectures = await Lecture.find({ course_id: courseObj });
      const totalLectures = lectures.length || 1;

      // Lấy progress từng lecture
      const progressList = await LectureProgress.find({
        user_id: userId, // string
        course_id: String(courseObj), // convert ObjectId -> string
      });

      let totalPercent = 0;

      for (const lp of progressList) {
        totalPercent += lp.percentage_watched || 0;
      }

      const progress =
        totalLectures > 0 ? Math.round(totalPercent / totalLectures) : 0;

      // ---- Update userCourse ----
      uc.progress = progress;
      uc.status =
        progress >= 95
          ? USER_COURSE_STATUS.COMPLETED
          : USER_COURSE_STATUS.IN_PROGRESS;

      await uc.save();

      result.push({
        id: uc.id,
        progress,
        status: uc.status,
        course_id: {
          id: uc.course_id.id,
          title: uc.course_id.title,
          avatar: uc.course_id.avatar,
        },
      });
    }

    return successHandler(res, result);
  } catch (err) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, err.message);
  }
};

// Lấy tất cả user và thống kê khóa học + tiến độ
const getAllUsersWithCourseInfo = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    const userList = [];

    for (const user of users) {
      const enrollments = await UserCourse.find({ user_id: user.id });

      const totalCourses = enrollments.length;
      let completed = 0;
      let inProgress = 0;

      // tính tiến độ chung
      let totalPercent = 0;
      let countedCourses = 0;

      for (const uc of enrollments) {
        const progress = await LectureProgress.find({
          user_id: user.id,
          course_id: uc.course_id,
        });

        if (progress.length > 0) {
          const courseAvg =
            progress.reduce((sum, p) => sum + p.percentage_watched, 0) /
            progress.length;

          totalPercent += courseAvg;
          countedCourses++;

          if (courseAvg >= 95) completed++;
          else inProgress++;
        }
      }

      const overallProgress =
        countedCourses > 0 ? Math.round(totalPercent / countedCourses) : 0;

      userList.push({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        totalCourses,
        completed,
        inProgress,
        overallProgress,
      });
    }

    return successHandler(res, userList);
  } catch (err) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, err.message);
  }
};

module.exports = {
  computeUserCourseProgress,
  getLectureProgressOfCourse,
  getUsersProgressOfCourse,
  getUserCoursesWithProgress,
  getAllUsersWithCourseInfo,
};
