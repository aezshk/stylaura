const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Product = require("../models/Product");

dotenv.config({
  path: require("path").join(__dirname, "..", ".env"),
});

const products = [
  // =========================================================
  // MAKEUP
  // =========================================================

  {
    name: "Warm Nude Lip Colour",
    brand: "STYLAURA",
    category: "Makeup",
    subcategory: "Lipstick",
    description: "A warm nude lip colour designed for everyday polished looks.",
    price: 699,
    image: "",
    stock: 50,
    suitableSkinTypes: ["Dry", "Normal", "Combination", "Sensitive"],
    suitableHairTypes: [],
    suitableUndertones: ["Warm", "Neutral"],
    suitableContrasts: ["Medium", "High"],
    tags: ["Warm", "Nude", "Everyday", "Natural"],
    isStylaura: true,
    isActive: true,
  },

  {
    name: "Peach Glow Blush",
    brand: "STYLAURA",
    category: "Makeup",
    subcategory: "Blush",
    description: "A soft peach blush for a fresh warm-toned glow.",
    price: 599,
    image: "",
    stock: 45,
    suitableSkinTypes: ["Dry", "Normal", "Combination"],
    suitableHairTypes: [],
    suitableUndertones: ["Warm"],
    suitableContrasts: ["Low", "Medium"],
    tags: ["Peach", "Warm", "Glow", "Everyday"],
    isStylaura: true,
    isActive: true,
  },

  {
    name: "Rosewood Blush",
    brand: "STYLAURA",
    category: "Makeup",
    subcategory: "Blush",
    description: "A versatile rosewood blush for balanced everyday colour.",
    price: 649,
    image: "",
    stock: 40,
    suitableSkinTypes: ["Normal", "Combination", "Oily"],
    suitableHairTypes: [],
    suitableUndertones: ["Neutral", "Warm", "Cool"],
    suitableContrasts: ["Medium", "High"],
    tags: ["Rosewood", "Neutral", "Everyday"],
    isStylaura: true,
    isActive: true,
  },

  {
    name: "Soft Brown Eye Palette",
    brand: "STYLAURA",
    category: "Makeup",
    subcategory: "Eyeshadow",
    description: "A wearable collection of soft brown and neutral shades.",
    price: 899,
    image: "",
    stock: 35,
    suitableSkinTypes: ["Dry", "Normal", "Combination", "Oily"],
    suitableHairTypes: [],
    suitableUndertones: ["Warm", "Neutral"],
    suitableContrasts: ["Medium", "High"],
    tags: ["Brown", "Neutral", "Warm", "Everyday"],
    isStylaura: true,
    isActive: true,
  },

  {
    name: "Soft Taupe Eye Palette",
    brand: "STYLAURA",
    category: "Makeup",
    subcategory: "Eyeshadow",
    description: "Soft taupe shades for cool and neutral toned looks.",
    price: 899,
    image: "",
    stock: 35,
    suitableSkinTypes: ["Dry", "Normal", "Combination", "Oily"],
    suitableHairTypes: [],
    suitableUndertones: ["Cool", "Neutral"],
    suitableContrasts: ["Low", "Medium"],
    tags: ["Taupe", "Cool", "Neutral", "Soft"],
    isStylaura: true,
    isActive: true,
  },

  {
    name: "Golden Glow Highlighter",
    brand: "STYLAURA",
    category: "Makeup",
    subcategory: "Highlighter",
    description: "A golden highlighter created for warm radiant finishes.",
    price: 749,
    image: "",
    stock: 40,
    suitableSkinTypes: ["Dry", "Normal", "Combination"],
    suitableHairTypes: [],
    suitableUndertones: ["Warm"],
    suitableContrasts: ["Medium", "High"],
    tags: ["Golden", "Warm", "Glow"],
    isStylaura: true,
    isActive: true,
  },

  {
    name: "Pearl Glow Highlighter",
    brand: "STYLAURA",
    category: "Makeup",
    subcategory: "Highlighter",
    description: "A soft pearl highlight for cool and neutral complexions.",
    price: 749,
    image: "",
    stock: 40,
    suitableSkinTypes: ["Dry", "Normal", "Combination"],
    suitableHairTypes: [],
    suitableUndertones: ["Cool", "Neutral"],
    suitableContrasts: ["Low", "Medium"],
    tags: ["Pearl", "Cool", "Neutral", "Glow"],
    isStylaura: true,
    isActive: true,
  },

  {
    name: "Classic Brown Kajal",
    brand: "STYLAURA",
    category: "Makeup",
    subcategory: "Eye Makeup",
    description: "A soft brown kajal for naturally defined eyes.",
    price: 399,
    image: "",
    stock: 60,
    suitableSkinTypes: ["Dry", "Oily", "Combination", "Normal", "Sensitive"],
    suitableHairTypes: [],
    suitableUndertones: ["Warm", "Neutral"],
    suitableContrasts: ["Low", "Medium", "High"],
    tags: ["Brown", "Natural", "Everyday"],
    isStylaura: true,
    isActive: true,
  },

  {
    name: "Deep Black Eyeliner",
    brand: "STYLAURA",
    category: "Makeup",
    subcategory: "Eye Makeup",
    description: "A defined black liner for stronger contrast looks.",
    price: 449,
    image: "",
    stock: 60,
    suitableSkinTypes: ["Oily", "Combination", "Normal"],
    suitableHairTypes: [],
    suitableUndertones: ["Cool", "Neutral", "Warm"],
    suitableContrasts: ["Medium", "High"],
    tags: ["Black", "Definition", "High Contrast"],
    isStylaura: true,
    isActive: true,
  },

  // =========================================================
  // SKINCARE
  // =========================================================

  {
    name: "Hydrating Daily Cleanser",
    brand: "STYLAURA",
    category: "Skincare",
    subcategory: "Cleanser",
    description: "A gentle daily cleanser designed to maintain skin comfort.",
    price: 549,
    image: "",
    stock: 50,
    suitableSkinTypes: ["Dry", "Normal", "Combination", "Sensitive"],
    suitableHairTypes: [],
    suitableUndertones: [],
    suitableContrasts: [],
    tags: ["Hydrating", "Gentle", "Daily"],
    isStylaura: true,
    isActive: true,
  },

  {
    name: "Balance Foaming Cleanser",
    brand: "STYLAURA",
    category: "Skincare",
    subcategory: "Cleanser",
    description: "A lightweight cleanser for balanced and combination skin.",
    price: 549,
    image: "",
    stock: 50,
    suitableSkinTypes: ["Oily", "Combination", "Normal"],
    suitableHairTypes: [],
    suitableUndertones: [],
    suitableContrasts: [],
    tags: ["Balance", "Combination", "Oil Control"],
    isStylaura: true,
    isActive: true,
  },

  {
    name: "Barrier Comfort Moisturizer",
    brand: "STYLAURA",
    category: "Skincare",
    subcategory: "Moisturizer",
    description: "A comforting moisturizer for dry and sensitive skin.",
    price: 799,
    image: "",
    stock: 45,
    suitableSkinTypes: ["Dry", "Sensitive", "Normal"],
    suitableHairTypes: [],
    suitableUndertones: [],
    suitableContrasts: [],
    tags: ["Barrier", "Hydrating", "Sensitive"],
    isStylaura: true,
    isActive: true,
  },

  {
    name: "Light Balance Moisturizer",
    brand: "STYLAURA",
    category: "Skincare",
    subcategory: "Moisturizer",
    description: "A lightweight moisturizer for combination and oily skin.",
    price: 699,
    image: "",
    stock: 45,
    suitableSkinTypes: ["Oily", "Combination", "Normal"],
    suitableHairTypes: [],
    suitableUndertones: [],
    suitableContrasts: [],
    tags: ["Lightweight", "Balance", "Combination"],
    isStylaura: true,
    isActive: true,
  },

  {
    name: "Daily Glow Serum",
    brand: "STYLAURA",
    category: "Skincare",
    subcategory: "Serum",
    description: "A lightweight serum for a healthy-looking glow.",
    price: 899,
    image: "",
    stock: 40,
    suitableSkinTypes: ["Dry", "Normal", "Combination"],
    suitableHairTypes: [],
    suitableUndertones: ["Warm", "Neutral"],
    suitableContrasts: ["Low", "Medium"],
    tags: ["Glow", "Hydration", "Radiance"],
    isStylaura: true,
    isActive: true,
  },

  {
    name: "Calm Skin Serum",
    brand: "STYLAURA",
    category: "Skincare",
    subcategory: "Serum",
    description: "A gentle serum designed for sensitive and easily stressed skin.",
    price: 899,
    image: "",
    stock: 35,
    suitableSkinTypes: ["Sensitive", "Dry", "Normal"],
    suitableHairTypes: [],
    suitableUndertones: [],
    suitableContrasts: [],
    tags: ["Calm", "Sensitive", "Gentle"],
    isStylaura: true,
    isActive: true,
  },

  {
    name: "Daily SPF 50",
    brand: "STYLAURA",
    category: "Skincare",
    subcategory: "Sun Protection",
    description: "Daily broad-spectrum SPF designed for everyday use.",
    price: 749,
    image: "",
    stock: 60,
    suitableSkinTypes: ["Dry", "Oily", "Combination", "Normal", "Sensitive"],
    suitableHairTypes: [],
    suitableUndertones: [],
    suitableContrasts: [],
    tags: ["SPF", "Daily", "Protection"],
    isStylaura: true,
    isActive: true,
  },

  // =========================================================
  // HAIRCARE
  // =========================================================

  {
    name: "Smooth Balance Shampoo",
    brand: "STYLAURA",
    category: "Haircare",
    subcategory: "Shampoo",
    description: "A gentle shampoo for everyday hair cleansing.",
    price: 599,
    image: "",
    stock: 50,
    suitableSkinTypes: [],
    suitableHairTypes: ["Straight", "Wavy"],
    suitableUndertones: [],
    suitableContrasts: [],
    tags: ["Smooth", "Daily", "Straight", "Wavy"],
    isStylaura: true,
    isActive: true,
  },

  {
    name: "Curl Definition Shampoo",
    brand: "STYLAURA",
    category: "Haircare",
    subcategory: "Shampoo",
    description: "A nourishing shampoo designed for textured hair.",
    price: 649,
    image: "",
    stock: 45,
    suitableSkinTypes: [],
    suitableHairTypes: ["Curly", "Coily"],
    suitableUndertones: [],
    suitableContrasts: [],
    tags: ["Curl", "Curly", "Coily", "Nourishing"],
    isStylaura: true,
    isActive: true,
  },

  {
    name: "Smooth Finish Conditioner",
    brand: "STYLAURA",
    category: "Haircare",
    subcategory: "Conditioner",
    description: "A smoothing conditioner for softer manageable hair.",
    price: 649,
    image: "",
    stock: 50,
    suitableSkinTypes: [],
    suitableHairTypes: ["Straight", "Wavy"],
    suitableUndertones: [],
    suitableContrasts: [],
    tags: ["Smooth", "Straight", "Wavy"],
    isStylaura: true,
    isActive: true,
  },

  {
    name: "Curl Care Conditioner",
    brand: "STYLAURA",
    category: "Haircare",
    subcategory: "Conditioner",
    description: "A rich conditioner for curls and coils.",
    price: 699,
    image: "",
    stock: 45,
    suitableSkinTypes: [],
    suitableHairTypes: ["Curly", "Coily"],
    suitableUndertones: [],
    suitableContrasts: [],
    tags: ["Curl", "Curly", "Coily", "Moisture"],
    isStylaura: true,
    isActive: true,
  },

  {
    name: "Lightweight Hair Serum",
    brand: "STYLAURA",
    category: "Haircare",
    subcategory: "Serum",
    description: "A lightweight serum for shine and smoothness.",
    price: 799,
    image: "",
    stock: 40,
    suitableSkinTypes: [],
    suitableHairTypes: ["Straight", "Wavy", "Curly"],
    suitableUndertones: [],
    suitableContrasts: [],
    tags: ["Shine", "Smooth", "Serum"],
    isStylaura: true,
    isActive: true,
  },

  {
    name: "Deep Nourish Hair Mask",
    brand: "STYLAURA",
    category: "Haircare",
    subcategory: "Hair Mask",
    description: "A nourishing weekly mask for dry or textured hair.",
    price: 899,
    image: "",
    stock: 35,
    suitableSkinTypes: [],
    suitableHairTypes: ["Wavy", "Curly", "Coily"],
    suitableUndertones: [],
    suitableContrasts: [],
    tags: ["Nourish", "Mask", "Curly", "Coily"],
    isStylaura: true,
    isActive: true,
  },

  // =========================================================
  // CLOTHING — WARM
  // =========================================================

  {
    name: "Warm Ivory Everyday Dress",
    brand: "STYLAURA",
    category: "Clothing",
    subcategory: "Dress",
    description: "An elegant ivory dress for warm-toned everyday styling.",
    price: 2499,
    image: "",
    stock: 20,
    suitableSkinTypes: ["Dry", "Oily", "Combination", "Normal", "Sensitive"],
    suitableHairTypes: [],
    suitableUndertones: ["Warm"],
    suitableContrasts: ["Medium"],
    tags: ["Warm", "Ivory", "Medium Contrast", "Everyday"],
    isStylaura: true,
    isActive: true,
  },

  {
    name: "Camel Classic Shirt",
    brand: "STYLAURA",
    category: "Clothing",
    subcategory: "Shirt",
    description: "A classic camel shirt for warm undertones.",
    price: 1799,
    image: "",
    stock: 25,
    suitableSkinTypes: [],
    suitableHairTypes: [],
    suitableUndertones: ["Warm"],
    suitableContrasts: ["Medium", "High"],
    tags: ["Camel", "Warm", "Classic"],
    isStylaura: true,
    isActive: true,
  },

  {
    name: "Terracotta Statement Top",
    brand: "STYLAURA",
    category: "Clothing",
    subcategory: "Top",
    description: "A warm terracotta top for expressive colour styling.",
    price: 1399,
    image: "",
    stock: 25,
    suitableSkinTypes: [],
    suitableHairTypes: [],
    suitableUndertones: ["Warm"],
    suitableContrasts: ["Medium", "High"],
    tags: ["Terracotta", "Warm", "Statement"],
    isStylaura: true,
    isActive: true,
  },

  // =========================================================
  // CLOTHING — COOL
  // =========================================================

  {
    name: "Soft Blue Everyday Dress",
    brand: "STYLAURA",
    category: "Clothing",
    subcategory: "Dress",
    description: "A soft blue dress for cool and balanced palettes.",
    price: 2499,
    image: "",
    stock: 20,
    suitableSkinTypes: [],
    suitableHairTypes: [],
    suitableUndertones: ["Cool", "Neutral"],
    suitableContrasts: ["Low", "Medium"],
    tags: ["Blue", "Cool", "Soft"],
    isStylaura: true,
    isActive: true,
  },

  {
    name: "Berry Statement Top",
    brand: "STYLAURA",
    category: "Clothing",
    subcategory: "Top",
    description: "A berry-toned statement top for cooler palettes.",
    price: 1399,
    image: "",
    stock: 25,
    suitableSkinTypes: [],
    suitableHairTypes: [],
    suitableUndertones: ["Cool"],
    suitableContrasts: ["Medium", "High"],
    tags: ["Berry", "Cool", "Statement"],
    isStylaura: true,
    isActive: true,
  },

  // =========================================================
  // CLOTHING — NEUTRAL
  // =========================================================

  {
    name: "Classic Neutral Co-Ord",
    brand: "STYLAURA",
    category: "Clothing",
    subcategory: "Co-Ord",
    description: "A versatile neutral co-ord for flexible everyday styling.",
    price: 2299,
    image: "",
    stock: 20,
    suitableSkinTypes: [],
    suitableHairTypes: [],
    suitableUndertones: ["Neutral", "Warm", "Cool"],
    suitableContrasts: ["Low", "Medium", "High"],
    tags: ["Neutral", "Versatile", "Everyday"],
    isStylaura: true,
    isActive: true,
  },

  // =========================================================
  // ACCESSORIES
  // =========================================================

  {
    name: "Gold Minimal Hoop Earrings",
    brand: "STYLAURA",
    category: "Accessories",
    subcategory: "Earrings",
    description: "Minimal gold hoops designed for warm and neutral palettes.",
    price: 799,
    image: "",
    stock: 35,
    suitableSkinTypes: [],
    suitableHairTypes: [],
    suitableUndertones: ["Warm", "Neutral"],
    suitableContrasts: ["Medium", "High"],
    tags: ["Gold", "Warm", "Minimal"],
    isStylaura: true,
    isActive: true,
  },

  {
    name: "Silver Minimal Hoop Earrings",
    brand: "STYLAURA",
    category: "Accessories",
    subcategory: "Earrings",
    description: "Minimal silver hoops for cool and neutral palettes.",
    price: 799,
    image: "",
    stock: 35,
    suitableSkinTypes: [],
    suitableHairTypes: [],
    suitableUndertones: ["Cool", "Neutral"],
    suitableContrasts: ["Low", "Medium"],
    tags: ["Silver", "Cool", "Minimal"],
    isStylaura: true,
    isActive: true,
  },

  {
    name: "Warm Tan Structured Bag",
    brand: "STYLAURA",
    category: "Accessories",
    subcategory: "Bag",
    description: "A structured tan bag for warm-toned styling.",
    price: 1999,
    image: "",
    stock: 15,
    suitableSkinTypes: [],
    suitableHairTypes: [],
    suitableUndertones: ["Warm"],
    suitableContrasts: ["Medium", "High"],
    tags: ["Tan", "Warm", "Bag"],
    isStylaura: true,
    isActive: true,
  },

  {
    name: "Classic Black Structured Bag",
    brand: "STYLAURA",
    category: "Accessories",
    subcategory: "Bag",
    description: "A timeless black structured bag for stronger contrast looks.",
    price: 1999,
    image: "",
    stock: 15,
    suitableSkinTypes: [],
    suitableHairTypes: [],
    suitableUndertones: ["Cool", "Neutral", "Warm"],
    suitableContrasts: ["Medium", "High"],
    tags: ["Black", "Classic", "High Contrast"],
    isStylaura: true,
    isActive: true,
  },
];

async function seedProducts() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from backend/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB.");

    let created = 0;
    let updated = 0;

    for (const productData of products) {
      const existingProduct = await Product.findOne({
        name: productData.name,
        brand: productData.brand,
      });

      if (existingProduct) {
        Object.assign(existingProduct, productData);
        await existingProduct.save();
        updated++;
        console.log(`Updated: ${productData.name}`);
      } else {
        await Product.create(productData);
        created++;
        console.log(`Created: ${productData.name}`);
      }
    }

    console.log("");
    console.log("=================================");
    console.log("STYLAURA PRODUCT SEED COMPLETE");
    console.log("=================================");
    console.log(`Created: ${created}`);
    console.log(`Updated: ${updated}`);
    console.log(`Total catalogue: ${products.length}`);
    console.log("=================================");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Product seed failed:", error.message);

    await mongoose.disconnect().catch(() => {});

    process.exit(1);
  }
}

seedProducts();