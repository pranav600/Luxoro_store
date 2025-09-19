"use client";

import React from "react";

const LXLoader: React.FC<{ size?: number }>
= ({ size = 72 }) => {
  const px = `${size}px`;
  const ring = `${Math.max(2, Math.floor(size / 18))}px`;
  return (
    <div className="flex items-center justify-center" style={{ width: px, height: px }}>
      <div
        className="relative flex items-center justify-center rounded-full"
        style={{ width: px, height: px }}
      >
        {/* Outer ring */}
        <div
          className="absolute inset-0 rounded-full border-transparent border-t-gray-300 animate-spin"
          style={{ borderWidth: ring }}
          aria-hidden
        />
        {/* Inner background */}
        <div className="absolute inset-[14%] rounded-full bg-white shadow-sm" aria-hidden />
        {/* Brand letters */}
        <div
          className="relative z-10 font-black select-none"
          style={{
            fontFamily: "Menlo, monospace",
            fontSize: `calc(${px} * 0.42)`,
            letterSpacing: "0.02em",
          }}
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-br from-gray-700 via-black to-gray-700 [text-shadow:0_1px_0_rgba(0,0,0,0.05)]">
            LX
          </span>
        </div>
        {/* Pulse halo */}
        <div className="absolute inset-0 rounded-full bg-gray-200/40 animate-ping" aria-hidden />
      </div>
    </div>
  );
};

export default LXLoader;
