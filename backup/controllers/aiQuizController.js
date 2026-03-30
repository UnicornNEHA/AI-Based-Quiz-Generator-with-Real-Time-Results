const { generateAIQuiz } = require("../services/aiQuizGenerator");
const Quiz = require("../models/Quiz"); // 🔥 IMPORTANT

exports.generateQuiz = async (req, res) => {
  try {
    // ✅ FIX: use ONE consistent name
    const { title, topic, difficulty, totalQuestions } = req.body;

    const createdBy = req.user.id;

    // ✅ validation fix
    if (!title || !topic || !difficulty || !totalQuestions) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    console.log("🔥 AI REQUEST:", {
      title,
      topic,
      difficulty,
      totalQuestions,
      createdBy,
    });

    // 🤖 generate quiz using AI
    const quiz = await generateAIQuiz({
      title,
      topic,
      difficulty,
      totalQuestions,
      createdBy,
    });

    // 🔥 IMPORTANT FIX: fetch FULL quiz with questions populated
    const fullQuiz = await Quiz.findById(quiz._id)
      .populate("questions"); // THIS is what you were missing

    return res.status(201).json({
      success: true,
      quiz: fullQuiz, // 🔥 now includes full MCQs
    });

  } catch (error) {
    console.log("❌ AI QUIZ ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
