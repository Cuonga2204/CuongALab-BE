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
    const { id } = req.params;

    const oldForm = await QuestionBank.findById(id);
    if (!oldForm) {
      return errorHandler(res, ERRORS.NOT_FOUND, "Form not found");
    }

    const updatedForm = await QuestionBank.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    const oldQuestions = oldForm.questions;
    const newQuestions = updatedForm.questions;

    /* ===========================
       CASE A: UPDATE question
    =========================== */
    for (const q of newQuestions) {
      await SectionQuizQuestion.updateMany(
        { form_question_id: q._id },
        {
          question: q.question,
          options: q.options,
        }
      );
    }

    /* ===========================
       CASE B: DELETE question
    =========================== */
    for (const oldQ of oldQuestions) {
      const stillExist = newQuestions.some(
        (q) => String(q._id) === String(oldQ._id)
      );

      if (!stillExist) {
        await SectionQuizQuestion.deleteMany({
          form_question_id: oldQ._id,
        });
      }
    }

    /* ===========================
       CASE C: ADD question
    =========================== */
    for (const newQ of newQuestions) {
      const existedBefore = oldQuestions.some(
        (q) => String(q._id) === String(newQ._id)
      );

      if (!existedBefore) {
        // tìm quiz nào đã import form này
        const imported = await SectionQuizQuestion.find({
          form_question_id: { $in: oldQuestions.map((q) => q._id) },
        });

        const quizIds = [
          ...new Set(imported.map((q) => String(q.section_quiz_id))),
        ];

        for (const quizId of quizIds) {
          await SectionQuizQuestion.create({
            section_quiz_id: quizId,
            form_question_id: newQ._id,
            question: newQ.question,
            options: newQ.options,
          });
        }
      }
    }

    return successHandler(res, updatedForm);
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
          form_question_id: q._id,
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
