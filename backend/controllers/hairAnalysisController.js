
const OpenAI = require("openai");

const ALLOWED_HAIR_TYPES = [
  "Straight",
  "Wavy",
  "Curly",
  "Coily",
];

const ALLOWED_CONCERNS = [
  "Dryness",
  "Frizz",
  "Hair Fall",
  "Damage",
  "Dandruff",
  "Lack of Volume",
];

const MAX_IMAGE_BYTES = 7 * 1024 * 1024;

const IMAGE_SIGNATURES = {
  "image/jpeg": (buffer) =>
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff,

  "image/png": (buffer) =>
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(
      Buffer.from([
        137, 80, 78, 71, 13, 10, 26, 10,
      ])
    ),

  "image/webp": (buffer) =>
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP",
};

function sendError(res, status, message) {
  return res.status(status).json({
    success: false,
    message,
  });
}

function parseImage(image) {
  if (typeof image !== "string") {
    return null;
  }

  const match = image.match(
    /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/
  );

  if (!match) {
    return null;
  }

  const mimeType = match[1];
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, "base64");

  // Reject malformed Base64.
  if (buffer.toString("base64") !== base64Data) {
    return null;
  }

  if (
    buffer.length < 1000 ||
    buffer.length > MAX_IMAGE_BYTES
  ) {
    return null;
  }

  const signatureCheck = IMAGE_SIGNATURES[mimeType];

  if (!signatureCheck || !signatureCheck(buffer)) {
    return null;
  }

  return { mimeType, buffer };
}

function cleanStringArray(value, maxItems = 4) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item) =>
        typeof item === "string" &&
        item.trim().length > 0
    )
    .slice(0, maxItems)
    .map((item) => item.trim().slice(0, 300));
}

const analyzeHair = async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error(
        "Hair analysis unavailable: OPENAI_API_KEY is missing."
      );

      return sendError(
        res,
        503,
        "Hair analysis is not configured yet. Please try again later."
      );
    }

    const { image, hairType, concern } = req.body || {};

    if (
      !ALLOWED_HAIR_TYPES.includes(hairType) ||
      !ALLOWED_CONCERNS.includes(concern)
    ) {
      return sendError(
        res,
        400,
        "Please select a valid hair type and concern."
      );
    }

    const parsedImage = parseImage(image);

    if (!parsedImage) {
      return sendError(
        res,
        400,
        "Please upload a valid JPEG, PNG, or WebP image under 7 MB."
      );
    }

    const { mimeType, buffer } = parsedImage;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const dataUrl =
      `data:${mimeType};base64,${buffer.toString("base64")}`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",

      instructions: `
You are STYLAURA's cosmetic hair-care assistant.

Analyze the supplied image for suitability for a cosmetic hair-care review.
A suitable image should clearly show hair or scalp. A face is not required.

Reject unrelated images, blank images, and images where hair or scalp
cannot reasonably be assessed.

Return a valid JSON object with exactly these fields:
{
  "validImage": true,
  "summary": "A short, cautious cosmetic summary",
  "observations": ["Visible characteristic"],
  "recommendations": ["General cosmetic care suggestion"]
}

If the image is unsuitable, return:
{
  "validImage": false,
  "summary": "The image does not clearly show hair or scalp.",
  "observations": [],
  "recommendations": []
}

Only describe characteristics visible in the image. Lighting, focus,
styling, and image quality may limit observations.

Do not diagnose scalp disease or dandruff. Do not determine the cause
of hair loss or claim to measure hydration or sensitivity from a photo.

Do not invent observations that cannot be seen.

Recommendations must be general, practical cosmetic-care suggestions.
Return no more than four observations and four recommendations.
Do not provide medical diagnoses or treatment instructions.

The output must be JSON only, with no Markdown fences or extra text.
`,

      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                `Selected hair type: ${hairType}. ` +
                `Main concern: ${concern}. ` +
                "Review this image for a cosmetic hair-care routine. " +
                "Return the result as a valid JSON object.",
            },
            {
              type: "input_image",
              image_url: dataUrl,
              detail: "high",
            },
          ],
        },
      ],

      text: {
        format: {
          type: "json_object",
        },
      },
    });

    const output = response.output_text;

    if (!output) {
      console.error(
        "Hair analysis returned an empty response."
      );

      return sendError(
        res,
        502,
        "We couldn't read the analysis. Please try again."
      );
    }

    let analysis;

    try {
      analysis = JSON.parse(output);
    } catch {
      console.error(
        "Hair analysis returned invalid JSON."
      );

      return sendError(
        res,
        502,
        "The analysis response was invalid. Please try again."
      );
    }

    if (
      !analysis ||
      typeof analysis !== "object" ||
      Array.isArray(analysis) ||
      typeof analysis.validImage !== "boolean"
    ) {
      return sendError(
        res,
        502,
        "The analysis response was incomplete. Please try again."
      );
    }

    if (analysis.validImage === false) {
      return sendError(
        res,
        422,
        "This photo does not clearly show hair or scalp. Please upload a clear hair photo."
      );
    }

    if (
      typeof analysis.summary !== "string" ||
      !analysis.summary.trim() ||
      !Array.isArray(analysis.observations) ||
      !Array.isArray(analysis.recommendations)
    ) {
      return sendError(
        res,
        502,
        "The analysis response was incomplete. Please try again."
      );
    }

    return res.status(200).json({
      success: true,
      analysis: {
        validImage: true,
        summary: analysis.summary.trim().slice(0, 1200),
        observations: cleanStringArray(
          analysis.observations
        ),
        recommendations: cleanStringArray(
          analysis.recommendations
        ),
      },
    });
  } catch (error) {
    // Never log the API key or submitted image.
    console.error(
      "Hair analysis error:",
      error.status || "",
      error.message || "Unknown error"
    );

    if (
      error.status === 401 ||
      error.status === 403
    ) {
      return sendError(
        res,
        503,
        "The AI service credentials need to be checked."
      );
    }

    if (error.status === 429) {
      return sendError(
        res,
        429,
        "The AI service is busy or its usage limit has been reached. Please try again later."
      );
    }

    return sendError(
      res,
      502,
      "Hair analysis failed. Please try again shortly."
    );
  }
};

module.exports = {
  analyzeHair,
};
