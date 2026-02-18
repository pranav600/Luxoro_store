"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/product/ProductCard";
import LXLoader from "@/components/ui/Loader";

interface Product {
  _id: string;
  title: string;
  price: string;
  oldPrice?: string;
  image: string;
  category?: string;
}

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState<string>("");

  useEffect(() => {
    async function fetchSearchResults() {
      if (!query) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const baseURL =
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          "https://luxoro-store-backend.onrender.com";

        const res = await fetch(
          `${baseURL}/api/products/search?q=${encodeURIComponent(query)}`,
        );

        if (!res.ok) {
          throw new Error("Failed to fetch search results");
        }

        const data = await res.json();
        setProducts(data || []);
      } catch (err: any) {
        setError(err.message || "Error fetching search results");
      } finally {
        setLoading(false);
      }
    }

    fetchSearchResults();
  }, [query]);

  const sortedProducts = [...products].sort((a, b) => {
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

  return (
    <div className="max-w-6xl mx-auto p-4 min-h-screen">
      <div className="py-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold font-mono text-black mb-2">
          Search Results
        </h1>
        {query && (
          <p className="text-gray-500 font-mono">
            Showing results for "{query}"
          </p>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Sorting and Count */}
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <p className="text-gray-600 font-mono">
              {products.length} {products.length === 1 ? "Product" : "Products"}{" "}
              found
            </p>
            <select
              className="border rounded px-3 py-2 text-sm font-mono text-gray-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-black"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}>
              <option value="">Sort By</option>
              <option value="priceLowHigh">Price: Low to High</option>
              <option value="priceHighLow">Price: High to Low</option>
              <option value="nameAZ">Name: A-Z</option>
              <option value="nameZA">Name: Z-A</option>
            </select>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LXLoader size={60} />
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500 font-mono">{error}</p>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-lg">
              <p className="text-gray-500 font-mono text-lg">
                No products found for "{query}".
              </p>
              <p className="text-gray-400 font-mono mt-2">
                Try checking your spelling or use different keywords.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="pt-20 bg-white min-h-screen">
      <Suspense
        fallback={
          <div className="flex justify-center pt-20">
            <LXLoader size={50} />
          </div>
        }>
        <SearchResultsContent />
      </Suspense>
    </main>
  );
}
