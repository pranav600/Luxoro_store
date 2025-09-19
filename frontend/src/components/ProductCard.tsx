"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useCart } from "../context/cart-context";
import { useRouter } from "next/navigation";
import LXLoader from "./LXLoader";

interface ProductCardProps {
  image: string;
  title: string;
  price: string;
  oldPrice?: string;
}
// Cart toast
import Toast from "./Toast";

const ProductCard: React.FC<ProductCardProps> = ({
  image,
  title,
  price,
  oldPrice,
}) => {
  const { addToCart, cart } = useCart();
  const router = useRouter();
  const id = title + image; // fallback unique id, ideally use product id
  const [toastOpen, setToastOpen] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  // Check if product is already in cart
  const isInCart = cart.some(item => item.id === id);

  const handleAddToCart = () => {
    addToCart({
      id,
      name: title,
      price: parseFloat(price),
      image,
      quantity: 1,
    }, () => setToastOpen(true));
  };

  const handleGoToCart = () => {
    router.push("/cart");
  };

  const handleBuyNow = () => {
    addToCart({
      id,
      name: title,
      price: parseFloat(price),
      image,
      quantity: 1,
    });
    router.push("/cart");
  };
  return (
    <>
      <Toast open={toastOpen} message="Added to cart!" onClose={() => setToastOpen(false)} />
      <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col items-center w-full bg-white shadow transition-colors duration-300 p-2 sm:p-4 rounded-lg"
    >
      <div className="relative w-full aspect-[3/4] mb-4 sm:mb-6 rounded-lg overflow-hidden">
        {/* Image loader with brand LX */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <LXLoader size={64} />
          </div>
        )}
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className={`object-contain transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          priority={true}
          onLoadingComplete={() => setImageLoaded(true)}
        />
      </div>

      <div className="w-full text-center px-1 sm:px-2 pb-4 sm:pb-6">
        {imageLoaded ? (
          <>
            <div
              className="text-base sm:text-lg md:text-xl text-gray-500 font-normal mb-1 sm:mb-2 leading-tight"
              style={{ fontFamily: "Menlo, monospace" }}
            >
              {title}
            </div>
            <div className="flex justify-center items-baseline gap-1 sm:gap-2">
              <span
                className="text-sm sm:text-base md:text-lg text-gray-500 font-normal"
                style={{ fontFamily: "Menlo, monospace" }}
              >
                ₹{price}
              </span>
              {oldPrice && (
                <span
                  className="text-xs sm:text-sm md:text-base line-through text-gray-500"
                  style={{ fontFamily: "Menlo, monospace" }}
                >
                  ₹{oldPrice}
                </span>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="h-6 sm:h-7 md:h-8 bg-gray-300 rounded mb-2 sm:mb-3 w-3/4 mx-auto animate-pulse" />
            <div className="flex justify-center items-baseline gap-1 sm:gap-2">
              <div className="h-5 sm:h-6 md:h-7 bg-gray-300 rounded w-16 sm:w-20 animate-pulse" />
              <div className="h-4 sm:h-5 md:h-6 bg-gray-300 rounded w-12 sm:w-16 animate-pulse" />
            </div>
          </>
        )}
        <div className="flex flex-col items-center gap-3 mt-4 w-full">
          {/* Add to Cart / Go to Cart Button */}
          <button
            type="button"
            className={`w-full px-6 py-3 rounded-lg font-mono transition-all duration-200 cursor-pointer active:scale-95 ${
              isInCart
                ? "text-white bg-gray-500 border border-gray-500 hover:bg-gray-600 shadow-sm"
                : "text-gray-800 border border-gray-300 bg-white shadow-sm hover:bg-gray-100"
            }`}
            onClick={isInCart ? handleGoToCart : handleAddToCart}
          >
            {isInCart ? "Go to Cart" : "Add to Cart"}
          </button>

          {/* Buy Now Button */}
          <button
            type="button"
            className="w-full px-6 py-3 rounded-lg font-mono text-white bg-gray-800 border border-gray-800 hover:bg-black active:scale-95 transition-all duration-200 shadow-sm cursor-pointer"
            onClick={handleBuyNow}
          >
            Buy Now
          </button>
        </div>
      </div>
    </motion.div>
    </>
  );
};

export default ProductCard;
