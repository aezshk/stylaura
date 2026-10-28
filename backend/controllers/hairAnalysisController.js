
const ALLOWED_HAIR_TYPES = [
  "Straight",
  "Wavy",
  "Curly",
  "Coily",
];

const CARE_GUIDES = {
  Dryness: {
    summary:
      "Your general care plan focuses on helping hair feel softer and reducing dryness.",
    observations: [
      "Selected concern: Dryness",
      "Suggestions are based on your selections, not photo analysis.",
    ],
    recommendations: [
      "Use a gentle shampoo suited to your hair.",
      "Apply conditioner to the lengths after washing.",
      "Consider a leave-in conditioner if your hair feels dry.",
      "Reduce excessive heat styling and use heat protection when needed.",
    ],
  },

  Frizz: {
    summary:
      "Your general care plan focuses on smoother-looking hair and frizz management.",
    observations: [
      "Selected concern: Frizz",
      "Suggestions are based on your selections, not photo analysis.",
    ],
    recommendations: [
      "Condition your hair after shampooing.",
      "Detangle gently with a wide-tooth comb.",
      "Consider a leave-in conditioner or anti-frizz product.",
      "Reduce rough towel rubbing and excessive heat styling.",
    ],
  },

  "Hair Fall": {
    summary:
      "Your general care plan focuses on gentle handling and reducing avoidable hair breakage.",
    observations: [
      "Selected concern: Hair Fall",
      "A photo or selected concern cannot establish the cause of hair loss.",
    ],
    recommendations: [
      "Avoid tight hairstyles that pull on the roots.",
      "Detangle gently and avoid pulling wet hair.",
      "Use a conditioner to help reduce breakage while combing.",
      "Seek medical advice if hair loss is sudden, persistent, or worsening.",
    ],
  },

  Damage: {
    summary:
      "Your general care plan focuses on reducing further damage and improving manageability.",
    observations: [
      "Selected concern: Damage",
      "Suggestions are based on your selections, not photo analysis.",
    ],
    recommendations: [
      "Use conditioner after washing.",
      "Limit high-heat styling and use heat protection.",
      "Handle wet hair gently and avoid aggressive brushing.",
      "Consider trimming split ends if they persist.",
    ],
  },

  Dandruff: {
    summary:
      "Your general care plan focuses on scalp-care habits. This tool cannot diagnose dandruff.",
    observations: [
      "Selected concern: Dandruff",
      "Scalp conditions cannot be confirmed by this rule-based assessment.",
    ],
    recommendations: [
      "Wash your scalp regularly with a routine suited to your needs.",
      "Avoid scratching or irritating the scalp.",
      "If flakes persist, consider an appropriate anti-dandruff product and follow its label.",
      "Seek medical advice for persistent irritation, pain, or worsening symptoms.",
    ],
  },

  "Lack of Volume": {
    summary:
      "Your general care plan focuses on lightweight care and fuller-looking styles.",
    observations: [
      "Selected concern: Lack of Volume",
      "Suggestions are based on your selections, not photo analysis.",
    ],
    recommendations: [
      "Consider a lightweight shampoo and conditioner.",
      "Apply heavier conditioners mainly to the lengths and ends.",
      "Try gentle root-lifting styling techniques.",
      "Avoid applying too much styling product at the roots.",
    ],
  },
};

const analyzeHair = async (req, res) => {
  try {
    const { hairType, concern } = req.body || {};

    if (!ALLOWED_HAIR_TYPES.includes(hairType)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid hair type.",
      });
    }

    const guide = CARE_GUIDES[concern];

    if (!guide) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid hair-care concern.",
      });
    }

    const typeAdvice = {
      Straight:
        "Keep products lightweight if your hair gets weighed down easily.",
      Wavy:
        "Try gentle scrunching and avoid brushing waves excessively when dry.",
      Curly:
        "Consider detangling gently while conditioned to help preserve curl shape.",
      Coily:
        "Consider gentle section-by-section detangling and regular conditioning.",
    };

    return res.status(200).json({
      success: true,
      mode: "rule_based",
      message:
        "This is a free general-care guide. Your uploaded photo has not been analyzed.",
      analysis: {
        mode: "rule_based",
        validImage: null,
        photoAnalyzed: false,
        summary: guide.summary,
        observations: guide.observations,
        recommendations: [
          typeAdvice[hairType],
          ...guide.recommendations,
        ].slice(0, 4),
      },
    });
  } catch (error) {
    console.error(
      "Free hair-care assessment error:",
      error.message || "Unknown error"
    );

    return res.status(500).json({
      success: false,
      message: "We couldn't prepare your care guide. Please try again.",
    });
  }
};

module.exports = {
  analyzeHair,
};
