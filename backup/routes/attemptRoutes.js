const express = require("express");
const router = express.Router();

const Quiz = require("../models/quiz");

// Submit quiz and calculate score
router.post("/submit", async (req, res) => {
  try {
    const { quizId, answers } = req.body;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    let score = 0;

    quiz.questions.forEach((q) => {
      const userAnswer = answers[q._id];

      if (userAnswer === q.correctAnswer) {
        score++;
      }
    });

    res.json({
      score,
      total: quiz.questions.length
    });

  } catch (error) {
    res.status(500).json({ message: "Error submitting quiz" });
  }
});

module.exports = router;
