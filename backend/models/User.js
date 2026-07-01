const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true
    },

    rating: {
        type: Number,
        default: 1200
    },

    wins: {
        type: Number,
        default: 0
    },

    losses: {
        type: Number,
        default: 0
    },

    practiceSolved: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem"
    }],

    practiceStats: {
        easy: {
            type: Number,
            default: 0
        },
        medium: {
            type: Number,
            default: 0
        },
        hard: {
            type: Number,
            default: 0
        }
    },

    totalSolved: {
        type: Number,
        default: 0
    },

    // ── Streak tracking ──
    currentStreak: {
        type: Number,
        default: 0
    },
    maxStreak: {
        type: Number,
        default: 0
    },
    lastSolvedDate: {
        type: String, // stored as "YYYY-MM-DD" to avoid timezone issues
        default: null
    },
    // Array of dates (as "YYYY-MM-DD" strings) when user solved at least one problem
    solveHistory: [{
        type: String
    }],

    battleHistory: [
        {
            opponentId: { type: String },
            result: { type: String, enum: ['win', 'loss'] },
            solvedCount: { type: Number, default: 0 },
            timeTaken: { type: Number },
            date: { type: Date, default: Date.now }
        }
    ],

    createdAt: {
        type: Date,
        default: Date.now
    }

})

const User = mongoose.model("User", userSchema)

module.exports = User