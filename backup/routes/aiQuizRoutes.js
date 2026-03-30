const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { generateAIQuiz } = require("../aiQuizGenerator");

let isProcessing = false;

router.post("/generate", protect, async (req, res) => {
  try {
    if (isProcessing) {
      return res.status(429).json({
        success: false,
        message: "Quiz generation already in progress.",
      });
    }

    isProcessing = true;

    const {
      title,
      topic,
      difficulty,
      totalQuestions,
      createdBy,
    } = req.body;
    console.log("REQ BODY:", req.body);
    console.log("🔥 AI GENERATOR INPUT:", req.body);

    // ✅ STRICT VALIDATION
    if (!title || !topic || !difficulty || !totalQuestions || !createdBy) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const quiz = await generateAIQuiz({
      title,
      topic,
      difficulty,
      totalQuestions,
      createdBy,
    });

    return res.status(200).json({
      success: true,
      quiz,
    });

  } catch (error) {
    console.error("❌ AI ROUTE ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate quiz",
    });

  } finally {
    isProcessing = false;
  }
});

module.exports = router;
