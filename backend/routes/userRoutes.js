import express from "express";
import User from "../models/user.js";

const router = express.Router();

// 👥 GET ALL USERS (for admin panel)
router.get("/", async (req, res) => {
  try {
    console.log("📋 Fetching all users for admin panel...");
    
    // Fetch all users but exclude password field for security
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    
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

// 📊 GET USER STATS (for admin dashboard)
router.get("/stats/overview", async (req, res) => {
  try {
    console.log("📊 Fetching user statistics...");
    
    const totalUsers = await User.countDocuments();
    const usersWithPhone = await User.countDocuments({ phone: { $exists: true, $ne: "" } });
    const usersWithImage = await User.countDocuments({ image: { $exists: true, $ne: "" } });
    
    // Get recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    
    const stats = {
      totalUsers,
      usersWithPhone,
      usersWithImage,
      recentUsers
    };
    
    console.log("✅ User stats calculated:", stats);
    res.status(200).json(stats);
  } catch (error) {
    console.error("❌ Error fetching user stats:", error.message);
    res.status(500).json({ message: "Server error while fetching user stats" });
  }
});

export default router;