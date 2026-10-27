const express = require("express");

const {
  registerUser,
  loginUser,
  saveSkinProfile,
  saveHairProfile,
  saveColourProfile,
  logoutUser,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// REGISTER
router.post("/register", registerUser);

// LOGIN
router.post("/login", loginUser);

// LOGOUT
router.post("/logout", logoutUser);

// CURRENT USER
// Return profile information without large Base64 image data.
router.get("/me", protect, (req, res) => {
  const user = req.user;

  const skinProfile = user.skinProfile
    ? {
        ...user.skinProfile.toObject?.() ?? user.skinProfile,
        image: user.skinProfile.image ? true : null,
      }
    : null;

  const hairProfile = user.hairProfile
    ? {
        ...user.hairProfile.toObject?.() ?? user.hairProfile,
        image: user.hairProfile.image ? true : null,
      }
    : null;

  const colourProfile = user.colourProfile
    ? {
        ...user.colourProfile.toObject?.() ?? user.colourProfile,
        image: user.colourProfile.image ? true : null,
      }
    : null;

  return res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skinProfile,
      hairProfile,
      colourProfile,
    },
  });
});

// SAVE SKIN PROFILE
router.post("/skin-profile", protect, saveSkinProfile);

// SAVE HAIR PROFILE
router.post("/hair-profile", protect, saveHairProfile);

// SAVE COLOUR PROFILE
router.post("/colour-profile", protect, saveColourProfile);

module.exports = router;