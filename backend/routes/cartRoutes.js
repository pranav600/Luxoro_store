import express from "express";
import Cart from "../models/cart.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// 🛒 GET USER CART
router.get("/", authenticateToken, async (req, res) => {
  try {
    console.log(`🛒 Fetching cart for user: ${req.user.id}`);
    
    let cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      // Create empty cart if none exists
      cart = new Cart({ userId: req.user.id, items: [] });
      await cart.save();
      console.log("✅ Created new empty cart for user");
    }
    
    console.log(`✅ Cart found with ${cart.items.length} items`);
    res.status(200).json({ items: cart.items });
  } catch (error) {
    console.error("❌ Error fetching cart:", error.message);
    res.status(500).json({ message: "Server error while fetching cart" });
  }
});

// 🛒 SAVE/UPDATE USER CART
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { items } = req.body;
    console.log(`🛒 Saving cart for user: ${req.user.id} with ${items.length} items`);
    
    let cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      // Create new cart
      cart = new Cart({ userId: req.user.id, items });
    } else {
      // Update existing cart
      cart.items = items;
    }
    
    await cart.save();
    console.log("✅ Cart saved successfully");
    res.status(200).json({ message: "Cart saved successfully", items: cart.items });
  } catch (error) {
    console.error("❌ Error saving cart:", error.message);
    res.status(500).json({ message: "Server error while saving cart" });
  }
});

// 🛒 CLEAR USER CART
router.delete("/", authenticateToken, async (req, res) => {
  try {
    console.log(`🛒 Clearing cart for user: ${req.user.id}`);
    
    let cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      return res.status(200).json({ message: "Cart already empty" });
    }
    
    cart.items = [];
    await cart.save();
    
    console.log("✅ Cart cleared successfully");
    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("❌ Error clearing cart:", error.message);
    res.status(500).json({ message: "Server error while clearing cart" });
  }
});

// 🛒 ADD ITEM TO CART
router.post("/add", authenticateToken, async (req, res) => {
  try {
    const { productId, name, price, image, size, quantity } = req.body;
    console.log(`🛒 Adding item to cart for user: ${req.user.id}`);
    
    let cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId === productId && item.size === size
    );
    
    if (existingItemIndex > -1) {
      // Update quantity of existing item
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({ productId, name, price, image, size, quantity });
    }
    
    await cart.save();
    console.log("✅ Item added to cart successfully");
    res.status(200).json({ message: "Item added to cart", items: cart.items });
  } catch (error) {
    console.error("❌ Error adding item to cart:", error.message);
    res.status(500).json({ message: "Server error while adding item to cart" });
  }
});

// 🛒 REMOVE ITEM FROM CART
router.delete("/item/:productId", authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    console.log(`🛒 Removing item ${productId} from cart for user: ${req.user.id}`);
    
    let cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    
    cart.items = cart.items.filter(item => item.productId !== productId);
    await cart.save();
    
    console.log("✅ Item removed from cart successfully");
    res.status(200).json({ message: "Item removed from cart", items: cart.items });
  } catch (error) {
    console.error("❌ Error removing item from cart:", error.message);
    res.status(500).json({ message: "Server error while removing item from cart" });
  }
});

export default router;
