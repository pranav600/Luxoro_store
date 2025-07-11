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
//     const { title, price, oldPrice, category } = req.body;
//     if (!title || !price || !category || !req.file) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }
//     const image = `/assets/${req.file.filename}`;
//     const Model = getModelByCategory(category);
//     const product = new Model({ title, price, oldPrice, category, image });
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
import path from "path";
import fs from "fs";

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
    const products = await Model.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// ➕ CREATE product
export const createProduct = async (req, res) => {
  try {
    const { title, price, oldPrice, category } = req.body;
    if (!title || !price || !category || !req.file) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const image = `/assets/${req.file.filename}`;
    const Model = getModelByCategory(category);
    const product = new Model({ title, price, oldPrice, category, image });
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
      if (product) return res.json(product);
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
    const { title, price, oldPrice, category } = req.body;

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

    // delete old image if new uploaded
    if (req.file && foundProduct.image) {
      const imagePath = path.join("public", foundProduct.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      foundProduct.image = `/assets/${req.file.filename}`;
    }

    foundProduct.title = title;
    foundProduct.price = price;
    foundProduct.oldPrice = oldPrice;
    foundProduct.category = category;

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
        if (product.image) {
          const imagePath = path.join("public", product.image);
          if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }
        await product.deleteOne();
        return res.json({ message: "Product deleted" });
      }
    }

    res.status(404).json({ error: "Product not found" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
};
