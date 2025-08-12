"use client";

import React, { useRef, useState, useEffect, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/auth-context";
import { useRouter } from "next/navigation";
import { FiUser, FiLogOut, FiUpload } from "react-icons/fi";



interface ProfileCardProps {
  open: boolean;
  onClose: () => void;
}

export default function ProfileCard({ open, onClose }: ProfileCardProps) {
  const { user, logout, updateProfileImage } = useAuth();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [topOffset, setTopOffset] = useState(80); // fallback offset
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLElement | null>(null);
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagePreview(URL.createObjectURL(file));
      updateProfileImage?.(file);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open, onClose]);

  useLayoutEffect(() => {
    const nav = document.querySelector("nav") as HTMLElement | null;
    if (nav) {
      navbarRef.current = nav;
      const rect = nav.getBoundingClientRect();
      setTopOffset(rect.bottom + 12); // 12px margin below navbar
    }
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="fixed right-4 z-[100]"
          style={{ top: topOffset }}
        >
          {/* Arrow */}
          <div className="absolute -top-1.5 right-6 w-4 h-4 rotate-45 bg-white/30 backdrop-blur-xl border border-white/40 shadow-md z-[-1]" />

          {/* Main Card */}
          <div
            ref={cardRef}
            className="rounded-3xl p-6 w-80 max-w-[90vw] border border-white/40 bg-white/30 backdrop-blur-xl shadow-2xl ring-1 ring-white/10"
          >
            {!user ? (
              <div className="flex flex-col items-center">
                <FiUser className="text-5xl text-black mb-2" />
                <div className="font-bold text-lg text-black mb-2">Welcome!</div>
                <div className="flex gap-3 mt-2">
                  <button
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors cursor-pointer"
                    onClick={() => {
                      onClose();
                      router.push("/login");
                    }}
                  >
                    Login
                  </button>
                  <button
                    className="bg-white border border-black text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => {
                      onClose();
                      router.push("/signup");
                    }}
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="relative mb-2">
                  <img
                    src={imagePreview || user.image || "/default-avatar.png"}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 shadow"
                  />
                  <button
                    className="absolute bottom-1 right-1 bg-white p-1 rounded-full shadow border"
                    onClick={() => fileInputRef.current?.click()}
                    title="Change profile picture"
                  >
                    <FiUpload className="text-black text-lg" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
                <div className="font-bold text-lg text-black">{user.name}</div>
                <div className="text-gray-700 text-sm mb-2">{user.email}</div>
                <button
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors mt-2 flex items-center gap-2 cursor-pointer"
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                >
                  <FiLogOut /> Logout
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
