
const express = require("express");
const { sendEmail } = require("../config/brevo");
const protect = require("../middleware/authMiddleware");
const adminProtect = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/", protect, adminProtect, async (req, res) => {
  try {
    const to = req.body.to;

    if (!to || typeof to !== "string") {
      return res.status(400).json({
        message: "Provide a test recipient email address.",
      });
    }

    await sendEmail({
      to,
      subject: "STYLAURA — Brevo test email",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>STYLAURA email test</h2>
          <p>Your Brevo integration is connected successfully.</p>
          <p>You're ready to continue setting up STYLAURA emails.</p>
        </div>
      `,
    });

    return res.json({
      message: "Test email accepted by Brevo.",
    });
  } catch (error) {
    console.error("Brevo test email failed:", error.message);

    return res.status(502).json({
      message: "Unable to send test email. Check the backend logs.",
    });
  }
});

module.exports = router;
