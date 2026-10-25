
const express = require("express");
const multer = require("multer");

const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

const protect = require("../middleware/authMiddleware");
const adminProtect = require("../middleware/adminMiddleware");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only JPG, PNG and WEBP images are allowed.")
      );
    }

    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

function uploadToCloudinary(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
}

router.post(
  "/:id",
  protect,
  adminProtect,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Please select an image.",
        });
      }

      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          message: "Product not found.",
        });
      }

      const brandFolder = (product.brand || "other")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "other";

      const result = await uploadToCloudinary(req.file.buffer, {
        folder: `stylaura/products/${brandFolder}`,
        resource_type: "image",
      });

      product.image = result.secure_url;
      await product.save();

      return res.status(200).json({
        message: "Product image uploaded successfully.",
        image: result.secure_url,
        product,
      });
    } catch (error) {
      console.error("Product image upload error:", error.message);

      return res.status(500).json({
        message: "Unable to upload product image.",
      });
    }
  }
);

module.exports = router;
