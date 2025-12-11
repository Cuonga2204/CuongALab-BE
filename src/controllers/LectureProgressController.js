const LectureProgress = require("../models/LectureProgressModel");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const { ERRORS } = require("../errors/index");

const updateProgress = async (req, res) => {
  try {
    const {
      user_id,
      course_id,
      section_id,
      lecture_id,
      watched_seconds,
      percentage,
    } = req.body;

    let progress = await LectureProgress.findOne({
      user_id,
      lecture_id,
    });

    if (!progress) {
      progress = await LectureProgress.create({
        user_id,
        course_id,
        section_id,
        lecture_id,
        watched_seconds,
        percentage_watched: percentage,
        is_completed: percentage >= 95,
      });
    } else {
      progress.watched_seconds = Math.max(
        progress.watched_seconds,
        watched_seconds
      );

      // watched_seconds: luôn là vị trí cuối cùng user đang xem
      progress.watched_seconds = watched_seconds;

      // percentage_watched: luôn là phần trăm cao nhất
      progress.percentage_watched = Math.max(
        progress.percentage_watched,
        percentage
      );

      progress.is_completed = progress.percentage_watched >= 95;

      await progress.save();
    }

    return successHandler(res, progress);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

const getProgressByLecture = async (req, res) => {
  try {
    const { lectureId, userId } = req.params;

    const progress = await LectureProgress.findOne({
      lecture_id: lectureId,
      user_id: userId,
    });

    return successHandler(res, progress || null);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

const getProgressBySection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { userId } = req.query;

    const progressList = await LectureProgress.find({
      section_id: sectionId,
      user_id: userId,
    }).select("lecture_id percentage percentage_watched");

    const mapped = progressList.map((item) => ({
      lecture_id: item.lecture_id,
      percentage: item.percentage_watched || 0,
    }));

    return successHandler(res, mapped);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  updateProgress,
  getProgressByLecture,
  getProgressBySection,
};
