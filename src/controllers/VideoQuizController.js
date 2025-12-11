const VideoQuiz = require("../models/VideoQuizModel");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const { ERRORS } = require("../errors");

const createQuiz = async (req, res) => {
  try {
    const { lecture_id, time_in_seconds, question, options } = req.body;
    if (!options || options.length !== 4)
      return errorHandler(res, ERRORS.VALIDATION_ERROR, "Cần đủ 4 đáp án");

    const quiz = await VideoQuiz.create({
      lecture_id,
      time_in_seconds,
      question,
      options,
    });
    return successHandler(res, quiz);
  } catch {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR);
  }
};

const getQuizzesByLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const quizzes = await VideoQuiz.find({ lecture_id: lectureId }).sort({
      time_in_seconds: 1,
    });
    return successHandler(res, quizzes);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await VideoQuiz.findByIdAndDelete(id);
    if (!deleted)
      return errorHandler(res, ERRORS.NOT_FOUND, "Không tìm thấy quiz");
    return successHandler(res, deleted);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = { createQuiz, getQuizzesByLecture, deleteQuiz };
