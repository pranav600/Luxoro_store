// // 

// import express from "express";
// import Order from "../models/order.js";
// import { requireAdmin } from "../middleware/auth.js";

// export const router = express.Router();

// // ============================
// // Get all orders (Admin)
// // ============================
// router.get("/all", requireAdmin, async (req, res) => {
//   try {
//     const orders = await Order.find({})
//       .populate("userId", "name email")
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       orders,
//     });
//   } catch (error) {
//     console.error("Error fetching all orders:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch orders",
//       error: error.message,
//     });
//   }
// });

// // ============================
// // Get current user's orders
// // Requires auth middleware to set req.user (mounted at app.use('/api/orders', verifyToken, router))
// // ============================
// router.get("/", async (req, res) => {
//   try {
//     const userId = req.user?._id;
//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized: missing authenticated user",
//       });
//     }

//     const orders = await Order.find({ userId }).sort({ createdAt: -1 });

//     // Returning plain array keeps compatibility with existing frontend usage
//     // while still including a success flag for consumers that expect it.
//     return res.status(200).json(orders);
//   } catch (error) {
//     console.error("Error fetching user's orders:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch user's orders",
//       error: error.message,
//     });
//   }
// });

// // ============================
// // Get orders by User (Admin)
// // NOTE: Place BEFORE '/:id' to avoid route conflicts
// // ============================
// router.get("/user/:userId", requireAdmin, async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const orders = await Order.find({ userId })
//       .populate("userId", "name email")
//       .sort({ createdAt: -1 });

//     return res.status(200).json({
//       success: true,
//       orders,
//     });
//   } catch (error) {
//     console.error("Error fetching user orders:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch user orders",
//       error: error.message,
//     });
//   }
// });

// // ============================
// // Get order by ID
// // ============================
// router.get("/:id", async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id).populate(
//       "userId",
//       "name email"
//     );

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       order,
//     });
//   } catch (error) {
//     console.error("Error fetching order:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch order",
//       error: error.message,
//     });
//   }
// });

// // ============================
// // Create a new order
// // ============================
// router.post("/", async (req, res) => {
//   try {
//     const {
//       items,
//       total,
//       subtotal,
//       shippingAddress,
//       paymentMethod,
//       discount,
//       shippingCost,
//     } = req.body;

//     // Prefer authenticated user from token (server mounts verifyToken for /api/orders)
//     const authUserId = req.user?._id;
//     if (!authUserId) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized: missing authenticated user",
//       });
//     }

//     // Basic validation
//     if (!Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({ success: false, message: "Items are required" });
//     }
//     if (!total || !subtotal || !paymentMethod || !shippingAddress) {
//       return res.status(400).json({ success: false, message: "Missing required fields" });
//     }

//     const order = new Order({
//       userId: authUserId,
//       items,
//       total,
//       subtotal,
//       shippingAddress,
//       paymentMethod,
//       discount: discount || { amount: 0 },
//       shippingCost: shippingCost || 0,
//       status: "pending",
//       paymentStatus: "pending",
//     });

//     const savedOrder = await order.save();

//     await savedOrder.populate("userId", "name email");

//     res.status(201).json({
//       success: true,
//       message: "Order created successfully",
//       order: savedOrder,
//     });
//   } catch (error) {
//     console.error("Error creating order:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to create order",
//       error: error.message,
//     });
//   }
// });

// // ============================
// // Update order status (Admin)
// // ============================
// router.patch("/:id/status", requireAdmin, async (req, res) => {
//   try {
//     const { status } = req.body;

//     const order = await Order.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       { new: true }
//     ).populate("userId", "name email");

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       order,
//     });
//   } catch (error) {
//     console.error("Error updating order status:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to update order status",
//       error: error.message,
//     });
//   }
// });

// export default router;

import express from "express";
import Order from "../models/order.js";
import jwt from "jsonwebtoken";

const router = express.Router();

/* ============================
   ADMIN AUTH MIDDLEWARE
============================ */
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Admin access required" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: "Invalid token" });
  }
};

/* ============================
   GET ALL ORDERS (ADMIN)
============================ */
router.get("/all", requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Admin order fetch failed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
});

/* ============================
   UPDATE ORDER STATUS (ADMIN)
============================ */
router.patch("/:orderId/status", requireAdmin, async (req, res) => {
  const { status } = req.body;

  if (!["pending", "confirmed", "cancelled"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status",
    });
  }

  try {
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    ).populate("userId", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Order update failed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update order",
    });
  }
});

export default router;