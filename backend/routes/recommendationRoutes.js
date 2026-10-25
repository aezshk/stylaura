
const express = require("express");

const Product = require("../models/Product");
const ChallengeResult = require("../models/ChallengeResult");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

/*
  GET PERSONALIZED RECOMMENDATIONS
*/

router.get("/", protect, async (req, res) => {
  try {
    const user = req.user;

    const skinProfile = user.skinProfile || {};
    const hairProfile = user.hairProfile || {};
    const colourProfile = user.colourProfile || {};

    /*
      LATEST STYLE CHALLENGE
    */

    const latestChallenge = await ChallengeResult.findOne({
      user: user._id,
    }).sort({ createdAt: -1 });

    const passedChallenge = latestChallenge?.passed === true;

    /*
      ONLY ACTIVE PRODUCTS

      Users who have not passed the Style Challenge
      can only receive STYLAURA products.
    */

    const productFilter = {
      isActive: true,
    };

    if (!passedChallenge) {
      productFilter.isStylaura = true;
    }

    const products = await Product.find(productFilter).sort({
      createdAt: -1,
    });

    /*
      PROFILE FOCUS

      Supported values:
      all, skin, hair, colour
    */

    const requestedFocus = String(
      req.query.focus || "all"
    ).toLowerCase();

    const allowedFocuses = [
      "all",
      "skin",
      "hair",
      "colour",
    ];

    const focus = allowedFocuses.includes(requestedFocus)
      ? requestedFocus
      : "all";

    const userSkinType =
      focus === "all" || focus === "skin"
        ? skinProfile.skinType || ""
        : "";

    const userHairType =
      focus === "all" || focus === "hair"
        ? hairProfile.hairType || ""
        : "";

    const userUndertone =
      focus === "all" || focus === "colour"
        ? colourProfile.undertone || ""
        : "";

    const userContrast =
      focus === "all" || focus === "colour"
        ? colourProfile.contrast || ""
        : "";

    const bestColours =
      (focus === "all" || focus === "colour") &&
      Array.isArray(colourProfile.bestColours)
        ? colourProfile.bestColours
        : [];

    /*
      NORMALIZE VALUES FOR COMPARISON
    */

    const normalize = (value) =>
      String(value || "").trim().toLowerCase();

    const matchesProfileValue = (values, target) => {
      if (
        !target ||
        !Array.isArray(values) ||
        values.length === 0
      ) {
        return false;
      }

      return values.some(
        (value) => normalize(value) === normalize(target)
      );
    };

    /*
      SCORE PRODUCTS

      A product must match at least one relevant
      profile attribute to be recommended.

      Generic tag matches alone do not qualify.
    */

    const scoredProducts = products
      .map((product) => {
        let score = 0;

        const category = normalize(product.category);

        const isMakeup = category === "makeup";
        const isSkincare = category === "skincare";
        const isHaircare = category === "haircare";
        const isClothing = category === "clothing";
        const isAccessories = category === "accessories";

        /*
          SKIN MATCH

          Skin suitability applies to skincare and makeup.
        */

        if (
          userSkinType &&
          (isSkincare || isMakeup) &&
          matchesProfileValue(
            product.suitableSkinTypes,
            userSkinType
          )
        ) {
          score += 4;
        }

        /*
          HAIR MATCH

          Hair suitability applies to haircare.
        */

        if (
          userHairType &&
          isHaircare &&
          matchesProfileValue(
            product.suitableHairTypes,
            userHairType
          )
        ) {
          score += 4;
        }

        /*
          UNDERTONE MATCH

          Undertone suitability applies to makeup,
          clothing and accessories.
        */

        if (
          userUndertone &&
          (isMakeup || isClothing || isAccessories) &&
          matchesProfileValue(
            product.suitableUndertones,
            userUndertone
          )
        ) {
          score += 5;
        }

        /*
          CONTRAST MATCH

          Contrast suitability applies to makeup,
          clothing and accessories.
        */

        if (
          userContrast &&
          (isMakeup || isClothing || isAccessories) &&
          matchesProfileValue(
            product.suitableContrasts,
            userContrast
          )
        ) {
          score += 3;
        }

        /*
          COLOUR PALETTE BONUS

          Only products in colour-relevant categories
          can receive this bonus.

          A palette bonus alone does not qualify
          a product for recommendation.
        */

        if (
          bestColours.length > 0 &&
          (isMakeup || isClothing || isAccessories)
        ) {
          const productText = [
            product.name,
            product.description,
            product.subcategory,
            ...(Array.isArray(product.tags)
              ? product.tags
              : []),
          ]
            .map(normalize)
            .join(" ");

          const colourMatch = bestColours.some(
            (colour) => {
              const normalizedColour = normalize(colour);

              return (
                normalizedColour &&
                productText.includes(normalizedColour)
              );
            }
          );

          if (colourMatch && score > 0) {
            score += 1;
          }
        }

        return {
          ...product.toObject(),
          recommendationScore: score,
        };
      })

      /*
        REMOVE PRODUCTS WITHOUT A REAL PROFILE MATCH
      */

      .filter(
        (product) => product.recommendationScore > 0
      )

      /*
        HIGHEST SCORING PRODUCTS FIRST
      */

      .sort(
        (a, b) =>
          b.recommendationScore - a.recommendationScore
      );

    /*
      CATEGORY GROUPING

      Return a maximum of five products per category.
    */

    const getCategoryProducts = (category) =>
      scoredProducts
        .filter(
          (product) =>
            normalize(product.category) ===
            normalize(category)
        )
        .slice(0, 5);

    const recommendations = {
      makeup: getCategoryProducts("Makeup"),
      skincare: getCategoryProducts("Skincare"),
      haircare: getCategoryProducts("Haircare"),
      clothing: getCategoryProducts("Clothing"),
      accessories: getCategoryProducts("Accessories"),
    };

    /*
      PROFILE SUMMARY

      Preserve all saved profile values for the
      frontend, even when a specific focus is selected.
    */

    const profile = {
      skinType: skinProfile.skinType || null,
      hairType: hairProfile.hairType || null,
      undertone: colourProfile.undertone || null,
      contrast: colourProfile.contrast || null,
    };

    /*
      RESPONSE
    */

    return res.status(200).json({
      profile,

      challenge: {
        hasResult: Boolean(latestChallenge),
        passed: passedChallenge,
        score: latestChallenge?.score ?? null,
        occasion: latestChallenge?.occasion || null,
        discountPercent:
          latestChallenge?.discountPercent ?? 0,
      },

      recommendations,
    });
  } catch (error) {
    console.error(
      "Recommendation error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load personalized recommendations.",
    });
  }
});

module.exports = router;
