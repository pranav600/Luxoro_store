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
import Image from "next/image"; // ✅ Import next/image
import { motion } from "framer-motion";

interface ProductCardProps {
  image: string;
  title: string;
  price: string;
  oldPrice?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  image,
  title,
  price,
  oldPrice,
}) => {
  return (
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
      </div>
    </motion.div>
  );
};

export default ProductCard;