const express = require("express");

const User = require("../models/User");
const Brand = require("../models/Brand");

const protect = require("../middleware/authMiddleware");
const adminProtect = require("../middleware/adminMiddleware");

const router = express.Router();


// =========================================
// ADMIN ACCESS CHECK
// =========================================

router.get(
  "/me",
  protect,
  adminProtect,
  (req, res) => {
    res.status(200).json({
      message: "Admin access confirmed.",
      admin: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  }
);


// =========================================
// DASHBOARD SUMMARY
// =========================================

router.get(
  "/dashboard",
  protect,
  adminProtect,
  async (req, res) => {
    try {
      const totalUsers =
        await User.countDocuments({
          role: "customer",
        });

      const totalAdmins =
        await User.countDocuments({
          role: "admin",
        });

      const usersWithSkinProfiles =
        await User.countDocuments({
          role: "customer",
          skinProfile: {
            $ne: null,
          },
        });

      const usersWithHairProfiles =
        await User.countDocuments({
          role: "customer",
          hairProfile: {
            $ne: null,
          },
        });

      const usersWithColourProfiles =
        await User.countDocuments({
          role: "customer",
          colourProfile: {
            $ne: null,
          },
        });

      res.status(200).json({
        stats: {
          totalUsers,
          totalAdmins,
          usersWithSkinProfiles,
          usersWithHairProfiles,
          usersWithColourProfiles,
        },
      });
    } catch (error) {
      console.error(
        "Admin dashboard error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to load admin dashboard.",
      });
    }
  }
);


// =========================================
// ALL CUSTOMERS
// =========================================

router.get(
  "/users",
  protect,
  adminProtect,
  async (req, res) => {
    try {
      const users = await User.find({
        role: "customer",
      })
        .select("-password")
        .sort({
          createdAt: -1,
        });

      res.status(200).json({
        users,
      });
    } catch (error) {
      console.error(
        "Admin users error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to load users.",
      });
    }
  }
);


// =========================================
// ALL BRANDS
// =========================================

router.get(
  "/brands",
  protect,
  adminProtect,
  async (req, res) => {
    try {
      const brands = await Brand.find()
        .sort({
          createdAt: -1,
        });

      res.status(200).json({
        brands,
      });
    } catch (error) {
      console.error(
        "Admin brands error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to load brands.",
      });
    }
  }
);


// =========================================
// CREATE BRAND
// =========================================

router.post(
  "/brands",
  protect,
  adminProtect,
  async (req, res) => {
    try {
      const {
        name,
        type,
        category,
        description,
        isActive,
      } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          message:
            "Brand name is required.",
        });
      }

      const existingBrand =
        await Brand.findOne({
          name: name.trim(),
        });

      if (existingBrand) {
        return res.status(400).json({
          message:
            "A brand with this name already exists.",
        });
      }

      const brand =
        await Brand.create({
          name: name.trim(),
          type:
            type || "Partner",
          category:
            category?.trim() ||
            "Beauty",
          description:
            description?.trim() || "",
          isActive:
            typeof isActive ===
            "boolean"
              ? isActive
              : true,
        });

      res.status(201).json({
        message:
          "Brand created successfully.",
        brand,
      });
    } catch (error) {
      console.error(
        "Create brand error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to create brand.",
      });
    }
  }
);


// =========================================
// UPDATE BRAND
// =========================================

router.put(
  "/brands/:id",
  protect,
  adminProtect,
  async (req, res) => {
    try {
      const {
        name,
        type,
        category,
        description,
        isActive,
      } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          message:
            "Brand name is required.",
        });
      }

      const existingBrand =
        await Brand.findOne({
          name: name.trim(),
          _id: {
            $ne: req.params.id,
          },
        });

      if (existingBrand) {
        return res.status(400).json({
          message:
            "Another brand already uses this name.",
        });
      }

      const brand =
        await Brand.findById(
          req.params.id
        );

      if (!brand) {
        return res.status(404).json({
          message:
            "Brand not found.",
        });
      }

      brand.name =
        name.trim();

      brand.type =
        type || "Partner";

      brand.category =
        category?.trim() ||
        "Beauty";

      brand.description =
        description?.trim() || "";

      if (
        typeof isActive ===
        "boolean"
      ) {
        brand.isActive =
          isActive;
      }

      await brand.save();

      res.status(200).json({
        message:
          "Brand updated successfully.",
        brand,
      });
    } catch (error) {
      console.error(
        "Update brand error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to update brand.",
      });
    }
  }
);


// =========================================
// DELETE BRAND
// =========================================

router.delete(
  "/brands/:id",
  protect,
  adminProtect,
  async (req, res) => {
    try {
      const brand =
        await Brand.findByIdAndDelete(
          req.params.id
        );

      if (!brand) {
        return res.status(404).json({
          message:
            "Brand not found.",
        });
      }

      res.status(200).json({
        message:
          "Brand deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete brand error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to delete brand.",
      });
    }
  }
);


module.exports = router;