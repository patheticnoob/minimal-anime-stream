import { useTheme } from "@/hooks/use-theme";
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
import ClassicWatch from "@/themes/classic/pages/Watch";

export function ThemedLanding() {
  const { theme } = useTheme();
  
  // Always render a theme - default to "nothing"
  return theme === "retro" ? (
    <RetroLanding />
  ) : theme === "classic" ? (
    <ClassicLanding />
  ) : (
    <NothingLanding />
  );
}

export function ThemedAuth(props: { redirectAfterAuth: string }) {
  const { theme } = useTheme();
  
  // Always render a theme - default to "nothing"
  return theme === "retro" ? (
    <RetroAuth {...props} />
  ) : theme === "classic" ? (
    <ClassicAuth {...props} />
  ) : (
    <NothingAuth {...props} />
  );
}

export function ThemedWatchHistory() {
  const { theme } = useTheme();
  
  // Always render a theme - default to "nothing"
  return theme === "retro" ? (
    <RetroWatchHistory />
  ) : theme === "classic" ? (
    <ClassicWatchHistory />
  ) : (
    <NothingWatchHistory />
  );
}

export function ThemedWatch() {
  const { theme } = useTheme();
  
  // Route to theme-specific watch pages
  return theme === "classic" ? (
    <ClassicWatch />
  ) : theme === "nothing" ? (
    <NothingWatch />
  ) : null;
}