"use client";

import React, { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import Delete from "@/components/popups/Delete";
import Success from "@/components/popups/Success";

interface Product {
  _id: string;
  title: string;
  price: string;
  oldPrice?: string;
  image: string;
  category?: string;
}

export default function RoyalPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products?category=royal`
        );
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data || []);
      } catch (err: any) {
        setError(err.message || "Error fetching products");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/${deleteId}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Failed to delete product");
      setProducts((prev) => prev.filter((p) => p._id !== deleteId));
      setDeleteId(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err: any) {
      alert(err.message || "Error deleting product");
    }
  };

  const handleEdit = (id: string) => {
    window.location.href = `/admin/admin_category/addproduct?page=edit&id=${id}`;
  };

  const AboutSection = () => (
    <section className="w-full py-16 px-4 text-center">
      <h2 className="text-black text-5xl md:text-6xl font-black font-mono mb-10">
        Royal <span className="text-black">Section</span>
      </h2>
    </section>
  );

  return (
    <main className="min-h-screen pt-16">
      <div className="max-w-5xl mx-auto p-4">
        <AboutSection />
      </div>
      <div className="max-w-5xl mx-auto p-4">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : products.length === 0 ? (
          <p className="text-gray-400">No royal products found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="space-y-2">
                <ProductCard
                  image={product.image}
                  title={product.title}
                  price={product.price}
                  oldPrice={product.oldPrice}
                />
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => handleEdit(product._id)}
                    className="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(product._id)}
                    className="px-4 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Delete
        open={!!deleteId}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
      <Success
        open={showSuccess}
        message="Product deleted successfully!"
        onClose={() => setShowSuccess(false)}
      />
    </main>
  );
}
