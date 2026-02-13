const Quiz = require("../models/quiz");
const Question = require("../models/question");

// ✅ Step 2.1: Create Quiz (already done)
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, totalQuestions, timeLimit } = req.body;

    const quiz = await Quiz.create({
      title,
      description,
      totalQuestions,
      timeLimit,
      createdBy: req.user.id,
    });

    res.status(201).json({
      message: "Quiz created successfully",
      quiz,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Step 2.2: Add Question to Quiz
exports.addQuestionToQuiz = async (req, res) => {
  const { quizId } = req.params;
  const { questionText, options, correctAnswer, marks } = req.body;

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Only creator/admin can add
    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const question = await Question.create({
      quiz: quizId,
      questionText,
      options,
      correctAnswer,
      marks,
    });

    res.status(201).json({
      message: "Question added successfully",
      question,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getQuizForAttempt = async (req, res) => {
  const { quizId } = req.params;

  try {
    // Fetch quiz metadata
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Fetch all questions for this quiz
    const questions = await Question.find({ quiz: quizId }).select(
      "-correctAnswer -__v" // hide correctAnswer
    );

    res.status(200).json({
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        totalQuestions: quiz.totalQuestions,
        timeLimit: quiz.timeLimit,
        questions,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


const QuizAttempt = require("../models/quizAttempt");

exports.submitQuiz = async (req, res) => {
  const { quizId } = req.params;
  const { answers } = req.body; // Array of objects: { questionId, selectedOption }

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Fetch all questions
    const questions = await Question.find({ quiz: quizId });

    // Auto-evaluate answers
    let score = 0;
    const evaluatedAnswers = answers.map((ans) => {
      const question = questions.find(q => q._id.toString() === ans.questionId);
      const isCorrect = question && question.correctAnswer === ans.selectedOption;
      if (isCorrect) score += question.marks || 1;
      return {
        question: ans.questionId,
        selectedOption: ans.selectedOption,
        isCorrect: !!isCorrect
      };
    });

    // Store attempt
    const quizAttempt = await QuizAttempt.create({
      quiz: quizId,
      user: req.user.id,
      answers: evaluatedAnswers,
      score,
      totalQuestions: questions.length 
    });

    res.status(201).json({
      message: "Quiz submitted successfully",
      score,
      totalQuestions: questions.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


// ✅ List all attempts by the logged-in student
exports.getMyAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user.id })
      .populate("quiz", "title description") // include quiz title and description
      .sort({ createdAt: -1 });

    res.status(200).json({ attempts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Admin: List all attempts for a specific quiz
exports.getQuizAttempts = async (req, res) => {
  const { quizId } = req.params;

  try {
    const attempts = await QuizAttempt.find({ quiz: quizId })
      .populate("user", "name email") // include student info
      .sort({ createdAt: -1 });

    res.status(200).json({ attempts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


