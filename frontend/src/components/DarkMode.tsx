"use client";
import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const THEME_KEY = "theme";

export default function DarkMode() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // Check localStorage or OS preference
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
      setDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (dark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem(THEME_KEY, "light");
      setDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem(THEME_KEY, "dark");
      setDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="ml-3 p-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-black dark:text-yellow-400 focus:outline-none"
      title={dark ? "Light mode" : "Dark mode"}
    >
      {dark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
