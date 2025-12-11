const express = require("express");
const router = express.Router();
const quizController = require("../controllers/VideoQuizController");

router.post("/create", quizController.createQuiz);
router.get("/lecture/:lectureId", quizController.getQuizzesByLecture);
router.delete("/:id", quizController.deleteQuiz);

module.exports = router;
