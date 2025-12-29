const UserCourse = require("../models/UserCourseModel");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const { ERRORS } = require("../errors/index");
const Course = require("../models/CourseModel");
const User = require("../models/UserModel");
const Category = require("../models/CategoryModel");
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
      .populate({
        path: "course_id",
        populate: {
          path: "category_id",
          select: "name parent_id level root_id",
        },
      })
      .select("-__v")
      .lean();

    const courses = userCourses.map((uc) => {
      const course = uc.course_id || {};
      const categoryDoc = course.category_id || null;

      let category = null;
      if (categoryDoc) {
        const { _id, ...restCategory } = categoryDoc;
        category = {
          id: _id.toString(),
          ...restCategory,
        };
      }

      return {
        id: uc._id.toString(), // UserCourse id
        status: uc.status,
        userId: uc.user_id.toString(),
        courseId: course._id?.toString(),

        // ===== COURSE FIELDS =====
        title: course.title,
        avatar: course.avatar,
        price_old: course.price_old,
        price_current: course.price_current,
        name_teacher: course.name_teacher,
        rating_average: course.rating_average,
        overview: course.overview,
        description: course.description,
        student_count: course.student_count,
        total_sections: course.total_sections,
        total_lectures: course.total_lectures,
        total_video_duration: course.total_video_duration,
        discount_percent: course.discount_percent,
        discount_tag: course.discount_tag,
        is_discount_active: course.is_discount_active,
        sale_start: course.sale_start,
        sale_end: course.sale_end,

        // ===== 🔥 CATEGORY OBJECT =====
        category, // { id, name, level, root_id }
      };
    });

    return successHandler(res, courses);
  } catch (error) {
    console.error(error);
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
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

//recommend

const recommendCoursesByUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    /* ===============================
       1. LẤY COURSE USER ĐÃ MUA
    =============================== */
    const userCourses = await UserCourse.find({ user_id })
      .populate({
        path: "course_id",
        populate: {
          path: "category_id",
          select: "root_id",
        },
      })
      .lean();

    if (!userCourses.length) {
      return successHandler(res, []);
    }

    /* ===============================
       2. LẤY COURSE IDS ĐÃ MUA
    =============================== */
    const purchasedCourseIds = userCourses
      .map((uc) => uc.course_id?._id)
      .filter(Boolean);

    /* ===============================
       3. LẤY ROOT CATEGORY IDS
    =============================== */
    const rootIds = [
      ...new Set(
        userCourses
          .map((uc) => uc.course_id?.category_id?.root_id?.toString())
          .filter(Boolean)
      ),
    ];

    if (!rootIds.length) {
      return successHandler(res, []);
    }

    /* ===============================
       4. LẤY CATEGORY CÙNG ROOT
    =============================== */
    const relatedCategories = await Category.find({
      root_id: { $in: rootIds },
    }).select("_id");

    const relatedCategoryIds = relatedCategories.map((c) => c._id);

    /* ===============================
       5. LẤY COURSE RECOMMEND
    =============================== */
    const recommends = await Course.find({
      _id: { $nin: purchasedCourseIds }, // ❌ chưa mua
      category_id: { $in: relatedCategoryIds },
    })
      .limit(8)
      .populate("category_id");

    return successHandler(res, recommends);
  } catch (error) {
    console.error(error);
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  enrollCourse,
  updateStatus,
  getCoursesByUser,
  getUsersByCourse,
  deleteEnroll,
  recommendCoursesByUser,
};
