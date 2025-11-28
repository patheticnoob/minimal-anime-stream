import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export function useTheme() {
  const currentTheme = useQuery(api.themes.getUserTheme);
  const setThemeMutation = useMutation(api.themes.setUserTheme);

  useEffect(() => {
    if (currentTheme) {
      document.documentElement.setAttribute("data-theme", currentTheme);
    }
  }, [currentTheme]);

  const setTheme = async (theme: string) => {
    document.documentElement.setAttribute("data-theme", theme);
    await setThemeMutation({ theme });
  };

  return {
    theme: currentTheme || "classic",
    setTheme,
  };
}
