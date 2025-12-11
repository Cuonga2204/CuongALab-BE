const express = require("express");
const router = express.Router();
const quizController = require("../controllers/SectionQuizController");

router.post("/create", quizController.createQuiz);
router.post("/question/create", quizController.createQuestion);
router.put("/question/update/:id", quizController.updateQuestion);
router.delete("/question/delete/:id", quizController.deleteQuestion);
router.get("/quiz/:id", quizController.getQuizById);

router.get("/section/:sectionId", quizController.getQuizBySection);
router.get("/result/:userId/:sectionId", quizController.getAllUserQuizResult);

router.post("/submit", quizController.submitQuiz);
router.delete("/delete/:id", quizController.deleteQuiz);

module.exports = router;
