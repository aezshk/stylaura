const express = require("express");

const {
  requestPasswordReset,
  resetPassword,
} = require("../controllers/passwordResetController");

const router = express.Router();

router.post("/request", requestPasswordReset);
router.post("/reset/:token", resetPassword);

module.exports = router;