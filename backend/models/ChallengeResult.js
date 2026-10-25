const mongoose = require("mongoose");

const challengeResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      required: true,
    },

    occasion: {
      type: String,
      required: true,
      trim: true,
    },

    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    passed: {
      type: Boolean,
      required: true,
    },

    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ChallengeResult",
  challengeResultSchema
);