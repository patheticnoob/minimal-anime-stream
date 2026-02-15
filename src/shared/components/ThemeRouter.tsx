import { useTheme } from "@/hooks/use-theme";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import ClassicLanding from "@/themes/classic/pages/Landing";
import RetroLanding from "@/themes/retro/pages/Landing";
import NothingLanding from "@/themes/nothing/pages/Landing";
import ClassicAuth from "@/themes/classic/pages/Auth";
import RetroAuth from "@/themes/retro/pages/Auth";
import NothingAuth from "@/themes/nothing/pages/Auth";
import ClassicWatchHistory from "@/themes/classic/pages/WatchHistory";
import RetroWatchHistory from "@/themes/retro/pages/WatchHistory";
import NothingWatchHistory from "@/themes/nothing/pages/WatchHistory";
import NothingWatch from "@/themes/nothing/pages/Watch";

export function ThemedLanding() {
  const { theme } = useTheme();
  
  return theme === "retro" ? (
    <RetroLanding />
  ) : theme === "nothing" ? (
    <NothingLanding />
  ) : (
    <ClassicLanding />
  );
}

export function ThemedAuth(props: { redirectAfterAuth: string }) {
  const { theme } = useTheme();
  
  return theme === "retro" ? (
    <RetroAuth {...props} />
  ) : theme === "nothing" ? (
    <NothingAuth {...props} />
  ) : (
    <ClassicAuth {...props} />
  );
}

export function ThemedWatchHistory() {
  const { theme } = useTheme();
  
  return theme === "retro" ? (
    <RetroWatchHistory />
  ) : theme === "nothing" ? (
    <NothingWatchHistory />
  ) : (
    <ClassicWatchHistory />
  );
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