import mongoose from "mongoose";

const accessoriesSchema = new mongoose.Schema({
  image: {
    type: String, // path to image file, like "/uploads/xyz.png"
    required: true,
  },
  title: { type: String, required: true },
  price: { type: String, required: true },
  oldPrice: { type: String },
  category: { type: String, required: true },
});

export default mongoose.models.Accessories || mongoose.model("Accessories", accessoriesSchema);