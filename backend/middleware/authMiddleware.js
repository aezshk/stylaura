const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.stylauraToken;

    if (!token) {
      return res.status(401).json({
        message: "Not authenticated.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.userId).select(
      "-password"
    );

    if (!user) {
      return res.status(401).json({
        message: "User not found.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error(
      "Authentication error:",
      error.message
    );

    return res.status(401).json({
      message: "Invalid or expired authentication.",
    });
  }
};


module.exports = protect;