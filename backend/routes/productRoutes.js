// import express from "express";
// import multer from "multer";
// import path from "path";
// import { fileURLToPath } from "url";

// import {
//   getProducts,
//   createProduct,
// } from "../controllers/productController.js";

// const router = express.Router();
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Multer setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) =>
//     cb(null, path.join(__dirname, "../public/assets")),
//   filename: (req, file, cb) =>
//     cb(null, Date.now() + path.extname(file.originalname)),
// });
// const upload = multer({ storage });

// router.get("/", getProducts);
// router.get("/category/:category", getProducts);
// router.post("/", upload.single("image"), createProduct);

// export default router;


import express from "express";
import multer from "multer";
import { storage } from "../cloudinaryConfig.js";

import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

// Use multer with Cloudinary storage
const upload = multer({ storage });

// Routes
router.get("/", getProducts); // /api/products
router.get("/category/:category", getProducts); // optional if needed
router.get("/:id", getProductById); // /api/products/:id
router.post("/", upload.single("image"), createProduct);
router.put("/:id", upload.single("image"), updateProduct);
router.delete("/:id", deleteProduct);

export default router;