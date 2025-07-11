import mongoose from "mongoose";

const royalSchema = new mongoose.Schema({
  image: {
    type: String, // path to image file, like "/assets/xyz.png"
    required: true,
  },
  title: { type: String, required: true },
  price: { type: String, required: true },
  oldPrice: { type: String },
  category: { type: String, required: true },
});

export default mongoose.models.Royal || mongoose.model("Royal", royalSchema);