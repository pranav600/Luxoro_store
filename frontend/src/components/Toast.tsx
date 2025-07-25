"use client";
import React from "react";

interface ToastProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ open, message, onClose }) => {
  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(onClose, 1800);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-6 py-3 rounded-lg shadow-lg font-mono text-sm animate-fade-in">
      {message}
    </div>
  );
};

export default Toast;
