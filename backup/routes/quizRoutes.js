const express = require("express");
const router = express.Router();

const { createQuiz, addQuestionToQuiz } = require("../controllers/quizController");
const { protect } = require("../middleware/authMiddleware");

// Step 2.1: Create Quiz
router.post("/", protect, createQuiz);

// Step 2.2: Add Question to Quiz
router.post("/:quizId/questions", protect, addQuestionToQuiz);

const { getQuizForAttempt } = require("../controllers/quizController");

// Step 2.3: Fetch Quiz for Student Attempt
router.get("/:quizId", protect, getQuizForAttempt);

const { submitQuiz } = require("../controllers/quizController");

// Step 2.4: Submit Quiz
router.post("/:quizId/submit", protect, submitQuiz);


const { getMyAttempts, getQuizAttempts } = require("../controllers/quizController");

// Step 2.5: Student - My attempts
router.get("/attempts/me", protect, getMyAttempts);

// Step 2.5: Admin - All attempts for a quiz
router.get("/:quizId/attempts", protect, getQuizAttempts);


module.exports = router;
