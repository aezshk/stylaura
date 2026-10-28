
const express = require("express");
const {
  analyzeHair,
} = require("../controllers/hairAnalysisController");

const router = express.Router();

router.post("/hair", analyzeHair);

module.exports = router;
