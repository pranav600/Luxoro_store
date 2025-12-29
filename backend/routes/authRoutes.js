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
import nodemailer from "nodemailer";

/**
 * Utility: Send OTP Email
 */
const sendOtpEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `"Luxoro Store" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP for Luxoro Signup",
      text: `Your OTP code is ${otp}. It expires in 10 minutes.`,
      html: `<b>Your OTP code is ${otp}</b>. It expires in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 OTP sent to ${email}`);
  } catch (error) {
    console.error("❌ Email send error:", error);
    throw new Error("Failed to send OTP email");
  }
};

/**
 * 🔐 SIGNUP ROUTE (Step 1)
 */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, phone, image } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const hashedPassword = await bcrypt.hash(password, 10);

    if (user && !user.isVerified) {
      // Update existing unverified user
      user.name = name;
      user.password = hashedPassword;
      user.phone = phone;
      user.image = image || "";
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        image: image || "",
        otp,
        otpExpires,
        isVerified: false,
      });
    }

    // Send Email
    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("🚨 Signup Error:", error);
    res.status(500).json({ message: error.message || "Signup failed" });
  }
});

/**
 * ✅ VERIFY OTP ROUTE (Step 2)
 */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Valid OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

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
    console.error("🚨 Verify OTP Error:", error);
    res.status(500).json({ message: error.message || "Verification failed" });
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
