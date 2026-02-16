import { useTheme } from "@/hooks/use-theme";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import ClassicLanding from "@/themes/classic/pages/Landing";
import NothingLanding from "@/themes/nothing/pages/Landing";
import ClassicAuth from "@/themes/classic/pages/Auth";
import NothingAuth from "@/themes/nothing/pages/Auth";
import ClassicWatchHistory from "@/themes/classic/pages/WatchHistory";
import NothingWatchHistory from "@/themes/nothing/pages/WatchHistory";
import NothingWatch from "@/themes/nothing/pages/Watch";

export function ThemedLanding() {
  const { theme } = useTheme();
  
  // Always render a theme - default to "nothing"
  return theme === "classic" ? <ClassicLanding /> : <NothingLanding />;
}

export function ThemedAuth(props: { redirectAfterAuth: string }) {
  const { theme } = useTheme();
  
  // Always render a theme - default to "nothing"
  return theme === "classic" ? <ClassicAuth {...props} /> : <NothingAuth {...props} />;
}

export function ThemedWatchHistory() {
  const { theme } = useTheme();
  
  // Always render a theme - default to "nothing"
  return theme === "classic" ? <ClassicWatchHistory /> : <NothingWatchHistory />;
}

export function ThemedWatch() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect non-NothingOS themes back to landing
    if (theme !== "nothing") {
      navigate("/", { replace: true });
    }
  }, [theme, navigate]);
  
  return theme === "nothing" ? <NothingWatch /> : null;
}