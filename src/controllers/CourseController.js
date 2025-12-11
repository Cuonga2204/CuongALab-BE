const Course = require("../models/CourseModel");
const User = require("../models/UserModel");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const { ERRORS } = require("../errors/index");

const createCourse = async (req, res) => {
  try {
    const avatarPath = req.file ? req.file.path : null;

    // ⭐ Lấy tên teacher từ DB
    const teacher = await User.findById(req.body.teacher_id).select("name");

    if (!teacher)
      return errorHandler(res, ERRORS.USER_NOT_FOUND, "Teacher not found");

    const newCourse = await Course.create({
      ...req.body,
      avatar: avatarPath,
      name_teacher: teacher.name, // ⭐ save vào DB
    });

    return successHandler(res, newCourse);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};
const getAllCourses = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    const courses = await Course.find()
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Course.countDocuments();

    return successHandler(res, {
      total,
      page: Number(page),
      limit: Number(limit),
      courses,
    });
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

const getCoursesByTeacher = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;

    const courses = await Course.find({ teacher_id: teacherId });

    return successHandler(res, courses);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

const getCourseDetails = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return errorHandler(res, ERRORS.COURSE_NOT_FOUND);
    return successHandler(res, course);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return errorHandler(res, ERRORS.COURSE_NOT_FOUND);

    const updates = { ...req.body };
    if (updates.teacher_id) {
      const teacher = await User.findById(updates.teacher_id).select("name");
      updates.name_teacher = teacher?.name;
    }

    if (req.file) {
      updates.avatar = req.file.path; // secure_url của Cloudinary
      // ví dụ: https://res.cloudinary.com/.../abc123.jpg
    }

    Object.assign(course, updates);
    await course.save();

    return successHandler(res, course);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return errorHandler(res, ERRORS.COURSE_NOT_FOUND);

    await Course.findByIdAndDelete(req.params.id);
    return successHandler(res, course);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCoursesByTeacher,
  getCourseDetails,
  updateCourse,
  deleteCourse,
};
