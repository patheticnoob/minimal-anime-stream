import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export function useTheme() {
  const currentTheme = useQuery(api.themes.getUserTheme);
  const setThemeMutation = useMutation(api.themes.setUserTheme);

  // Default to "nothing" theme if no theme is set
  const theme = currentTheme || "nothing";

  useEffect(() => {
    if (theme) {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  const setTheme = async (theme: "classic" | "retro" | "nothing") => {
    document.documentElement.setAttribute("data-theme", theme);
    await setThemeMutation({ theme });
  };

  return {
    theme,
    setTheme,
  };
}