const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

const Product = require("../models/Product");

dotenv.config({
  path: path.join(__dirname, "..", ".env"),
});

const partnerProducts = [
  // =========================================================
  // MAYBELLINE — MAKEUP
  // =========================================================

  {
    name: "Superstay Matte Ink Liquid Lipstick",
    brand: "Maybelline",
    category: "Makeup",
    subcategory: "Lipstick",
    description:
      "Long-wear liquid lipstick with an intense matte finish.",
    price: 699,
    image: "",
    stock: 25,
    suitableSkinTypes: [
      "Dry",
      "Normal",
      "Combination",
      "Oily",
    ],
    suitableHairTypes: [],
    suitableUndertones: [
      "Warm",
      "Cool",
      "Neutral",
    ],
    suitableContrasts: [
      "Medium",
      "High",
    ],
    tags: [
      "Maybelline",
      "Lipstick",
      "Matte",
      "Long Wear",
    ],
    isStylaura: false,
    isActive: true,
  },

  {
    name: "Superstay Vinyl Ink Liquid Lipstick",
    brand: "Maybelline",
    category: "Makeup",
    subcategory: "Lipstick",
    description:
      "Long-wear liquid lipstick with intense colour and a glossy vinyl finish.",
    price: 849,
    image: "",
    stock: 25,
    suitableSkinTypes: [
      "Dry",
      "Normal",
      "Combination",
    ],
    suitableHairTypes: [],
    suitableUndertones: [
      "Warm",
      "Neutral",
    ],
    suitableContrasts: [
      "Medium",
      "High",
    ],
    tags: [
      "Maybelline",
      "Vinyl",
      "Gloss",
      "Warm",
      "Lipstick",
    ],
    isStylaura: false,
    isActive: true,
  },

  {
    name: "SuperStay Matte Ink Crayon Lipstick",
    brand: "Maybelline",
    category: "Makeup",
    subcategory: "Lipstick",
    description:
      "Easy-to-use long-wear matte lipstick in a convenient crayon format.",
    price: 599,
    image: "",
    stock: 25,
    suitableSkinTypes: [
      "Normal",
      "Combination",
      "Oily",
    ],
    suitableHairTypes: [],
    suitableUndertones: [
      "Warm",
      "Cool",
      "Neutral",
    ],
    suitableContrasts: [
      "Medium",
      "High",
    ],
    tags: [
      "Maybelline",
      "Crayon",
      "Matte",
      "Long Wear",
    ],
    isStylaura: false,
    isActive: true,
  },

  {
    name: "Lash Sensational Sky High Waterproof Mascara",
    brand: "Maybelline",
    category: "Makeup",
    subcategory: "Mascara",
    description:
      "Waterproof mascara designed for length and definition.",
    price: 699,
    image: "",
    stock: 30,
    suitableSkinTypes: [
      "Dry",
      "Oily",
      "Combination",
      "Normal",
      "Sensitive",
    ],
    suitableHairTypes: [],
    suitableUndertones: [
      "Warm",
      "Cool",
      "Neutral",
    ],
    suitableContrasts: [
      "Low",
      "Medium",
      "High",
    ],
    tags: [
      "Maybelline",
      "Mascara",
      "Lashes",
      "Definition",
    ],
    isStylaura: false,
    isActive: true,
  },

  {
    name: "Fit Me Matte + Poreless Compact Powder",
    brand: "Maybelline",
    category: "Makeup",
    subcategory: "Face Makeup",
    description:
      "Matte compact powder for a smooth everyday finish.",
    price: 399,
    image: "",
    stock: 30,
    suitableSkinTypes: [
      "Oily",
      "Combination",
      "Normal",
    ],
    suitableHairTypes: [],
    suitableUndertones: [
      "Warm",
      "Cool",
      "Neutral",
    ],
    suitableContrasts: [
      "Medium",
      "High",
    ],
    tags: [
      "Maybelline",
      "Powder",
      "Matte",
      "Face",
    ],
    isStylaura: false,
    isActive: true,
  },

  // =========================================================
  // L'ORÉAL PARIS — MAKEUP
  // =========================================================

  {
    name: "Infallible Matte Resistance Lipstick",
    brand: "L'Oréal Paris",
    category: "Makeup",
    subcategory: "Lipstick",
    description:
      "Long-lasting matte lip colour for defined everyday looks.",
    price: 999,
    image: "",
    stock: 20,
    suitableSkinTypes: [
      "Normal",
      "Combination",
      "Oily",
    ],
    suitableHairTypes: [],
    suitableUndertones: [
      "Warm",
      "Cool",
      "Neutral",
    ],
    suitableContrasts: [
      "Medium",
      "High",
    ],
    tags: [
      "L'Oreal",
      "Lipstick",
      "Matte",
      "Long Wear",
    ],
    isStylaura: false,
    isActive: true,
  },

  {
    name: "L'Oréal Paris Lash Paradise Mascara",
    brand: "L'Oréal Paris",
    category: "Makeup",
    subcategory: "Mascara",
    description:
      "Volumizing mascara designed for fuller-looking lashes.",
    price: 899,
    image: "",
    stock: 25,
    suitableSkinTypes: [
      "Dry",
      "Oily",
      "Combination",
      "Normal",
      "Sensitive",
    ],
    suitableHairTypes: [],
    suitableUndertones: [
      "Warm",
      "Cool",
      "Neutral",
    ],
    suitableContrasts: [
      "Medium",
      "High",
    ],
    tags: [
      "L'Oreal",
      "Mascara",
      "Volume",
      "Lashes",
    ],
    isStylaura: false,
    isActive: true,
  },

  {
    name: "L'Oréal Paris True Match Foundation",
    brand: "L'Oréal Paris",
    category: "Makeup",
    subcategory: "Foundation",
    description:
      "Foundation designed to provide an even natural-looking complexion.",
    price: 1099,
    image: "",
    stock: 20,
    suitableSkinTypes: [
      "Normal",
      "Combination",
      "Oily",
    ],
    suitableHairTypes: [],
    suitableUndertones: [
      "Warm",
      "Cool",
      "Neutral",
    ],
    suitableContrasts: [
      "Low",
      "Medium",
      "High",
    ],
    tags: [
      "L'Oreal",
      "Foundation",
      "Base",
      "Complexion",
    ],
    isStylaura: false,
    isActive: true,
  },

  // =========================================================
  // LAKMÉ — MAKEUP
  // =========================================================

  {
    name: "Lakmé 9 to 5 Primer + Matte Lip Color",
    brand: "Lakmé",
    category: "Makeup",
    subcategory: "Lipstick",
    description:
      "Matte lip colour with a primer-inspired finish for everyday wear.",
    price: 550,
    image: "",
    stock: 25,
    suitableSkinTypes: [
      "Normal",
      "Combination",
      "Oily",
    ],
    suitableHairTypes: [],
    suitableUndertones: [
      "Warm",
      "Neutral",
    ],
    suitableContrasts: [
      "Medium",
      "High",
    ],
    tags: [
      "Lakme",
      "Lipstick",
      "Matte",
      "Everyday",
    ],
    isStylaura: false,
    isActive: true,
  },

  {
    name: "Lakmé Absolute Shine Line Eyeliner",
    brand: "Lakmé",
    category: "Makeup",
    subcategory: "Eye Makeup",
    description:
      "Liquid eyeliner for precise everyday eye definition.",
    price: 525,
    image: "",
    stock: 30,
    suitableSkinTypes: [
      "Dry",
      "Oily",
      "Combination",
      "Normal",
      "Sensitive",
    ],
    suitableHairTypes: [],
    suitableUndertones: [
      "Warm",
      "Cool",
      "Neutral",
    ],
    suitableContrasts: [
      "Medium",
      "High",
    ],
    tags: [
      "Lakme",
      "Eyeliner",
      "Eyes",
      "Definition",
    ],
    isStylaura: false,
    isActive: true,
  },

  // =========================================================
  // CERAVE — SKINCARE
  // =========================================================

  {
    name: "CeraVe Hydrating Cleanser",
    brand: "CeraVe",
    category: "Skincare",
    subcategory: "Cleanser",
    description:
      "Gentle cleanser designed to cleanse while supporting the skin barrier.",
    price: 999,
    image: "",
    stock: 20,
    suitableSkinTypes: [
      "Dry",
      "Normal",
      "Combination",
      "Sensitive",
    ],
    suitableHairTypes: [],
    suitableUndertones: [],
    suitableContrasts: [],
    tags: [
      "CeraVe",
      "Cleanser",
      "Hydrating",
      "Barrier",
    ],
    isStylaura: false,
    isActive: true,
  },

  {
    name: "CeraVe Foaming Cleanser",
    brand: "CeraVe",
    category: "Skincare",
    subcategory: "Cleanser",
    description:
      "Foaming cleanser suitable for normal to oily skin.",
    price: 999,
    image: "",
    stock: 20,
    suitableSkinTypes: [
      "Oily",
      "Combination",
      "Normal",
    ],
    suitableHairTypes: [],
    suitableUndertones: [],
    suitableContrasts: [],
    tags: [
      "CeraVe",
      "Cleanser",
      "Foaming",
      "Oil Control",
    ],
    isStylaura: false,
    isActive: true,
  },

  {
    name: "CeraVe Moisturising Cream",
    brand: "CeraVe",
    category: "Skincare",
    subcategory: "Moisturizer",
    description:
      "Moisturizing cream designed for dry and sensitive skin.",
    price: 1299,
    image: "",
    stock: 20,
    suitableSkinTypes: [
      "Dry",
      "Normal",
      "Sensitive",
    ],
    suitableHairTypes: [],
    suitableUndertones: [],
    suitableContrasts: [],
    tags: [
      "CeraVe",
      "Moisturizer",
      "Hydration",
      "Barrier",
    ],
    isStylaura: false,
    isActive: true,
  },

  // =========================================================
  // CETAPHIL — SKINCARE
  // =========================================================

  {
    name: "Cetaphil Gentle Skin Cleanser",
    brand: "Cetaphil",
    category: "Skincare",
    subcategory: "Cleanser",
    description:
      "Gentle daily cleanser for normal to sensitive skin.",
    price: 699,
    image: "",
    stock: 30,
    suitableSkinTypes: [
      "Dry",
      "Normal",
      "Combination",
      "Sensitive",
    ],
    suitableHairTypes: [],
    suitableUndertones: [],
    suitableContrasts: [],
    tags: [
      "Cetaphil",
      "Cleanser",
      "Gentle",
      "Sensitive",
    ],
    isStylaura: false,
    isActive: true,
  },

  {
    name: "Cetaphil Moisturising Lotion",
    brand: "Cetaphil",
    category: "Skincare",
    subcategory: "Moisturizer",
    description:
      "Lightweight moisturizer for everyday hydration.",
    price: 799,
    image: "",
    stock: 30,
    suitableSkinTypes: [
      "Dry",
      "Normal",
      "Combination",
      "Sensitive",
    ],
    suitableHairTypes: [],
    suitableUndertones: [],
    suitableContrasts: [],
    tags: [
      "Cetaphil",
      "Moisturizer",
      "Hydration",
      "Gentle",
    ],
    isStylaura: false,
    isActive: true,
  },

  // =========================================================
  // THE ORDINARY — SKINCARE
  // =========================================================

  {
    name: "The Ordinary Niacinamide 10% + Zinc 1%",
    brand: "The Ordinary",
    category: "Skincare",
    subcategory: "Serum",
    description:
      "Lightweight serum designed for an even-looking complexion.",
    price: 750,
    image: "",
    stock: 25,
    suitableSkinTypes: [
      "Oily",
      "Combination",
      "Normal",
    ],
    suitableHairTypes: [],
    suitableUndertones: [],
    suitableContrasts: [],
    tags: [
      "The Ordinary",
      "Niacinamide",
      "Serum",
      "Combination",
      "Oily",
    ],
    isStylaura: false,
    isActive: true,
  },

  {
    name: "The Ordinary Hyaluronic Acid 2% + B5",
    brand: "The Ordinary",
    category: "Skincare",
    subcategory: "Serum",
    description:
      "Hydrating serum for dry and dehydrated-feeling skin.",
    price: 850,
    image: "",
    stock: 25,
    suitableSkinTypes: [
      "Dry",
      "Normal",
      "Combination",
      "Sensitive",
    ],
    suitableHairTypes: [],
    suitableUndertones: [],
    suitableContrasts: [],
    tags: [
      "The Ordinary",
      "Hyaluronic Acid",
      "Hydration",
      "Serum",
    ],
    isStylaura: false,
    isActive: true,
  },

  // =========================================================
  // TRESemmé — HAIRCARE
  // =========================================================

  {
    name: "TRESemmé Keratin Smooth Shampoo",
    brand: "TRESemmé",
    category: "Haircare",
    subcategory: "Shampoo",
    description:
      "Smoothing shampoo for softer, more manageable-looking hair.",
    price: 599,
    image: "",
    stock: 25,
    suitableSkinTypes: [],
    suitableHairTypes: [
      "Straight",
      "Wavy",
    ],
    suitableUndertones: [],
    suitableContrasts: [],
    tags: [
      "TRESemme",
      "Shampoo",
      "Smooth",
      "Straight",
      "Wavy",
    ],
    isStylaura: false,
    isActive: true,
  },

  {
    name: "TRESemmé Keratin Smooth Conditioner",
    brand: "TRESemmé",
    category: "Haircare",
    subcategory: "Conditioner",
    description:
      "Conditioner designed for smoother, easier-to-manage hair.",
    price: 599,
    image: "",
    stock: 25,
    suitableSkinTypes: [],
    suitableHairTypes: [
      "Straight",
      "Wavy",
    ],
    suitableUndertones: [],
    suitableContrasts: [],
    tags: [
      "TRESemme",
      "Conditioner",
      "Smooth",
      "Wavy",
    ],
    isStylaura: false,
    isActive: true,
  },

  // =========================================================
  // DOVE — HAIRCARE
  // =========================================================

  {
    name: "Dove Hair Therapy Breakage Repair Shampoo",
    brand: "Dove",
    category: "Haircare",
    subcategory: "Shampoo",
    description:
      "Repair-focused shampoo for damaged and stressed-looking hair.",
    price: 599,
    image: "",
    stock: 25,
    suitableSkinTypes: [],
    suitableHairTypes: [
      "Straight",
      "Wavy",
      "Curly",
    ],
    suitableUndertones: [],
    suitableContrasts: [],
    tags: [
      "Dove",
      "Shampoo",
      "Repair",
      "Damage Care",
    ],
    isStylaura: false,
    isActive: true,
  },

  {
    name: "Dove Intense Repair Conditioner",
    brand: "Dove",
    category: "Haircare",
    subcategory: "Conditioner",
    description:
      "Conditioner for smoother and healthier-looking hair.",
    price: 499,
    image: "",
    stock: 25,
    suitableSkinTypes: [],
    suitableHairTypes: [
      "Straight",
      "Wavy",
      "Curly",
    ],
    suitableUndertones: [],
    suitableContrasts: [],
    tags: [
      "Dove",
      "Conditioner",
      "Repair",
      "Moisture",
    ],
    isStylaura: false,
    isActive: true,
  },

  // =========================================================
  // OGX — HAIRCARE
  // =========================================================

  {
    name: "OGX Coconut Milk Shampoo",
    brand: "OGX",
    category: "Haircare",
    subcategory: "Shampoo",
    description:
      "Nourishing shampoo for soft and healthy-looking hair.",
    price: 799,
    image: "",
    stock: 20,
    suitableSkinTypes: [],
    suitableHairTypes: [
      "Wavy",
      "Curly",
      "Coily",
    ],
    suitableUndertones: [],
    suitableContrasts: [],
    tags: [
      "OGX",
      "Coconut",
      "Shampoo",
      "Nourishing",
      "Curly",
    ],
    isStylaura: false,
    isActive: true,
  },

  {
    name: "OGX Coconut Milk Conditioner",
    brand: "OGX",
    category: "Haircare",
    subcategory: "Conditioner",
    description:
      "Nourishing conditioner for softer, smoother-looking hair.",
    price: 799,
    image: "",
    stock: 20,
    suitableSkinTypes: [],
    suitableHairTypes: [
      "Wavy",
      "Curly",
      "Coily",
    ],
    suitableUndertones: [],
    suitableContrasts: [],
    tags: [
      "OGX",
      "Coconut",
      "Conditioner",
      "Nourishing",
      "Curly",
    ],
    isStylaura: false,
    isActive: true,
  },

  // =========================================================
  // PARTNER CLOTHING
  // =========================================================

  {
    name: "Classic Warm Tone Shirt",
    brand: "Partner Edit",
    category: "Clothing",
    subcategory: "Shirt",
    description:
      "A warm-toned everyday shirt selected for warm palettes.",
    price: 1599,
    image: "",
    stock: 15,
    suitableSkinTypes: [],
    suitableHairTypes: [],
    suitableUndertones: [
      "Warm",
    ],
    suitableContrasts: [
      "Medium",
      "High",
    ],
    tags: [
      "Partner",
      "Warm",
      "Shirt",
      "Everyday",
    ],
    isStylaura: false,
    isActive: true,
  },

  {
    name: "Soft Blue Classic Dress",
    brand: "Partner Edit",
    category: "Clothing",
    subcategory: "Dress",
    description:
      "A soft blue dress selected for cool and neutral palettes.",
    price: 2299,
    image: "",
    stock: 15,
    suitableSkinTypes: [],
    suitableHairTypes: [],
    suitableUndertones: [
      "Cool",
      "Neutral",
    ],
    suitableContrasts: [
      "Low",
      "Medium",
    ],
    tags: [
      "Partner",
      "Blue",
      "Cool",
      "Dress",
    ],
    isStylaura: false,
    isActive: true,
  },

  {
    name: "Neutral Everyday Co-Ord",
    brand: "Partner Edit",
    category: "Clothing",
    subcategory: "Co-Ord",
    description:
      "A versatile neutral co-ord designed for flexible styling.",
    price: 1999,
    image: "",
    stock: 15,
    suitableSkinTypes: [],
    suitableHairTypes: [],
    suitableUndertones: [
      "Warm",
      "Cool",
      "Neutral",
    ],
    suitableContrasts: [
      "Low",
      "Medium",
      "High",
    ],
    tags: [
      "Partner",
      "Neutral",
      "Co-Ord",
      "Everyday",
    ],
    isStylaura: false,
    isActive: true,
  },

  // =========================================================
  // PARTNER ACCESSORIES
  // =========================================================

  {
    name: "Gold Minimal Hoop Earrings",
    brand: "Partner Edit",
    category: "Accessories",
    subcategory: "Earrings",
    description:
      "Minimal gold hoops for warm and neutral palettes.",
    price: 699,
    image: "",
    stock: 20,
    suitableSkinTypes: [],
    suitableHairTypes: [],
    suitableUndertones: [
      "Warm",
      "Neutral",
    ],
    suitableContrasts: [
      "Medium",
      "High",
    ],
    tags: [
      "Partner",
      "Gold",
      "Warm",
      "Minimal",
    ],
    isStylaura: false,
    isActive: true,
  },

  {
    name: "Silver Minimal Hoop Earrings",
    brand: "Partner Edit",
    category: "Accessories",
    subcategory: "Earrings",
    description:
      "Minimal silver hoops for cool and neutral palettes.",
    price: 699,
    image: "",
    stock: 20,
    suitableSkinTypes: [],
    suitableHairTypes: [],
    suitableUndertones: [
      "Cool",
      "Neutral",
    ],
    suitableContrasts: [
      "Low",
      "Medium",
    ],
    tags: [
      "Partner",
      "Silver",
      "Cool",
      "Minimal",
    ],
    isStylaura: false,
    isActive: true,
  },

  {
    name: "Tan Structured Everyday Bag",
    brand: "Partner Edit",
    category: "Accessories",
    subcategory: "Bag",
    description:
      "A structured tan bag for warm-toned everyday styling.",
    price: 1899,
    image: "",
    stock: 12,
    suitableSkinTypes: [],
    suitableHairTypes: [],
    suitableUndertones: [
      "Warm",
    ],
    suitableContrasts: [
      "Medium",
      "High",
    ],
    tags: [
      "Partner",
      "Tan",
      "Warm",
      "Bag",
    ],
    isStylaura: false,
    isActive: true,
  },

  {
    name: "Classic Black Structured Bag",
    brand: "Partner Edit",
    category: "Accessories",
    subcategory: "Bag",
    description:
      "A timeless structured black bag for stronger contrast styling.",
    price: 1899,
    image: "",
    stock: 12,
    suitableSkinTypes: [],
    suitableHairTypes: [],
    suitableUndertones: [
      "Warm",
      "Cool",
      "Neutral",
    ],
    suitableContrasts: [
      "Medium",
      "High",
    ],
    tags: [
      "Partner",
      "Black",
      "Classic",
      "High Contrast",
    ],
    isStylaura: false,
    isActive: true,
  },
];

async function seedPartnerProducts() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI is missing from backend/.env"
      );
    }

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "Connected to MongoDB."
    );

    let created = 0;
    let updated = 0;

    for (const productData of partnerProducts) {
      const existingProduct =
        await Product.findOne({
          name: productData.name,
          brand: productData.brand,
        });

      if (existingProduct) {
        Object.assign(
          existingProduct,
          productData
        );

        await existingProduct.save();

        updated++;

        console.log(
          `Updated: ${productData.brand} — ${productData.name}`
        );
      } else {
        await Product.create(
          productData
        );

        created++;

        console.log(
          `Created: ${productData.brand} — ${productData.name}`
        );
      }
    }

    console.log("");
    console.log(
      "================================="
    );
    console.log(
      "PARTNER PRODUCT SEED COMPLETE"
    );
    console.log(
      "================================="
    );
    console.log(
      `Created: ${created}`
    );
    console.log(
      `Updated: ${updated}`
    );
    console.log(
      `Total partner catalogue: ${partnerProducts.length}`
    );
    console.log(
      "================================="

    );

    await mongoose.disconnect();

    process.exit(0);
  } catch (error) {
    console.error(
      "Partner product seed failed:",
      error.message
    );

    await mongoose
      .disconnect()
      .catch(() => {});

    process.exit(1);
  }
}

seedPartnerProducts();