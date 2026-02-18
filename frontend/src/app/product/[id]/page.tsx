"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import LXLoader from "@/components/ui/Loader";
import Toast from "@/components/ui/Toast";
import { FiArrowLeft, FiShoppingCart, FiShare2, FiHeart } from "react-icons/fi";

interface Product {
  _id: string;
  title: string;
  price: string;
  oldPrice?: string;
  image: string;
  category: string;
  description?: string;
  gender?: string;
  // Dynamic properties based on category
  summerType?: string;
  summerStyle?: string;
  winterType?: string;
  winterStyle?: string;
  royalType?: string;
  accessoriesType?: string;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;

      setLoading(true);
      try {
        const baseURL =
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          "https://luxoro-store-backend.onrender.com";

        const res = await fetch(`${baseURL}/api/products/${id}`);

        if (!res.ok) {
          throw new Error("Product not found");
        }

        const data = await res.json();
        setProduct(data);
      } catch (err: any) {
        setError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    addToCart(
      {
        id: product._id + product.image, // Maintaining the ID logic from ProductCard
        name: product.title,
        price: parseFloat(product.price),
        image: product.image,
        quantity: 1,
      },
      () => setToastOpen(true),
    );
  };

  const handleBuyNow = () => {
    if (!product) return;

    addToCart({
      id: product._id + product.image,
      name: product.title,
      price: parseFloat(product.price),
      image: product.image,
      quantity: 1,
    });
    router.push("/cart");
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-white">
        <LXLoader size={64} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center bg-white p-4">
        <h1 className="text-2xl font-mono text-gray-800 mb-4">
          {error || "Product not found"}
        </h1>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-black text-white rounded-full font-mono hover:bg-gray-800 transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  // Determine specific attributes to display
  const attributes = [
    { label: "Category", value: product.category },
    { label: "Gender", value: product.gender },
    {
      label: "Type",
      value:
        product.summerType ||
        product.winterType ||
        product.royalType ||
        product.accessoriesType,
    },
    { label: "Style", value: product.summerStyle || product.winterStyle },
  ].filter((attr) => attr.value);

  return (
    <main className="min-h-screen pt-20 pb-10 bg-white">
      <Toast
        open={toastOpen}
        message="Added to cart!"
        onClose={() => setToastOpen(false)}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb / Back */}
        <div className="mb-6 flex items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-500 hover:text-black transition-colors font-mono">
            <FiArrowLeft className="mr-2" /> Back
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Section */}
          <div className="relative aspect-[3/4] w-full bg-gray-50 rounded-xl overflow-hidden shadow-sm">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-contain p-4"
              priority
            />
            <button
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md text-gray-500 hover:text-red-500 transition-colors z-10"
              onClick={() => setIsLiked(!isLiked)}>
              <FiHeart
                className={`w-6 h-6 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
              />
            </button>
          </div>

          {/* Details Section */}
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-bold font-mono text-gray-900 mb-2">
              {product.title}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl font-mono text-black">
                ₹{product.price}
              </span>
              {product.oldPrice && (
                <span className="text-lg font-mono text-gray-400 line-through">
                  ₹{product.oldPrice}
                </span>
              )}
              {product.oldPrice && (
                <span className="text-sm font-mono text-green-600 bg-green-50 px-2 py-1 rounded">
                  {Math.round(
                    ((parseFloat(product.oldPrice) -
                      parseFloat(product.price)) /
                      parseFloat(product.oldPrice)) *
                      100,
                  )}
                  % OFF
                </span>
              )}
            </div>

            <div className="border-t border-b border-gray-100 py-6 mb-6 spacing-y-4">
              <h3 className="text-sm font-bold font-mono text-gray-900 uppercase tracking-wide mb-4">
                Product Details
              </h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                {attributes.map((attr, idx) => (
                  <div key={idx} className="flex flex-col">
                    <dt className="text-xs text-gray-500 font-mono uppercase">
                      {attr.label}
                    </dt>
                    <dd className="text-sm font-medium text-gray-900 font-mono capitalize">
                      {attr.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="flex flex-col gap-4 mt-auto">
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-white border border-gray-300 rounded-lg text-black font-mono hover:bg-gray-50 transition-colors shadow-sm">
                  <FiShoppingCart /> Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 px-8 py-4 bg-black text-white border border-black rounded-lg font-mono hover:bg-gray-800 transition-colors shadow-lg">
                  Buy Now
                </button>
              </div>

              <div className="text-center mt-4">
                <p className="text-xs text-gray-500 font-mono flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> In
                  Stock & Ready to Ship
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
