const axios = require("axios");
const Quiz = require("./models/quiz");
const Question = require("./models/question");

let isGenerating = false;

// =========================
// GEMINI CALL (WITH RETRY)
// =========================
async function callGemini(prompt, retryCount = 0) {
  const API_KEY = process.env.GEMINI_API_KEY;
  const MAX_RETRIES = 5;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      }
    );

    return response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    const status = error.response?.status;

    // Retry on rate limit
    if (status === 429 && retryCount < MAX_RETRIES) {
      const delay = 2000 * (retryCount + 1);

      console.log(`⏳ Retry ${retryCount + 1}/${MAX_RETRIES} in ${delay}ms`);

      await new Promise((r) => setTimeout(r, delay));

      return callGemini(prompt, retryCount + 1);
    }

    console.log("❌ Gemini API failed:", error.message);
    throw error;
  }
}

// =========================
// JSON CLEAN PARSER
// =========================
function extractJSON(text) {
  try {
    if (!text) throw new Error("Empty AI response");

    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const match = cleaned.match(/\[[\s\S]*\]/);

    if (!match) {
      throw new Error("No valid JSON array found in AI response");
    }

    return JSON.parse(match[0]);
  } catch (err) {
    console.log("❌ Invalid AI JSON:", err.message);
    throw new Error("AI returned invalid JSON");
  }
}

// =========================
// PROMPT BUILDER
// =========================
function buildPrompt({ topic, difficulty, totalQuestions }) {
  return `
You are an AI that generates high-quality MCQ quizzes.

Generate exactly ${totalQuestions} multiple-choice questions on "${topic}" with difficulty "${difficulty}".

Rules:
- Return ONLY valid JSON array
- No markdown, no explanation
- Each question must have 4 options (A, B, C, D)
- One correct answer only

Format:
[
  {
    "text": "Question here",
    "options": {
      "A": "option1",
      "B": "option2",
      "C": "option3",
      "D": "option4"
    },
    "correctOption": "A"
  }
]
`;
}

// =========================
// MAIN FUNCTION
// =========================
async function generateAIQuiz({
  title,
  topic,
  difficulty,
  totalQuestions,
  createdBy,
}) {
  if (isGenerating) {
    throw new Error("Quiz generation already in progress");
  }

  isGenerating = true;

  try {
    console.log("🔥 Generating AI quiz...");

    // 1. Build prompt
    const prompt = buildPrompt({
      topic,
      difficulty,
      totalQuestions,
    });

    // 2. Call Gemini
    const aiText = await callGemini(prompt);

    // 3. Parse AI response
    const questions = extractJSON(aiText);

    // 4. Create Quiz
    const quiz = await Quiz.create({
      title,
      topic,
      difficulty,
      totalQuestions,
      createdBy,
      questions: [],
    });
    
    console.log("GENERATOR INPUT:", {
      title,
      topic,
      difficulty,
      totalQuestions,
      createdBy,
    });
    // 5. Map questions
    const optionMap = { A: 0, B: 1, C: 2, D: 3 };

    const questionDocs = questions.map((q) => ({
      questionText: q.text,
      options: [
        q.options.A,
        q.options.B,
        q.options.C,
        q.options.D,
      ],
      correctAnswer: optionMap[q.correctOption] ?? 0,
      quiz: quiz._id,
    }));

    // 6. Save questions
    const savedQuestions = await Question.insertMany(questionDocs);

    quiz.questions = savedQuestions.map((q) => q._id);
    await quiz.save();

    console.log("✅ Quiz generated successfully");

    return quiz;

  } catch (err) {
    console.log("❌ generateAIQuiz failed:", err.message);
    throw err; // ❗ no fake fallback anymore
  } finally {
    isGenerating = false;
  }
}

module.exports = { generateAIQuiz };
