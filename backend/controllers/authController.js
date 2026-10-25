const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "Please provide name, email and password.",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        message:
          "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    res.status(201).json({
      message:
        "Account created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(
      "Registration error:",
      error.message
    );

    res.status(500).json({
      message:
        "Server error during registration.",
    });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Please provide email and password.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.cookie(
      "stylauraToken",
      token,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
        maxAge:
          7 *
          24 *
          60 *
          60 *
          1000,
      }
    );

    res.status(200).json({
      message:
        "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error.message
    );

    res.status(500).json({
      message:
        "Server error during login.",
    });
  }
};


const saveSkinProfile = async (
  req,
  res
) => {
  try {
    const {
      image,
      skinType,
      hydration,
      texture,
      sensitivity,
    } = req.body;

    req.user.skinProfile = {
      image: image || null,
      skinType: skinType || null,
      hydration: hydration || null,
      texture: texture || null,
      sensitivity:
        sensitivity || null,
      updatedAt: new Date(),
    };

    await req.user.save();

    res.status(200).json({
      message:
        "Skin profile saved successfully.",
      skinProfile:
        req.user.skinProfile,
    });
  } catch (error) {
    console.error(
      "Save skin profile error:",
      error.message
    );

    res.status(500).json({
      message:
        "Unable to save skin profile.",
    });
  }
};


const saveHairProfile = async (
  req,
  res
) => {
  try {
    const {
      image,
      hairType,
      concern,
    } = req.body;

    req.user.hairProfile = {
      image: image || null,
      hairType: hairType || null,
      concern: concern || null,
      updatedAt: new Date(),
    };

    await req.user.save();

    res.status(200).json({
      message:
        "Hair profile saved successfully.",
      hairProfile:
        req.user.hairProfile,
    });
  } catch (error) {
    console.error(
      "Save hair profile error:",
      error.message
    );

    res.status(500).json({
      message:
        "Unable to save hair profile.",
    });
  }
};


const saveColourProfile = async (
  req,
  res
) => {
  try {
    const {
      image,
      undertone,
      contrast,
      season,
      bestColours,
      avoidColours,
    } = req.body;

    req.user.colourProfile = {
      image: image || null,
      undertone:
        undertone || null,
      contrast:
        contrast || null,
      season:
        season || null,
      bestColours:
        bestColours || [],
      avoidColours:
        avoidColours || [],
      updatedAt: new Date(),
    };

    await req.user.save();

    res.status(200).json({
      message:
        "Colour profile saved successfully.",
      colourProfile:
        req.user.colourProfile,
    });
  } catch (error) {
    console.error(
      "Save colour profile error:",
      error.message
    );

    res.status(500).json({
      message:
        "Unable to save colour profile.",
    });
  }
};


const logoutUser = async (
  req,
  res
) => {
  try {
    res.cookie(
      "stylauraToken",
      "",
      {
        httpOnly: true,
        expires: new Date(0),
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
      }
    );

    res.status(200).json({
      message:
        "Logout successful.",
    });
  } catch (error) {
    console.error(
      "Logout error:",
      error.message
    );

    res.status(500).json({
      message:
        "Server error during logout.",
    });
  }
};


module.exports = {
  registerUser,
  loginUser,
  saveSkinProfile,
  saveHairProfile,
  saveColourProfile,
  logoutUser,
};