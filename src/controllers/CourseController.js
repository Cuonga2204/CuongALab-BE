const Course = require("../models/CourseModel");
const User = require("../models/UserModel");
const Category = require("../models/CategoryModel");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const { ERRORS } = require("../errors/index");

const createCourse = async (req, res) => {
  try {
    const avatarPath = req.file ? req.file.path : null;

    /* ===== VALIDATE CATEGORY ===== */
    const category = await Category.findById(req.body.category_id);
    if (!category) {
      return errorHandler(res, ERRORS.NOT_FOUND, "Category not found");
    }

    // ❌ không cho gán course vào category cha
    const hasChildren = await Category.exists({
      parent_id: category._id,
    });

    if (hasChildren) {
      return errorHandler(
        res,
        ERRORS.VALIDATION_ERROR,
        "Course must be assigned to a leaf category"
      );
    }

    /* ===== VALIDATE TEACHER ===== */
    const teacher = await User.findById(req.body.teacher_id).select("name");
    if (!teacher) {
      return errorHandler(res, ERRORS.USER_NOT_FOUND, "Teacher not found");
    }

    /* ===== CREATE COURSE ===== */
    const newCourse = await Course.create({
      ...req.body,
      avatar: avatarPath,
      name_teacher: teacher.name,
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
      .populate("category_id", "name parent_id level root_id")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean(); // ⭐ rất quan trọng

    const total = await Course.countDocuments();

    // ✅ MAP category_id → category
    const mappedCourses = courses.map((c) => {
      const { _id, category_id, ...rest } = c;

      return {
        id: _id, // ✅ map id
        ...rest,
        category: category_id
          ? {
              id: category_id._id,
              name: category_id.name,
              parent_id: category_id.parent_id,
              level: category_id.level,
              root_id: category_id.root_id,
            }
          : null,
      };
    });

    return successHandler(res, {
      total,
      page: Number(page),
      limit: Number(limit),
      courses: mappedCourses,
    });
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

const getAllCoursesPublic = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("category_id", "name parent_id level root_id")
      .lean(); // ⭐ rất quan trọng

    const total = await Course.countDocuments();

    // ✅ MAP category_id → category
    const mappedCourses = courses.map((c) => {
      const { _id, category_id, ...rest } = c;

      return {
        id: _id, // ✅ map id
        ...rest,
        category: category_id
          ? {
              id: category_id._id,
              name: category_id.name,
              parent_id: category_id.parent_id,
              level: category_id.level,
              root_id: category_id.root_id,
            }
          : null,
      };
    });

    return successHandler(res, {
      total,
      courses: mappedCourses,
    });
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

const getCoursesByTeacher = async (req, res) => {
  try {
    const courses = await Course.find({
      teacher_id: req.params.teacherId,
    })
      .populate("category_id", "name parent_id level root_id")
      .lean();

    const mappedCourses = courses.map((c) => {
      const { _id, category_id, ...rest } = c;

      return {
        id: _id, // ✅ map id
        ...rest,
        category: category_id
          ? {
              id: category_id._id,
              name: category_id.name,
              parent_id: category_id.parent_id,
              level: category_id.level,
              root_id: category_id.root_id,
            }
          : null,
      };
    });

    return successHandler(res, mappedCourses);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};
const getCourseDetails = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("category_id", "name parent_id level root_id")
      .lean();

    if (!course) {
      return errorHandler(res, ERRORS.COURSE_NOT_FOUND);
    }

    let category = null;

    if (course.category_id) {
      const { _id, ...restCategory } = course.category_id;

      category = {
        id: _id.toString(),
        ...restCategory,
      };
    }

    // eslint-disable-next-line no-unused-vars
    const { category_id, _id, ...rest } = course;

    return successHandler(res, {
      id: _id.toString(), // ✅ course có id
      ...rest,
      category, // ✅ object category chuẩn FE
    });
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return errorHandler(res, ERRORS.COURSE_NOT_FOUND);

    const updates = { ...req.body };

    /* ===== CATEGORY CHECK ===== */
    if (updates.category_id) {
      const category = await Category.findById(updates.category_id);
      if (!category) {
        return errorHandler(res, ERRORS.NOT_FOUND, "Category not found");
      }

      const hasChildren = await Category.exists({
        parent_id: category._id,
      });

      if (hasChildren) {
        return errorHandler(
          res,
          ERRORS.VALIDATION_ERROR,
          "Course must be assigned to a leaf category"
        );
      }
    }

    /* ===== TEACHER ===== */
    if (updates.teacher_id) {
      const teacher = await User.findById(updates.teacher_id).select("name");
      updates.name_teacher = teacher?.name;
    }

    if (req.file) {
      updates.avatar = req.file.path;
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
  getAllCoursesPublic,
  getCoursesByTeacher,
  getCourseDetails,
  updateCourse,
  deleteCourse,
};
