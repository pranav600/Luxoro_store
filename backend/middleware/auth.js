import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const requireAdmin = (req, res, next) => {
  try {
    // verifyToken should have populated req.user
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const role = req.user.role || req.user.isAdmin ? 'admin' : req.user.role;
    if (role !== 'admin') {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }
    next();
  } catch (err) {
    console.error("Admin guard error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(500).json({ message: "Server error" });
  }
};
