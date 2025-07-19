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
  accessoriesType?: string; // Add this line for API response compatibility
  gender?: string; // Add gender for filtering
}

export default function AccessoriesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAccessoriesType, setSelectedAccessoriesType] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("");

  // Available filter options (should match backend)
  const filterOptions = ["perfumes", "boxers", "socks", "belts"];
  const genderOptions = ["male", "female"];

  // Filter by accessoriesType (case-insensitive) and gender
  const filteredProducts = products.filter((p) => {
    let accessoriesTypeMatch = true;
    let genderMatch = true;
    if (selectedAccessoriesType) {
      if (!p.accessoriesType) return false;
      accessoriesTypeMatch = p.accessoriesType.toLowerCase().split(", ").includes(selectedAccessoriesType.toLowerCase());
    }
    if (selectedGender) {
      genderMatch = !!(p.gender && p.gender.toLowerCase() === selectedGender.toLowerCase());
    }
    return accessoriesTypeMatch && genderMatch;
  });

  // Handle sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "priceLowHigh":
        return parseFloat(a.price) - parseFloat(b.price);
      case "priceHighLow":
        return parseFloat(b.price) - parseFloat(a.price);
      case "nameAZ":
        return a.title.localeCompare(b.title);
      case "nameZA":
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError("");
      try {
        let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products?category=accessories`;
        if (selectedGender) {
          url += `&gender=${selectedGender}`;
        }
        const res = await fetch(url);
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
  }, [selectedGender, selectedAccessoriesType]);

  const AboutSection = () => (
    <section className="w-full py-16 px-4 text-center">
      <h2 className="text-black text-5xl md:text-6xl font-black font-mono mb-10">
        Accessories <span className="text-black">Section</span>
      </h2>
    </section>
  );

  return (
    <main className="min-h-screen pt-16 bg-white">
      <div className="max-w-6xl mx-auto p-4">
        <AboutSection />
      </div>
      <div className="max-w-6xl mx-auto flex gap-6 p-4">
        {/* Sidebar filter */}
        <aside className="w-48 hidden md:block border-r pr-4">
          <h3 className="font-semibold mb-4 text-gray-700 font-mono">
            Categories
          </h3>
          <ul className="space-y-2">
            {filterOptions.map((option) => (
              <li key={option}>
                <label className="flex items-center cursor-pointer text-gray-700 font-mono">
                  <input
                    type="radio"
                    name="category"
                    className="accent-black mr-2"
                    checked={selectedAccessoriesType === option}
                    onChange={() => setSelectedAccessoriesType(option)}
                  />
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </label>
              </li>
            ))}
            <li>
              <button
                className="mt-2 text-xs text-gray-500 underline font-mono cursor-pointer"
                onClick={() => setSelectedAccessoriesType(null)}
                disabled={!selectedAccessoriesType}
              >
                Clear Filter
              </button>
            </li>
          </ul>
          <h3 className="font-semibold mt-8 mb-4 text-gray-700 font-mono">
            Gender
          </h3>
          <ul className="space-y-2">
            {genderOptions.map((option) => (
              <li key={option}>
                <label className="flex items-center cursor-pointer text-gray-700 font-mono">
                  <input
                    type="radio"
                    name="gender"
                    className="accent-black mr-2"
                    checked={selectedGender === option}
                    onChange={() => setSelectedGender(option)}
                  />
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </label>
              </li>
            ))}
            <li>
              <button
                className="mt-2 text-xs text-gray-500 underline font-mono cursor-pointer"
                onClick={() => setSelectedGender(null)}
                disabled={!selectedGender}
              >
                Clear Gender
              </button>
            </li>
          </ul>
        </aside>
        {/* Main content */}
        <section className="flex-1">
          <div className="flex justify-end mb-4">
            <select
              className="border rounded px-2 py-1 text-sm font-mono text-gray-700 cursor-pointer"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="">Sort By</option>
              <option value="priceLowHigh">Price: Low to High</option>
              <option value="priceHighLow">Price: High to Low</option>
              <option value="nameAZ">Name: A-Z</option>
              <option value="nameZA">Name: Z-A</option>
            </select>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : sortedProducts.length === 0 ? (
            <p className="text-gray-700">No accessories found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
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
        </section>
      </div>
    </main>
  );
}
