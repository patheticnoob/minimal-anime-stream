import { useEffect } from "react";

// Theme is always "nothing" - we only manage dark/light mode via localStorage
export function useTheme() {
  const theme = "nothing";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "nothing");
  }, []);

  // No-op setTheme kept for compatibility
  const setTheme = async (_theme: "classic" | "retro" | "nothing") => {
    document.documentElement.setAttribute("data-theme", "nothing");
  };

  return {
    theme,
    setTheme,
  };
}