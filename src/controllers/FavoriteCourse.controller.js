const FavoriteCourse = require("../models/FavoriteCourseModel");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const { ERRORS } = require("../errors/index");

/**
 * @desc Lấy danh sách khóa học yêu thích của user
 * @route GET /api/favorites/:userId
 */
const getFavoritesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const favorites = await FavoriteCourse.find({ userId })
      .populate("courseId")
      .lean();

    return successHandler(res, favorites);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @desc Thêm hoặc xóa khóa học yêu thích (toggle)
 * @route POST /api/favorites/toggle
 * @body { userId, courseId }
 */
const toggleFavorite = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    if (!userId || !courseId) {
      return errorHandler(res, ERRORS.INVALID_PAYLOAD);
    }

    const existing = await FavoriteCourse.findOne({ userId, courseId });

    // Nếu đã tồn tại → xóa
    if (existing) {
      await FavoriteCourse.findByIdAndDelete(existing._id);
      return successHandler(res, { isFavorite: false });
    }

    // Nếu chưa có → thêm mới
    const favorite = await FavoriteCourse.create({ userId, courseId });
    return successHandler(res, { isFavorite: true, data: favorite });
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  getFavoritesByUser,
  toggleFavorite,
};
