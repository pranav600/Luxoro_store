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
  royalType?: string;
  gender?: string;
}

export default function RoyalPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRoyalType, setSelectedRoyalType] = useState<string | null>(
    null
  );
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("");

  const filterOptions = ["suits", "blazers"];
  const genderOptions = ["male", "female"];

  /** -------------------- Fetch Products -------------------- */
  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products?category=royal`;
      if (selectedRoyalType) url += `&royalType=${selectedRoyalType}`;
      if (selectedGender) url += `&gender=${selectedGender}`;

      const res = await fetch(url);
      if (!res.ok) {
        const errText = await res.text();
        console.error("API Error:", res.status, errText);
        throw new Error("Failed to fetch products");
      }

      const data = await res.json();
      setProducts(data || []);
    } catch (err: any) {
      setError(err.message || "Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedRoyalType, selectedGender]);

  /** -------------------- Filter & Sort -------------------- */
  const filteredProducts = products.filter((p) => {
    let royalTypeMatch = selectedRoyalType
      ? p.royalType
          ?.toLowerCase()
          .split(", ")
          .includes(selectedRoyalType.toLowerCase())
      : true;

    let genderMatch = selectedGender
      ? p.gender?.toLowerCase() === selectedGender.toLowerCase()
      : true;

    return royalTypeMatch && genderMatch;
  });

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

  /** -------------------- UI -------------------- */
  const AboutSection = () => (
    <section className="w-full py-16 px-4 text-center">
      <h2 className="text-black text-5xl md:text-6xl font-black font-mono mb-10">
        Royal <span className="text-black">Section</span>
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
        <aside className="w-52 hidden md:block border-r pr-4">
          {/* Royal Type */}
          <h3 className="font-semibold mb-4 text-gray-700 font-mono">
            Categories
          </h3>
          <ul className="space-y-2">
            {filterOptions.map((option) => (
              <li key={option}>
                <label className="flex items-center cursor-pointer text-gray-700 font-mono">
                  <input
                    type="radio"
                    aria-label={`Filter by ${option}`}
                    name="category"
                    className="accent-black mr-2"
                    checked={selectedRoyalType === option}
                    onChange={() => setSelectedRoyalType(option)}
                  />
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </label>
              </li>
            ))}
            <li>
              <button
                className={`mt-2 text-xs underline font-mono cursor-pointer ${
                  selectedRoyalType
                    ? "text-gray-700"
                    : "text-gray-400 cursor-not-allowed"
                }`}
                onClick={() => setSelectedRoyalType(null)}
                disabled={!selectedRoyalType}
              >
                Clear Category
              </button>
            </li>
          </ul>

          {/* Gender */}
          <h3 className="font-semibold mt-8 mb-4 text-gray-700 font-mono">
            Gender
          </h3>
          <ul className="space-y-2">
            {genderOptions.map((option) => (
              <li key={option}>
                <label className="flex items-center cursor-pointer text-gray-700 font-mono">
                  <input
                    type="radio"
                    aria-label={`Filter by ${option}`}
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
                className={`mt-2 text-xs underline font-mono cursor-pointer ${
                  selectedGender
                    ? "text-gray-700"
                    : "text-gray-400 cursor-not-allowed"
                }`}
                onClick={() => setSelectedGender(null)}
                disabled={!selectedGender}
              >
                Clear Gender
              </button>
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <section className="flex-1">
          {/* Sort dropdown */}
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

          {/* Products */}
          {loading ? (
            <p className="text-gray-500">Loading products...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : sortedProducts.length === 0 ? (
            <p className="text-gray-700">No royal products found.</p>
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
