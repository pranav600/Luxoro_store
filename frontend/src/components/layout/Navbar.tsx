"use client";
import React, { useState } from "react";
import { FiShoppingCart, FiMenu, FiX } from "react-icons/fi";
import { useCart } from "../../context/cart-context";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/auth-context";
import ProfileCard from "../profile/ProfileCard";
import Link from "next/link";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Contact", href: "#" },
];

const categoryLinks = [
  { name: "Royal", href: "/user_category/royal" },
  { name: "Summer", href: "/user_category/summer" },
  { name: "Winter", href: "/user_category/winter" },
  { name: "Accessories", href: "/user_category/accessories" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Set hydration state on client side
  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Optional: Close categories dropdown when clicking outside
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".categories-dropdown")) {
        setCategoriesOpen(false);
      }
    };
    if (categoriesOpen) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [categoriesOpen]);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between z-50 shadow-md">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <Link href="/">
          <span className="text-black font-bold text-2xl font-mono sm:text-3xl tracking-tight cursor-pointer focus:outline-none">
            LUXORO
          </span>
        </Link>
      </div>

      {/* Hamburger for mobile */}
      <button
        className="sm:hidden text-2xl text-black ml-auto mr-2 focus:outline-none"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}>
        {menuOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Links for desktop */}
      <div className="hidden sm:flex items-center space-x-4 md:space-x-8">
        {navLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            className="text-base md:text-lg font-mono tracking-wide transition-colors text-black hover:text-gray-600"
            onClick={() => setCategoriesOpen(false)}>
            {link.name}
          </a>
        ))}
        {/* Categories Dropdown */}
        <div className="relative inline-block categories-dropdown">
          <button
            className="text-base md:text-lg font-mono tracking-wide text-black hover:text-gray-600 flex items-center gap-1 focus:outline-none cursor-pointer"
            tabIndex={0}
            aria-haspopup="true"
            aria-expanded={categoriesOpen}
            onClick={() => setCategoriesOpen((open) => !open)}>
            Categories
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {categoriesOpen && (
            <div className="absolute right-0 top-full mt-6 w-44 bg-white border border-gray-200 rounded-lg shadow-lg transition-opacity duration-200 z-50 min-w-max">
              {categoryLinks.map((cat) => (
                <a
                  key={cat.name}
                  href={cat.href}
                  className="block px-4 py-2 text-black font-mono hover:bg-gray-100 rounded-lg"
                  tabIndex={0}
                  onClick={() => setCategoriesOpen(false)}>
                  {cat.name}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Cart Icon */}
        <div className="relative inline-block">
          <FiShoppingCart
            className="text-2xl mx-2 text-black hover:text-gray-600 transition-colors cursor-pointer"
            onClick={() => router.push("/cart")}
          />
          {isHydrated && totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
              {totalItems}
            </span>
          )}
        </div>

        {/* Avatar Profile Icon */}
        <div className="relative">
          <button
            className="focus:outline-none cursor-pointer"
            onClick={() => setProfileOpen((v) => !v)}
            aria-label="Open profile menu">
            {user && user.image ? (
              <img
                src={user.image}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-300 shadow"
              />
            ) : (
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-600 text-xl font-bold border-2 border-gray-300 shadow">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0v.458a.292.292 0 01-.292.292H4.792a.292.292 0 01-.292-.292v-.458z"
                  />
                </svg>
              </span>
            )}
          </button>
          <ProfileCard
            open={profileOpen}
            onClose={() => setProfileOpen(false)}
          />
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-lg flex flex-col items-center py-6 z-50 sm:hidden animate-fade-in">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="block w-full text-center py-2 text-base font-mono text-black hover:bg-gray-100"
              onClick={() => setMenuOpen(false)}>
              {link.name}
            </a>
          ))}
          {/* Mobile Categories Dropdown */}
          <details className="w-full">
            <summary className="block w-full text-center py-2 text-base font-mono text-black hover:bg-gray-100 cursor-pointer select-none">
              Categories
            </summary>
            <div className="flex flex-col w-full">
              {categoryLinks.map((cat) => (
                <a
                  key={cat.name}
                  href={cat.href}
                  className="block w-full text-center py-2 text-black font-mono hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}>
                  {cat.name}
                </a>
              ))}
            </div>
          </details>

          <div className="relative inline-block">
            <FiShoppingCart
              className="text-2xl my-2 text-black hover:text-gray-600 transition-colors cursor-pointer"
              onClick={() => router.push("/cart")}
            />
            {isHydrated && totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                {totalItems}
              </span>
            )}
          </div>

          {user ? (
            <>
              <a
                href="/profile"
                className="block w-full text-center py-2 text-black font-mono hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}>
                View Profile
              </a>
            </>
          ) : (
            <>
              <a
                href="/login"
                className="block w-full text-center py-2 text-black font-mono underline hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}>
                Login
              </a>
              <a
                href="/signup"
                className="block w-full text-center py-2 text-black font-mono underline hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}>
                Signup
              </a>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
