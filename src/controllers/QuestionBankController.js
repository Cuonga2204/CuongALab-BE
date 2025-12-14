const QuestionBank = require("../models/QuestionBankModel");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const { ERRORS } = require("../errors");

/* ============================================================
    CREATE FORM QUIZ
============================================================ */
const createForm = async (req, res) => {
  try {
    const newForm = await QuestionBank.create(req.body);
    return successHandler(res, newForm);
  } catch (err) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, err.message);
  }
};

/* ============================================================
    GET ALL FORMS
============================================================ */
const getAllForms = async (req, res) => {
  try {
    const forms = await QuestionBank.find()
      .populate("course_id", "title")
      .sort({ createdAt: -1 });

    return successHandler(
      res,
      forms.map((f) => ({
        ...f.toObject(),
        course_title: f.course_id?.title ?? null,
      }))
    );
  } catch (err) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, err.message);
  }
};

/* ============================================================
    GET ONE FORM
============================================================ */
const getFormById = async (req, res) => {
  try {
    const form = await QuestionBank.findById(req.params.id);

    if (!form) return errorHandler(res, ERRORS.NOT_FOUND, "Form not found");

    return successHandler(res, form);
  } catch (err) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, err.message);
  }
};

/* ============================================================
    UPDATE FORM
============================================================ */
const updateForm = async (req, res) => {
  try {
    const updated = await QuestionBank.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) return errorHandler(res, ERRORS.NOT_FOUND, "Form not found");

    return successHandler(res, updated);
  } catch (err) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, err.message);
  }
};

/* ============================================================
    DELETE FORM
============================================================ */
const deleteForm = async (req, res) => {
  try {
    const deleted = await QuestionBank.findByIdAndDelete(req.params.id);

    if (!deleted) return errorHandler(res, ERRORS.NOT_FOUND, "Form not found");

    return successHandler(res, deleted);
  } catch (err) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, err.message);
  }
};

/* ============================================================
    ADD QUESTION INTO FORM
============================================================ */
const addQuestionToForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const { question, options } = req.body;

    const form = await QuestionBank.findById(formId);
    if (!form) return errorHandler(res, ERRORS.NOT_FOUND, "Form not found");

    form.questions.push({ question, options });

    await form.save();

    return successHandler(res, form);
  } catch (err) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, err.message);
  }
};

/* ============================================================
    DELETE QUESTION FROM FORM
============================================================ */
const deleteQuestionFromForm = async (req, res) => {
  try {
    const { formId, questionIndex } = req.params;

    const form = await QuestionBank.findById(formId);
    if (!form) return errorHandler(res, ERRORS.NOT_FOUND);

    form.questions.splice(questionIndex, 1);
    await form.save();

    return successHandler(res, form);
  } catch (err) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, err.message);
  }
};

/* ============================================================
    IMPORT FORM QUESTION INTO SECTION QUIZ
============================================================ */
const SectionQuizQuestion = require("../models/SectionQuizQuestionModel");

const importFormToQuiz = async (req, res) => {
  try {
    const { quizId, formId } = req.body;

    const form = await QuestionBank.findById(formId);
    if (!form) return errorHandler(res, ERRORS.NOT_FOUND, "Form not found");

    const createdQuestions = await Promise.all(
      form.questions.map((q) =>
        SectionQuizQuestion.create({
          section_quiz_id: quizId,
          question: q.question,
          options: q.options,
        })
      )
    );

    return successHandler(res, createdQuestions);
  } catch (err) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, err.message);
  }
};

module.exports = {
  createForm,
  getAllForms,
  getFormById,
  updateForm,
  deleteForm,
  addQuestionToForm,
  deleteQuestionFromForm,
  importFormToQuiz,
};
