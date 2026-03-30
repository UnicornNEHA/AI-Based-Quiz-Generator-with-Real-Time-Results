const mongoose = require("mongoose");

// ✅ DEFINE schema FIRST
const quizSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true 
    },

    description: { 
      type: String 
    },

    totalQuestions: {
      type: Number,
      required: true,
      min: 1
    },

    timeLimit: {
      type: Number,
      default: 0
    },

    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },

    isPublished: { 
      type: Boolean, 
      default: false 
    },

    // 🔥 IMPORTANT
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question"
      }
    ]
  },
  { timestamps: true }
);

// ✅ EXPORT AFTER schema is defined
module.exports =
  mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);
