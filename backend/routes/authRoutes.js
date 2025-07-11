import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.js";

dotenv.config();
const router = express.Router();

// 🔐 SIGNUP ROUTE
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, phone, image } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      image, // 👈 store image if provided
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image || "",
      },
    });
  } catch (error) {
    console.error("🚨 Signup Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔑 LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image || "",
      },
    });
  } catch (error) {
    console.error("🚨 Login Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;