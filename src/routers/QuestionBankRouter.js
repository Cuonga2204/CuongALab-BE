const express = require("express");
const router = express.Router();
const controller = require("../controllers/QuestionBankController");

// FORM CRUD
router.post("/create", controller.createForm);
router.get("/all", controller.getAllForms);
router.get("/:id", controller.getFormById);
router.put("/update/:id", controller.updateForm);
router.delete("/delete/:id", controller.deleteForm);

// QUESTION CRUD in FORM
router.post("/:formId/question/add", controller.addQuestionToForm);
router.delete(
  "/:formId/question/:questionIndex",
  controller.deleteQuestionFromForm
);

// IMPORT FORM → QUIZ
router.post("/import", controller.importFormToQuiz);

module.exports = router;
