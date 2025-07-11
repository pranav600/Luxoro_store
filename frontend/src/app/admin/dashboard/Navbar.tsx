"use client";
import React from "react";
import Link from "next/link";

const navLinks = [
  { name: "Add Product", href: "/admin/admin_category/addproduct" },
  { name: "Home", href: "/admin/dashboard" },
  { name: "Royal", href: "/admin/admin_category/royal" },
  { name: "Summer", href: "/admin/admin_category/summer" },
  { name: "Winter", href: "/admin/admin_category/winter" },
  { name: "Accessories", href: "/admin/admin_category/accessories" },
];


export default function Navbar() {

  return (
    <nav className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between z-50 shadow-md">
      <div className="flex items-center space-x-2">
        <span className="text-black font-bold text-3xl tracking-tight">
          LUXORO
        </span>
        <span className="ml-4 text-xl text-black tracking-wide">
          Admin Dashboard
        </span>
      </div>
      <div className="flex items-center space-x-8">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="text-lg font-mono tracking-wide text-black hover:text-gray-600 transition-colors"
          >
            {link.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
