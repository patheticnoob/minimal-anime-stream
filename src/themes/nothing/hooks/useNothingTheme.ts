import { useState, useEffect } from "react";

export function useNothingTheme() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("nothing-dark-mode");
    // Default to dark mode if no preference saved
    return saved === null ? true : saved === "true";
  });

  useEffect(() => {
    const root = document.documentElement;
    // Always keep data-theme="nothing"
    root.setAttribute("data-theme", "nothing");
    if (isDarkMode) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
    localStorage.setItem("nothing-dark-mode", String(isDarkMode));
  }, [isDarkMode]);

  // Sync with other tabs/windows
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "nothing-dark-mode") {
        setIsDarkMode(e.newValue === "true");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return { isDarkMode, toggleTheme };
}