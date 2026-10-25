
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { sendEmail } = require("../config/brevo");

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

// Request a password-reset email
const requestPasswordReset = async (req, res) => {
  try {
    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    if (!email) {
      return res.status(400).json({
        message: "Please provide your email address.",
      });
    }

    const successMessage =
      "If an account exists for that email, password-reset instructions will be sent.";

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message: successMessage,
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpires = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await user.save();

    const resetUrl =
      `${FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      const safeName = String(user.name || "there").replace(
        /[&<>"']/g,
        (character) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[character]
      );

      await sendEmail({
        to: user.email,
        subject: "Reset your STYLAURA password",
        htmlContent: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#333;line-height:1.6;">
            <h1 style="color:#8b5e83;">STYLAURA</h1>
            <h2>Password reset request</h2>
            <p>Hello ${safeName},</p>
            <p>We received a request to reset your STYLAURA password.</p>
            <p>This link expires in 15 minutes and can only be used once.</p>
            <p>
              <a href="${resetUrl}"
                 style="display:inline-block;background:#8b5e83;color:white;padding:12px 22px;text-decoration:none;border-radius:24px;">
                Reset my password
              </a>
            </p>
            <p>If you did not request this, you can safely ignore this email.</p>
          </div>
        `,
      });
    } catch (emailError) {
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      console.error(
        "Password-reset email failed:",
        emailError.message
      );

      return res.status(503).json({
        message:
          "Unable to send the reset email right now. Please try again later.",
      });
    }

    return res.status(200).json({
      message: successMessage,
    });
  } catch (error) {
    console.error(
      "Password-reset request error:",
      error.message
    );

    return res.status(500).json({
      message: "Unable to process your request.",
    });
  }
};

// Set a new password using the reset token
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (
      !token ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        message: "Token and new password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long.",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({
        message: "This reset link is invalid or has expired.",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.status(200).json({
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    console.error(
      "Password reset error:",
      error.message
    );

    return res.status(500).json({
      message: "Unable to reset your password. Please try again.",
    });
  }
};

module.exports = {
  requestPasswordReset,
  resetPassword,
};
