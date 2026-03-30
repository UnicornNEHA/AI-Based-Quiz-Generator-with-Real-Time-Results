const Quiz = require("../models/quiz");
const Question = require("../models/question");
const QuizAttempt = require("../models/quizAttempt");

/* ===============================
   CREATE QUIZ (TEACHER ONLY)
================================ */
exports.createQuiz = async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({
        message: "Only teachers can create quizzes"
      });
    }

    const { title, description, totalQuestions, timeLimit } = req.body;

    const quiz = await Quiz.create({
      title,
      description,
      totalQuestions,
      timeLimit,
      createdBy: req.user.id
    });

    res.status(201).json({
      message: "Quiz created successfully",
      quiz
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   ADD QUESTION (TEACHER ONLY)
================================ */
exports.addQuestionToQuiz = async (req, res) => {
  const { quizId } = req.params;
  const { questionText, options, correctAnswer, marks } = req.body;

  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({
        message: "Only teachers can add questions"
      });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const question = await Question.create({
      quiz: quizId,
      questionText,
      options,
      correctAnswer,
      marks
    });

    res.status(201).json({
      message: "Question added successfully",
      question
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   GET QUIZ FOR ATTEMPT (STUDENT)
================================ */
exports.getQuizForAttempt = async (req, res) => {
  const { quizId } = req.params;

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const questions = await Question.find({ quiz: quizId })
      .select("-correctAnswer -__v");

    res.status(200).json({
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        totalQuestions: quiz.totalQuestions,
        timeLimit: quiz.timeLimit,
        questions
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   SUBMIT QUIZ (STUDENT ONLY)
================================ */
exports.submitQuiz = async (req, res) => {
  const { quizId } = req.params;
  const { answers } = req.body;

  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can attempt quizzes"
      });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const questions = await Question.find({ quiz: quizId });

    let score = 0;
    const evaluatedAnswers = answers.map((ans) => {
      const question = questions.find(
        q => q._id.toString() === ans.questionId
      );

      const isCorrect =
        question && question.correctAnswer === ans.selectedOption;

      if (isCorrect) {
        score += question.marks || 1;
      }

      return {
        question: ans.questionId,
        selectedOption: ans.selectedOption,
        isCorrect: !!isCorrect
      };
    });

    await QuizAttempt.create({
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
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   GET MY ATTEMPTS (STUDENT ONLY)
================================ */
exports.getMyAttempts = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can view their attempts"
      });
    }

    const attempts = await QuizAttempt.find({ user: req.user.id })
      .populate("quiz", "title description")
      .sort({ createdAt: -1 });

    res.status(200).json({ attempts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   GET QUIZ ATTEMPTS (TEACHER ONLY)
================================ */
exports.getQuizAttempts = async (req, res) => {
  const { quizId } = req.params;

  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({
        message: "Only teachers can view quiz attempts"
      });
    }

    const attempts = await QuizAttempt.find({ quiz: quizId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ attempts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
