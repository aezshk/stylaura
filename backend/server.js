
const dotenv = require("dotenv");

// Load environment variables before importing modules that use them.
dotenv.config();
const emailTestRoutes = require("./routes/emailTestRoutes");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const gameRoutes = require("./routes/gameRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const productImageRoutes = require("./routes/productImageRoutes");
const passwordResetRoutes = require("./routes/passwordResetRoutes");
const hairAnalysisRoutes = require("./routes/hairAnalysisRoutes");

const app = express();

// Connect to MongoDB.
connectDB();

// Middleware.

const allowedOrigins = [
  "http://localhost:5173",
  "https://stylaura-5axp.vercel.app",
  process.env.FRONTEND_URL?.replace(/\/+$/, ""),
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);


// Allow larger analysis images and profile payloads.
app.use(express.json({ limit: "10mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

app.use(cookieParser());

// Backend health check.
app.get("/", (req, res) => {
  res.json({
    message: "STYLAURA backend is running",
  });
});

// API routes.
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/product-images", productImageRoutes);
app.use("/api/email-test", emailTestRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/password-reset", passwordResetRoutes);
app.use("/api/analysis", hairAnalysisRoutes);
// Serve existing local product images.
app.use(
  "/products",
  express.static(path.join(__dirname, "static", "products"))
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`STYLAURA backend running on port ${PORT}`);
});
