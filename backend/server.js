// import express from "express";
// import mongoose from "mongoose";
// import bodyParser from "body-parser";
// import dotenv from "dotenv";
// import cors from "cors";
// import path from "path";
// import { fileURLToPath } from "url";

// import productRoutes from "./routes/productRoutes.js";
// import authRoutes from "./routes/authRoutes.js";



// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// dotenv.config({ path: path.resolve(__dirname, '.env') });

// const app = express();

// // Middleware
// app.use(cors());
// app.use(bodyParser.json({ limit: "10mb" }));
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// // MongoDB
// const PORT = process.env.PORT || 7000;
// mongoose
//   .connect(process.env.MONGO_URL)
//   .then(() => console.log("✅ MongoDB connected"))
//   .catch((err) => console.error("❌ MongoDB connection error", err));

// // Routes
// app.use("/api/products", productRoutes);
// app.use("/api/auth", authRoutes);


// app.get("/", (req, res) => res.send("API is running..."));

// // Start Server
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";


// For __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// MongoDB Connection (✅ Cleaned — removed deprecated options)
const PORT = process.env.PORT || 7000;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error", err));

// Import auth middleware
import { verifyToken } from "./middleware/auth.js";

// Public routes
app.use("/api/auth", authRoutes);

// Protected routes
app.use("/api/products", verifyToken, productRoutes);
app.use("/api/users", verifyToken, userRoutes);
app.use("/api/cart", verifyToken, cartRoutes);
app.use("/api/orders", verifyToken, orderRoutes);


// Health check
app.get("/", (req, res) => res.send("🟢 Luxoro API is running"));

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));