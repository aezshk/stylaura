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
router.get("/me", protect, (req, res) => {
  res.status(200).json({
    user: {
  id: req.user._id,
  name: req.user.name,
  email: req.user.email,
  role: req.user.role,
  skinProfile: req.user.skinProfile,
  hairProfile: req.user.hairProfile,
  colourProfile: req.user.colourProfile,
},
  });
});


// SAVE SKIN PROFILE
router.post(
  "/skin-profile",
  protect,
  saveSkinProfile
);


// SAVE HAIR PROFILE
router.post(
  "/hair-profile",
  protect,
  saveHairProfile
);


// SAVE COLOUR PROFILE
router.post(
  "/colour-profile",
  protect,
  saveColourProfile
);

module.exports = router;