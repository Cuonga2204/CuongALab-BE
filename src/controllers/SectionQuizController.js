const SectionQuiz = require("../models/SectionQuizModel");
const SectionQuizQuestion = require("../models/SectionQuizQuestionModel");
const SectionQuizResult = require("../models/SectionQuizResultModel");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const { ERRORS } = require("../errors/index");

/**
 * CREATE QUIZ
 */
const createQuiz = async (req, res) => {
  try {
    const { section_id } = req.body;

    const count = await SectionQuiz.countDocuments({ section_id });

    req.body.position_in_section = count + 1; // Auto increase

    const newQuiz = await SectionQuiz.create(req.body);

    return successHandler(res, newQuiz);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * CREATE QUESTION (with options inside)
 */
const createQuestion = async (req, res) => {
  try {
    const newQuestion = await SectionQuizQuestion.create(req.body);

    return successHandler(res, newQuestion);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * GET QUIZ + QUESTIONS BY SECTION
 */
const getQuizBySection = async (req, res) => {
  try {
    const { sectionId } = req.params;

    // Lấy tất cả quiz trong section
    const quizzes = await SectionQuiz.find({ section_id: sectionId }).sort({
      position_in_section: 1,
    });

    if (!quizzes.length) return successHandler(res, []);

    const quizzesWithQuestions = await Promise.all(
      quizzes.map(async (quiz) => {
        const questions = await SectionQuizQuestion.find({
          section_quiz_id: quiz.id,
        });

        return {
          ...quiz.toObject(),
          questions,
        };
      })
    );

    return successHandler(res, quizzesWithQuestions);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

//getQuizById
const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await SectionQuiz.findById(id);
    if (!quiz) {
      return errorHandler(res, ERRORS.NOT_FOUND, "Quiz not found");
    }

    const questions = await SectionQuizQuestion.find({
      section_quiz_id: id,
    });

    return successHandler(res, {
      ...quiz.toObject(),
      questions,
    });
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};
//delete question

const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params; // questionId

    const question = await SectionQuizQuestion.findById(id);

    if (!question) {
      return errorHandler(res, ERRORS.NOT_FOUND, "Question not found");
    }

    await SectionQuizQuestion.findByIdAndDelete(id);

    return successHandler(res, question);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

// UPDATE QUESTION

const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params; // questionId
    const { question, options } = req.body;

    const exist = await SectionQuizQuestion.findById(id);
    if (!exist) {
      return errorHandler(res, ERRORS.NOT_FOUND, "Question not found");
    }

    exist.question = question;
    exist.options = options; // ghi đè toàn bộ mảng options mới

    await exist.save();

    return successHandler(res, exist);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * SUBMIT QUIZ
 */
const submitQuiz = async (req, res) => {
  try {
    const { section_quiz_id, answers, section_id, course_id, user_id } =
      req.body;

    const questions = await SectionQuizQuestion.find({ section_quiz_id });

    let correct = 0;

    questions.forEach((q) => {
      const userAnswer = answers.find((a) => a.question_id === q.id);
      if (!userAnswer) return;

      const correctOptions = q.options
        .filter((opt) => opt.is_correct)
        .map((opt) => String(opt._id));

      const selectedOptions = userAnswer.selected_option_ids;

      const isCorrect =
        correctOptions.length === selectedOptions.length &&
        correctOptions.every((id) => selectedOptions.includes(id));

      if (isCorrect) correct++;
    });

    const total = questions.length;
    const percentage = Math.round((correct / total) * 100);

    const quiz = await SectionQuiz.findById(section_quiz_id);
    const is_passed = percentage >= quiz.passing_percentage;

    let result = await SectionQuizResult.findOne({
      user_id,
      section_id,
      section_quiz_id,
    });

    if (result) {
      // update kết quả cũ
      result.correct_count = correct;
      result.total_questions = total;
      result.percentage = percentage;
      result.is_passed = is_passed;

      await result.save();
    } else {
      // lần đầu làm quiz → tạo mới
      result = await SectionQuizResult.create({
        user_id,
        course_id,
        section_id,
        section_quiz_id,
        correct_count: correct,
        total_questions: total,
        percentage,
        is_passed,
      });
    }

    return successHandler(res, result);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * GET RESULT OF USER
 */
const getUserQuizResult = async (req, res) => {
  try {
    const { userId, sectionId } = req.params;

    const result = await SectionQuizResult.findOne({
      user_id: userId,
      section_id: sectionId,
    });

    return successHandler(res, result);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

const getAllUserQuizResult = async (req, res) => {
  try {
    const { userId, sectionId } = req.params;

    const results = await SectionQuizResult.find({
      user_id: userId,
      section_id: sectionId,
    });

    return successHandler(res, results);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * DELETE QUIZ (admin/teacher)
 */
const deleteQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;

    const quiz = await SectionQuiz.findById(quizId);

    if (!quiz) return errorHandler(res, ERRORS.NOT_FOUND);
    await SectionQuiz.findByIdAndDelete(quizId);

    await SectionQuizQuestion.deleteMany({ section_quiz_id: quizId });

    return successHandler(res, quiz);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  getAllUserQuizResult,
  updateQuestion,
  getQuizById,
  createQuiz,
  createQuestion,
  getQuizBySection,
  submitQuiz,
  getUserQuizResult,
  deleteQuestion,
  deleteQuiz,
};
