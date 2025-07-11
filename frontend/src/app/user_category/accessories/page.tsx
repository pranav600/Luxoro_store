"use client";
import React, { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";

interface Product {
  _id: string;
  title: string;
  price: string;
  oldPrice?: string;
  image: string;
  category?: string;
}

export default function AccessoriesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          "http://localhost:8000/api/products?category=accessories"
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
          <p className="text-gray-400">No accessories found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                image={product.image}
                title={product.title}
                price={product.price}
                oldPrice={product.oldPrice}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export function AboutSection() {
  return (
    <section className="w-full py-16 px-4 text-center">
      <h2 className=" text-black text-5xl md:text-6xl font-black font-mono mb-10">
        Accessories <span className="text-black">Section</span>
      </h2>
    </section>
  );
}

