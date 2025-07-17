// import Tops from "../models/tops.js";
// import Bottoms from "../models/bottoms.js";
// import Accessories from "../models/accessories.js";


// // Helper to select model by category
// function getModelByCategory(category){
//   switch ((category || '').toLowerCase()) {
//     case "tops": return Tops;
//     case "bottoms": return Bottoms;
//     case "accessories": return Accessories;
//     default: return null;
//   }
// }

// // GET all or by category
// export const getProducts = async (req, res) => {
//   try {
//     const { category } = req.query;
//     const Model = getModelByCategory(category);
//     if (!Model) {
//       return res.status(400).json({ error: "Invalid or missing category" });
//     }
//     const filter = category ? { category } : {};
//     const products = await Model.find(filter);
//     res.json(products);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch products" });
//   }
// };

// // CREATE product
// export const createProduct = async (req, res) => {
//   try {
//     let { title, price, oldPrice, category, subCategory, gender } = req.body;
//     if (!title || !price || !category || !subCategory || !req.file) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     // Convert comma-separated string to array for accessories
//     if (category === "accessories" && typeof subCategory === "string") {
//       subCategory = subCategory.split(",").map((s) => s.trim()).filter(Boolean);
//     }

//     const image = req.file.path; // Cloudinary URL
//     const Model = getModelByCategory(category);
//     const product = new Model({ title, price, oldPrice, category, subCategory, image, gender });
//     await product.save();


//     res.status(201).json({ message: "Product added!", product });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

import Summer from "../models/summer.js";
import Royal from "../models/royal.js";
import Winter from "../models/winter.js";
import Accessories from "../models/accessories.js";
import { storage } from "../cloudinaryConfig.js";
import multer from "multer";

const upload = multer({ storage });

// 🔧 Get correct model based on category
function getModelByCategory(category) {
  switch ((category || "").toLowerCase()) {
    case "summer":
      return Summer;
    case "winter":
      return Winter;
    case "royal":
      return Royal;
    case "accessories":
      return Accessories;
    default:
      return null;
  }
}

// 📦 GET all or by category
export const getProducts = async (req, res) => {
  try {
    const { category } = req.query;
    const Model = getModelByCategory(category);
    if (!Model) {
      return res.status(400).json({ error: "Invalid or missing category" });
    }
    let filter = {};
    if (category) filter.category = category;
    if (req.query.gender) filter.gender = req.query.gender;
    let products = await Model.find(filter);
    // If category is accessories, convert subCategory array to string for each product
    if (category === "accessories") {
      products = products.map((p) => {
        const obj = p.toObject();
        obj.subCategory = Array.isArray(obj.subCategory) ? obj.subCategory.join(", ") : obj.subCategory;
        return obj;
      });
    }
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// ➕ CREATE product
export const createProduct = async (req, res) => {
  try {
    let { title, price, oldPrice, category, subCategory, gender } = req.body;
    if (!title || !price || !category || !subCategory || !req.file) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Convert comma-separated string to array for accessories
    if (category === "accessories" && typeof subCategory === "string") {
      subCategory = subCategory.split(",").map((s) => s.trim()).filter(Boolean);
    }

    const image = req.file.path; // Cloudinary URL
    const Model = getModelByCategory(category);
    const product = new Model({ title, price, oldPrice, category, subCategory, image, gender });
    await product.save();

    res.status(201).json({ message: "Product added!", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET one product by ID (across all categories)
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const models = [Summer, Royal, Winter, Accessories];
    for (let Model of models) {
      const product = await Model.findById(id);
      if (product) {
        const obj = product.toObject();
        if (obj.category === "accessories" && Array.isArray(obj.subCategory)) {
          obj.subCategory = obj.subCategory.join(", ");
        }
        return res.json(obj);
      }
    }
    res.status(404).json({ error: "Product not found" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ✏️ UPDATE product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let { title, price, oldPrice, category, subCategory, gender } = req.body;

    // Convert comma-separated string to array for accessories
    if (category === "accessories" && typeof subCategory === "string") {
      subCategory = subCategory.split(",").map((s) => s.trim()).filter(Boolean);
    }

    const models = [Summer, Royal, Winter, Accessories];
    let foundProduct = null;
    let Model = null;

    for (let M of models) {
      const p = await M.findById(id);
      if (p) {
        foundProduct = p;
        Model = M;
        break;
      }
    }

    if (!foundProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    // 🖼️ Replace image if a new one is uploaded
    if (req.file) {
      foundProduct.image = req.file.path; // Cloudinary URL
    }

    foundProduct.title = title;
    foundProduct.price = price;
    foundProduct.oldPrice = oldPrice;
    foundProduct.category = category;
    foundProduct.gender = gender;
    // Always replace the subCategory array
    let newSubCategory = subCategory;
    if (typeof newSubCategory === "string") {
      newSubCategory = newSubCategory.split(",").map(s => s.trim()).filter(Boolean);
    }
    foundProduct.subCategory = newSubCategory;

    await foundProduct.save();
    res.json({ message: "Product updated", product: foundProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ❌ DELETE product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const models = [Summer, Royal, Winter, Accessories];

    for (let Model of models) {
      const product = await Model.findById(id);
      if (product) {
        await product.deleteOne();
        return res.json({ message: "Product deleted" });
      }
    }

    res.status(404).json({ error: "Product not found" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
};