const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    subcategory: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    image: {
      type: String,
      default: "",
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
     * PERSONALIZATION
     *
     * These fields allow STYLAURA to match
     * products with the customer's beauty profile.
     */

    suitableSkinTypes: {
      type: [String],
      default: [],
    },

    suitableHairTypes: {
      type: [String],
      default: [],
    },

    suitableUndertones: {
      type: [String],
      default: [],
    },

    suitableContrasts: {
      type: [String],
      default: [],
    },

    tags: {
      type: [String],
      default: [],
    },

    isStylaura: {
      type: Boolean,
      default: false,
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
  "Product",
  productSchema
);