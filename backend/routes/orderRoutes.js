// 

import express from "express";
import Order from "../models/order.js";

export const router = express.Router();

// ============================
// Get all orders (Admin)
// ============================
router.get("/all", async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
});

// ============================
// Get order by ID
// ============================
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "userId",
      "name email"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
});

// ============================
// Create a new order
// ============================
router.post("/", async (req, res) => {
  try {
    const {
      items,
      total,
      subtotal,
      shippingAddress,
      paymentMethod,
      discount,
      shippingCost,
      userId, // now passed directly from frontend
    } = req.body;

    const order = new Order({
      userId,
      items,
      total,
      subtotal,
      shippingAddress,
      paymentMethod,
      discount: discount || { amount: 0 },
      shippingCost: shippingCost || 0,
      status: "pending",
      paymentStatus: "pending",
    });

    const savedOrder = await order.save();

    await savedOrder.populate("userId", "name email");

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
});

// ============================
// Update order status (Admin)
// ============================
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("userId", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
});

export default router;