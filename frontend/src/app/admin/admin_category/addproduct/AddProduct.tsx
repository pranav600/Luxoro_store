import React, { useState, useEffect, useRef } from "react";
import Navbar from "../../dashboard/Navbar";
import { useRouter, useSearchParams } from "next/navigation";
import Success from "@/components/popups/Success"; // ✅ Import Success popup

export default function AddProduct() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const isEdit = searchParams.get("page") === "edit";
  const editId = searchParams.get("id");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState({
    title: "",
    price: "",
    oldPrice: "",
    image: null as File | null,
    category: "",
    existingImage: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isEdit && editId) {
      const fetchProduct = async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/${editId}`
          );
          const data = await res.json();
          setForm({
            title: data.title,
            price: data.price,
            oldPrice: data.oldPrice || "",
            category: data.category,
            image: null,
            existingImage: `${process.env.NEXT_PUBLIC_API_BASE_URL}${data.image}`,
          });
        } catch (err) {
          setErrorMsg("❌ Failed to load product for editing.");
        }
      };
      fetchProduct();
    }
  }, [isEdit, editId]);

  useEffect(() => {
    if (!isEdit) {
      setForm({
        title: "",
        price: "",
        oldPrice: "",
        image: null,
        category: "",
        existingImage: "",
      });
    }
  }, [isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, category: e.target.value }));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, image: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("price", form.price);
    if (form.oldPrice) formData.append("oldPrice", form.oldPrice);
    if (form.image) formData.append("image", form.image);
    formData.append("category", form.category);

    try {
      const res = await fetch(
        isEdit
          ? `http://localhost:8000/api/products/${editId}`
          : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products`,
        {
          method: isEdit ? "PUT" : "POST",
          body: formData,
        }
      );

      if (res.ok) {
        setSuccessMsg(`Product ${isEdit ? "updated" : "added"} successfully!`);

        if (isEdit) {
          setTimeout(() => {
            router.push(`/admin/admin_category/${form.category}`);
          }, 2000);
        } else {
          setForm({
            title: "",
            price: "",
            oldPrice: "",
            image: null,
            category: "",
            existingImage: "",
          });
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }

        // Auto-close success popup
        setTimeout(() => setSuccessMsg(""), 2500);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "❌ Failed to save product.");
      }
    } catch (error) {
      setErrorMsg("❌ Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <Navbar />
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-black font-mono tracking-tight">
          {isEdit ? "Update Product" : "Add New Product"}
        </h2>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Product Title
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-gray-50"
          />
        </div>

        {/* Price */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Price
          </label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-gray-50"
          />
        </div>

        {/* Old Price */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Old Price (optional)
          </label>
          <input
            type="number"
            name="oldPrice"
            value={form.oldPrice}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-gray-50"
          />
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Category
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleCategoryChange}
            required
            disabled={isEdit}
            className={`w-full px-4 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-gray-50 ${
              isEdit ? "bg-gray-200 cursor-not-allowed" : ""
            }`}
          >
            <option value="">Select Category</option>
            <option value="royal">Royal</option>
            <option value="winter">Winter</option>
            <option value="summer">Summer</option>
            <option value="accessories">Accessories</option>
          </select>
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Product Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            ref={fileInputRef}
            className="w-full px-4 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-gray-50"
          />
          {form.existingImage && !form.image && (
            <div className="mt-4 flex items-center justify-center">
              <img
                src={form.existingImage}
                alt="Current Product"
                className="max-h-60 object-contain border rounded"
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-900 transition-colors"
        >
          {loading
            ? isEdit
              ? "Updating..."
              : "Adding..."
            : isEdit
            ? "Update Product"
            : "Add Product"}
        </button>

        {/* Error Message */}
        {errorMsg && (
          <p className="text-red-600 text-center mt-2">{errorMsg}</p>
        )}
      </form>

      {/* ✅ Success Popup */}
      {successMsg && (
        <Success
          open={true}
          message={successMsg}
          onClose={() => setSuccessMsg("")}
        />
      )}
    </div>
  );
}
