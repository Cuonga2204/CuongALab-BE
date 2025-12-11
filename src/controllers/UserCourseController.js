const UserCourse = require("../models/UserCourseModel");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const { ERRORS } = require("../errors/index");
const Course = require("../models/CourseModel");
const User = require("../models/UserModel");

// 📌 1. User ghi danh vào khóa học
const enrollCourse = async (req, res) => {
  try {
    const { user_id, course_id } = req.body;

    const user = await User.findById(user_id);
    const course = await Course.findById(course_id);

    if (!user) return errorHandler(res, ERRORS.USER_NOT_FOUND);
    if (!course) return errorHandler(res, ERRORS.COURSE_NOT_FOUND);

    const existing = await UserCourse.findOne({ user_id, course_id });
    if (existing) {
      return errorHandler(res, ERRORS.USER_ALREADY_ENROLL);
    }

    const newEnroll = await UserCourse.create({ user_id, course_id });
    return successHandler(res, newEnroll);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

// 📌 2. Cập nhật trạng thái học (VD: hoàn thành)
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params; // id của userCourse
    const { status } = req.body;

    const userCourse = await UserCourse.findById(id);
    if (!userCourse) return errorHandler(res, ERRORS.USER_COURSE_NOT_FOUND);

    userCourse.status = status;
    await userCourse.save();

    return successHandler(res, userCourse);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

// 📌 3. Lấy danh sách khóa học của 1 user
const getCoursesByUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    const userCourses = await UserCourse.find({ user_id })
      .populate("course_id")
      .select("-__v");

    // 🔹 Chuyển dữ liệu thành dạng phẳng
    const courses = userCourses.map((uc) => {
      const course = uc.course_id?.toObject?.() || {};
      return {
        id: uc._id, // id của bản ghi UserCourse
        status: uc.status,
        userId: uc.user_id,
        courseId: course._id, // ✅ ID khóa học thật
        ...course, // gộp toàn bộ field của course_id
      };
    });

    return successHandler(res, courses);
  } catch {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR);
  }
};

// 📌 4. Lấy danh sách user trong 1 khóa học
const getUsersByCourse = async (req, res) => {
  try {
    const { course_id } = req.params;

    const users = await UserCourse.find({ course_id })
      .populate("user_id")
      .select("-__v");

    return successHandler(res, users);
  } catch {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR);
  }
};

// 📌 5. Xóa ghi danh (user rời khỏi khóa học)
const deleteEnroll = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await UserCourse.findByIdAndDelete(id);
    if (!deleted) return errorHandler(res, ERRORS.USER_COURSE_NOT_FOUND);

    return successHandler(res, deleted);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  enrollCourse,
  updateStatus,
  getCoursesByUser,
  getUsersByCourse,
  deleteEnroll,
};
