// import React from "react";

// interface ProductCardProps {
//   image: string;
//   title: string;
//   price: string;
//   oldPrice?: string;
// }

// const ProductCard: React.FC<ProductCardProps> = ({ image, title, price, oldPrice }) => {
//   return (
//     <div className="flex flex-col items-center w-full bg-white shadow transition-colors duration-300 p-2 sm:p-4">
//       <img
//         src={`http://localhost:8000${image}`}
//         alt={title}
//         className="w-full aspect-[3/4] object-contain mt-4 mb-4 sm:mt-6 sm:mb-6 rounded-lg"
//       />
//       <div className="w-full text-center px-1 sm:px-2 pb-4 sm:pb-6">
//         <div
//           className="text-base sm:text-lg md:text-xl text-gray-500 font-normal mb-1 sm:mb-2 leading-tight transition-colors duration-300"
//           style={{ fontFamily: "Menlo, monospace" }}
//         >
//           {title}
//         </div>
//         <div className="flex justify-center items-baseline gap-1 sm:gap-2">
//           <span
//             className="text-sm sm:text-base md:text-lg text-gray-500 font-normal transition-colors duration-300"
//             style={{ fontFamily: "Menlo, monospace" }}
//           >
//             ₹{price}
//           </span>
//           {oldPrice && (
//             <span
//               className="text-xs sm:text-sm md:text-base line-through text-gray-500 transition-colors duration-300"
//               style={{ fontFamily: "Menlo, monospace" }}
//             >
//               ₹{oldPrice}
//             </span>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductCard;

"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useCart } from "../context/cart-context";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  image: string;
  title: string;
  price: string;
  oldPrice?: string;
}

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
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-contain"
          priority={true}
        />
      </div>

      <div className="w-full text-center px-1 sm:px-2 pb-4 sm:pb-6">
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
