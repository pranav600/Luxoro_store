"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiX } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import { useDebounce } from "use-debounce";

interface Product {
  _id: string;
  title: string;
  image: string;
  price: string;
  category: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedQuery] = useDebounce(query, 300);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/search?q=${debouncedQuery}`,
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setShowSuggestions(false);
  };

  return (
    <div
      className="relative w-full max-w-xs md:max-w-md mx-auto"
      ref={searchRef}>
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(e);
            }
          }}
          placeholder="Search..."
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-black focus:border-black font-mono text-sm transition-shadow shadow-sm"
        />
        <FiSearch
          className="absolute left-3 text-gray-500 w-4 h-4 cursor-pointer"
          onClick={(e) => handleSearch(e)}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none">
            <FiX className="w-4 h-4" />
          </button>
        )}
      </div>

      {showSuggestions && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500 font-mono text-sm">
              Loading...
            </div>
          ) : results.length > 0 ? (
            <ul>
              {results.slice(0, 5).map((product) => (
                <li
                  key={product._id}
                  className="border-b border-gray-100 last:border-none">
                  <Link
                    href={`/product/${product._id}`}
                    className="flex items-center p-3 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowSuggestions(false)}>
                    <div className="relative w-10 h-10 flex-shrink-0 mr-3 border border-gray-200 rounded overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate font-mono">
                        {product.title}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        ₹{product.price}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
              <li className="p-2 text-center bg-gray-50 border-t border-gray-100">
                <button
                  onClick={(e) => handleSearch(e)}
                  className="text-xs text-black hover:underline font-mono uppercase tracking-wide">
                  View all results
                </button>
              </li>
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500 font-mono text-xs">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
