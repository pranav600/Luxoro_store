"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Success from "./SuccessModal";

interface DeleteProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const Delete: React.FC<DeleteProps> = ({ open, onConfirm, onCancel }) => {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDelete = () => {
    onConfirm(); // actual deletion logic from parent
    setShowSuccess(true); // show success popup
    setTimeout(() => {
      setShowSuccess(false);
      onCancel(); // close modal after success
    }, 2000); // 2 seconds
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}>
            <motion.div
              className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full relative flex flex-col items-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}>
              <div className="mb-4">
                <img
                  src="/assets/trash-can.gif"
                  alt="Trash Can Animation"
                  className="w-20 h-20 object-contain"
                />
              </div>
              <div className="text-xl text-black font-mono font-semibold mb-2 text-center">
                Do you really want to delete this product?
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  className="px-5 font-mono py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700"
                  onClick={handleDelete}>
                  Yes
                </button>
                <button
                  className="px-5 font-mono py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
                  onClick={onCancel}>
                  No
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showSuccess && (
        <Success
          open={showSuccess}
          message="Product deleted successfully!"
          onClose={() => setShowSuccess(false)}
        />
      )}
    </>
  );
};

export default Delete;
