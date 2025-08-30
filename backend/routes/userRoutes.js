import express from "express";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// 👤 GET LOGGED-IN USER PROFILE
router.get("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // 🔑 Find user by ID from token
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Error fetching profile:", error.message);
    res.status(500).json({ message: "Server error while fetching profile" });
  }
});

// 📊 GET USER STATS (for admin dashboard) - ⚡ Moved above /:id
router.get("/stats/overview", async (req, res) => {
  try {
    console.log("📊 Fetching user statistics...");

    const totalUsers = await User.countDocuments();
    const usersWithPhone = await User.countDocuments({
      phone: { $exists: true, $ne: "" },
    });
    const usersWithImage = await User.countDocuments({
      image: { $exists: true, $ne: "" },
    });

    // Get recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    const stats = { totalUsers, usersWithPhone, usersWithImage, recentUsers };

    console.log("✅ User stats calculated:", stats);
    res.status(200).json(stats);
  } catch (error) {
    console.error("❌ Error fetching user stats:", error.message);
    res.status(500).json({ message: "Server error while fetching user stats" });
  }
});

// 👥 GET ALL USERS (for admin panel)
router.get("/", async (req, res) => {
  try {
    console.log("📋 Fetching all users for admin panel...");
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });
    console.log(`✅ Found ${users.length} users`);
    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error.message);
    res.status(500).json({ message: "Server error while fetching users" });
  }
});

// 👤 GET USER BY ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Fetching user with ID: ${id}`);

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`✅ User found: ${user.name}`);
    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Error fetching user:", error.message);
    res.status(500).json({ message: "Server error while fetching user" });
  }
});

// 🗑️ DELETE USER (admin only)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Attempting to delete user with ID: ${id}`);

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      console.log(`❌ User with ID ${id} not found`);
      return res.status(404).json({ message: "User not found" });
    }

    console.log(
      `✅ User ${deletedUser.name} (${deletedUser._id}) deleted successfully`
    );
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting user:", error.message);
    res.status(500).json({ message: "Server error while deleting user" });
  }
});

export default router;
