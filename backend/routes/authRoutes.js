import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.js";

dotenv.config();
const router = express.Router();

/**
 * Utility: Generate JWT
 */
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("❌ JWT_SECRET is not defined in .env");
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

/**
 * 🔐 SIGNUP ROUTE
 */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, phone, image } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      image: image || "",
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
      },
    });
  } catch (error) {
    console.error("🚨 Signup Error:", error);
    res.status(500).json({ message: error.message || "Signup failed" });
  }
});

/**
 * 🔑 LOGIN ROUTE
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid credentials (user not found)" });
    }

    if (!user.password) {
      console.error("⚠️ User found but password missing in DB:", user.email);
      return res
        .status(500)
        .json({ message: "User password is missing in database" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid credentials (wrong password)" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
      },
    });
  } catch (error) {
    console.error("🚨 Login Error:", error);
    res.status(500).json({ message: error.message || "Login failed" });
  }
});

export default router;
