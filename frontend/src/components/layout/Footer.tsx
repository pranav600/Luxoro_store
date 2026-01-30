/**
 * Footer Component
 * Displays site-wide footer with links, social media icons, and contact information
 */
import React from "react";
import { FaFacebookF, FaGithub, FaInstagram } from "react-icons/fa";

export default function Footer() {
  // Main footer component
  return (
    <footer className="w-full bg-white border-t border-gray-200 pt-8 pb-4 px-2 sm:px-4 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
        {/* Logo */}
        <div className="font-black text-2xl sm:text-3xl tracking-tight mb-4 md:mb-0 text-center md:text-left">
          LUXORO
        </div>
        {/* Links */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-8 justify-center text-base sm:text-lg font-mono text-black items-center">
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="hover:underline">
            Terms & Conditions
          </a>
          <a href="#" className="hover:underline">
            Shipping
          </a>
          <a href="#" className="hover:underline">
            Returns
          </a>
        </div>
        {/* Social Icons */}
        <div className="flex gap-4 sm:gap-6 text-xl sm:text-2xl text-black justify-center">
          <a href="#" aria-label="Facebook" className="hover:text-gray-600">
            <FaFacebookF />
          </a>
          <a href="#" aria-label="Github" className="hover:text-gray-600">
            <FaGithub />
          </a>
          <a href="#" aria-label="Instagram" className="hover:text-gray-600">
            <FaInstagram />
          </a>
        </div>
      </div>
      {/* Basic Info */}
      <div className="max-w-7xl mx-auto mt-6 text-center text-xs sm:text-sm text-gray-500 font-mono px-2">
        Gondal road, India, GJ 360004 &nbsp;|&nbsp; Email: support@luxoro.in
        &nbsp;|&nbsp; Phone: (91) 6351949342
      </div>
    </footer>
  );
}
