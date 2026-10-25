const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    reward: {
      type: String,
      required: true,
      trim: true,
    },

    rewardType: {
      type: String,
      enum: [
        "discount",
        "product",
        "points",
        "gift",
      ],
      default: "discount",
    },

    rewardValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Game",
  gameSchema
);