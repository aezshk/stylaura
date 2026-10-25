const express = require("express");

const Product = require("../models/Product");
const ChallengeResult = require("../models/ChallengeResult");

const protect = require("../middleware/authMiddleware");
const adminProtect = require("../middleware/adminMiddleware");

const router = express.Router();

/*
  GET ALL ACTIVE PRODUCTS
  Customer access
*/
router.get("/", protect, async (req, res) => {
  try {
    const latestChallenge =
      await ChallengeResult.findOne({
        user: req.user._id,
      }).sort({
        createdAt: -1,
      });

    const passedChallenge =
      latestChallenge?.passed === true;

    const discountPercent =
      latestChallenge?.discountPercent || 0;

    const productFilter = {
      isActive: true,
    };

    /*
      Customers who passed the Style Challenge
      can see STYLAURA + partner brands.
    */

    if (!passedChallenge) {
      productFilter.isStylaura = true;
    }

    const products = await Product.find(
      productFilter
    ).sort({
      createdAt: -1,
    });

    res.status(200).json({
      products,
      challenge: {
        hasResult: Boolean(latestChallenge),
        passed: passedChallenge,
        score: latestChallenge?.score || null,
        occasion:
          latestChallenge?.occasion || null,
        discountPercent,
      },
    });
  } catch (error) {
    console.error(
      "Get products error:",
      error.message
    );

    res.status(500).json({
      message: "Unable to load products.",
    });
  }
});


/*
  GET ALL PRODUCTS
  Admin access
*/
router.get(
  "/admin",
  protect,
  adminProtect,
  async (req, res) => {
    try {
      const products = await Product.find().sort({
        createdAt: -1,
      });

      res.status(200).json({
        products,
      });
    } catch (error) {
      console.error(
        "Admin products error:",
        error.message
      );

      res.status(500).json({
        message: "Unable to load products.",
      });
    }
  }
);


/*
  CREATE PRODUCT
  Admin access
*/
router.post(
  "/",
  protect,
  adminProtect,
  async (req, res) => {
    try {
      const {
        name,
        brand,
        category,
        subcategory,
        description,
        price,
        image,
        stock,
        suitableSkinTypes,
        suitableHairTypes,
        suitableUndertones,
        suitableContrasts,
        tags,
        isStylaura,
        isActive,
      } = req.body;

      if (
        !name ||
        !brand ||
        !category ||
        price === undefined
      ) {
        return res.status(400).json({
          message:
            "Please provide name, brand, category and price.",
        });
      }

      const product = await Product.create({
        name,
        brand,
        category,
        subcategory,
        description,
        price,
        image,
        stock,
        suitableSkinTypes,
        suitableHairTypes,
        suitableUndertones,
        suitableContrasts,
        tags,
        isStylaura,
        isActive,
      });

      res.status(201).json({
        message: "Product created successfully.",
        product,
      });
    } catch (error) {
      console.error(
        "Create product error:",
        error.message
      );

      res.status(500).json({
        message: "Unable to create product.",
      });
    }
  }
);


/*
  UPDATE PRODUCT
  Admin access
*/
router.put(
  "/:id",
  protect,
  adminProtect,
  async (req, res) => {
    try {
      const {
        name,
        brand,
        category,
        subcategory,
        description,
        price,
        image,
        stock,
        suitableSkinTypes,
        suitableHairTypes,
        suitableUndertones,
        suitableContrasts,
        tags,
        isStylaura,
        isActive,
      } = req.body;

      const product =
        await Product.findByIdAndUpdate(
          req.params.id,
          {
            name,
            brand,
            category,
            subcategory,
            description,
            price,
            image,
            stock,
            suitableSkinTypes,
            suitableHairTypes,
            suitableUndertones,
            suitableContrasts,
            tags,
            isStylaura,
            isActive,
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!product) {
        return res.status(404).json({
          message: "Product not found.",
        });
      }

      res.status(200).json({
        message:
          "Product updated successfully.",
        product,
      });
    } catch (error) {
      console.error(
        "Update product error:",
        error.message
      );

      res.status(500).json({
        message: "Unable to update product.",
      });
    }
  }
);


/*
  DELETE PRODUCT
  Admin access
*/
router.delete(
  "/:id",
  protect,
  adminProtect,
  async (req, res) => {
    try {
      const product =
        await Product.findByIdAndDelete(
          req.params.id
        );

      if (!product) {
        return res.status(404).json({
          message: "Product not found.",
        });
      }

      res.status(200).json({
        message: "Product deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete product error:",
        error.message
      );

      res.status(500).json({
        message: "Unable to delete product.",
      });
    }
  }
);


module.exports = router;