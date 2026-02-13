const mongoose = require("mongoose");

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
            ref: "User", required: true 
        },

        isPublished: { 
            type: Boolean, 
            default: false 
        }
    },

    { timestamps: true }
);
module.exports = mongoose.model("Quiz", quizSchema);