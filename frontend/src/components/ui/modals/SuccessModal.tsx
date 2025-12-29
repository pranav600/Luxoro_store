"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SuccessProps {
  open: boolean;
  message?: string;
  onClose: () => void;
}

const Success: React.FC<SuccessProps> = ({
  open,
  message = "Action completed successfully!",
  onClose,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl p-8 w-90 relative flex flex-col items-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="mb-4">
              <img
                src="/assets/tick_mark.gif"
                alt="Success Animation"
                className="w-20 h-20 object-contain"
              />
            </div>
            <div className="text-xl text-green-700 font-mono font-semibold mb-2 text-center">
              {message}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Success;
