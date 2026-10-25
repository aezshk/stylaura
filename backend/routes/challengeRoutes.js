const express = require("express");

const ChallengeResult = require("../models/ChallengeResult");
const Game = require("../models/Game");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

const PASS_SCORE = 80;
const FAIL_DISCOUNT = 10;

/*
  Complete the Style Challenge
*/
router.post("/complete", protect, async (req, res) => {
  try {
    const {
      gameId,
      occasion,
      score,
    } = req.body;

    if (!gameId) {
      return res.status(400).json({
        message: "Game ID is required.",
      });
    }

    if (!occasion) {
      return res.status(400).json({
        message: "Occasion is required.",
      });
    }

    if (
      typeof score !== "number" ||
      score < 0 ||
      score > 100
    ) {
      return res.status(400).json({
        message: "Score must be between 0 and 100.",
      });
    }

    const game = await Game.findOne({
      _id: gameId,
      isActive: true,
    });

    if (!game) {
      return res.status(404).json({
        message: "Active game not found.",
      });
    }

    const passed = score >= PASS_SCORE;

    const discountPercent = passed
      ? 0
      : FAIL_DISCOUNT;

    const result = await ChallengeResult.create({
      user: req.user._id,
      game: game._id,
      occasion,
      score,
      passed,
      discountPercent,
    });

    return res.status(201).json({
      message: "Challenge result saved.",
      result: {
        id: result._id,
        score: result.score,
        passed: result.passed,
        discountPercent:
          result.discountPercent,
        occasion: result.occasion,
      },
    });
  } catch (error) {
    console.error(
      "Challenge completion error:",
      error
    );

    return res.status(500).json({
      message: "Unable to save challenge result.",
    });
  }
});

/*
  Get the customer's latest challenge result
*/
router.get("/latest", protect, async (req, res) => {
  try {
    const result =
      await ChallengeResult.findOne({
        user: req.user._id,
      })
        .sort({ createdAt: -1 })
        .populate("game", "title reward rewardType");

    return res.json({
      result: result || null,
    });
  } catch (error) {
    console.error(
      "Latest challenge result error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load challenge result.",
    });
  }
});

module.exports = router;