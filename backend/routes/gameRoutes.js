const express = require("express");

const Game = require("../models/Game");

const protect = require("../middleware/authMiddleware");
const adminProtect = require("../middleware/adminMiddleware");

const router = express.Router();


// =========================================
// ADMIN — GET ALL GAMES
// =========================================

router.get(
  "/admin",
  protect,
  adminProtect,
  async (req, res) => {
    try {
      const games = await Game.find()
        .sort({
          createdAt: -1,
        });

      res.status(200).json({
        games,
      });
    } catch (error) {
      console.error(
        "Admin games error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to load games.",
      });
    }
  }
);


// =========================================
// ADMIN — CREATE GAME
// =========================================

router.post(
  "/admin",
  protect,
  adminProtect,
  async (req, res) => {
    try {
      const {
        title,
        description,
        reward,
        rewardType,
        rewardValue,
        isActive,
      } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({
          message:
            "Game title is required.",
        });
      }

      if (!reward || !reward.trim()) {
        return res.status(400).json({
          message:
            "Reward name is required.",
        });
      }

      const game =
        await Game.create({
          title: title.trim(),

          description:
            description?.trim() || "",

          reward: reward.trim(),

          rewardType:
            rewardType || "discount",

          rewardValue:
            Number(rewardValue) || 0,

          isActive:
            typeof isActive ===
            "boolean"
              ? isActive
              : true,
        });

      res.status(201).json({
        message:
          "Game created successfully.",
        game,
      });
    } catch (error) {
      console.error(
        "Create game error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to create game.",
      });
    }
  }
);


// =========================================
// ADMIN — UPDATE GAME
// =========================================

router.put(
  "/admin/:id",
  protect,
  adminProtect,
  async (req, res) => {
    try {
      const {
        title,
        description,
        reward,
        rewardType,
        rewardValue,
        isActive,
      } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({
          message:
            "Game title is required.",
        });
      }

      if (!reward || !reward.trim()) {
        return res.status(400).json({
          message:
            "Reward name is required.",
        });
      }

      const game =
        await Game.findById(
          req.params.id
        );

      if (!game) {
        return res.status(404).json({
          message:
            "Game not found.",
        });
      }

      game.title =
        title.trim();

      game.description =
        description?.trim() || "";

      game.reward =
        reward.trim();

      game.rewardType =
        rewardType || "discount";

      game.rewardValue =
        Number(rewardValue) || 0;

      if (
        typeof isActive ===
        "boolean"
      ) {
        game.isActive =
          isActive;
      }

      await game.save();

      res.status(200).json({
        message:
          "Game updated successfully.",
        game,
      });
    } catch (error) {
      console.error(
        "Update game error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to update game.",
      });
    }
  }
);


// =========================================
// ADMIN — DELETE GAME
// =========================================

router.delete(
  "/admin/:id",
  protect,
  adminProtect,
  async (req, res) => {
    try {
      const game =
        await Game.findByIdAndDelete(
          req.params.id
        );

      if (!game) {
        return res.status(404).json({
          message:
            "Game not found.",
        });
      }

      res.status(200).json({
        message:
          "Game deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete game error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to delete game.",
      });
    }
  }
);


// =========================================
// CUSTOMER — ACTIVE GAMES
// =========================================

router.get(
  "/",
  protect,
  async (req, res) => {
    try {
      const games =
        await Game.find({
          isActive: true,
        }).sort({
          createdAt: -1,
        });

      res.status(200).json({
        games,
      });
    } catch (error) {
      console.error(
        "Get games error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to load games.",
      });
    }
  }
);


module.exports = router;