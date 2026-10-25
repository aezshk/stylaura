
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

dotenv.config();

const createAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!mongoUri) {
      throw new Error("MONGO_URI is not configured.");
    }

    if (!adminPassword || adminPassword.length < 8) {
      throw new Error(
        "Set ADMIN_PASSWORD to a password of at least 8 characters."
      );
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected.");

    const adminEmail = "admin@stylaura.com";
    const adminName = "STYLAURA Admin";

    const existingAdmin = await User.findOne({
      email: adminEmail,
    });

    if (existingAdmin) {
      existingAdmin.role = "admin";
      await existingAdmin.save();

      console.log("Existing account upgraded to admin.");
      console.log(`Admin email: ${adminEmail}`);
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await User.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin account created successfully.");
    console.log(`Admin email: ${adminEmail}`);
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
};

createAdmin();
