import { useTheme } from "@/hooks/use-theme";
import { lazy, Suspense } from "react";
import { FullscreenLoader } from "@/components/FullscreenLoader";

const ClassicLanding = lazy(() => import("@/themes/classic/pages/Landing"));
const RetroLanding = lazy(() => import("@/themes/retro/pages/Landing"));

const ClassicAuth = lazy(() => import("@/themes/classic/pages/Auth"));
const RetroAuth = lazy(() => import("@/themes/retro/pages/Auth"));

const ClassicWatchHistory = lazy(() => import("@/themes/classic/pages/WatchHistory"));
const RetroWatchHistory = lazy(() => import("@/themes/retro/pages/WatchHistory"));

export function ThemedLanding() {
  const { theme } = useTheme();
  
  return (
    <Suspense fallback={<FullscreenLoader label="Loading..." />}>
      {theme === "retro" ? <RetroLanding /> : <ClassicLanding />}
    </Suspense>
  );
}

export function ThemedAuth(props: { redirectAfterAuth: string }) {
  const { theme } = useTheme();
  
  return (
    <Suspense fallback={<FullscreenLoader label="Loading..." />}>
      {theme === "retro" ? <RetroAuth {...props} /> : <ClassicAuth {...props} />}
    </Suspense>
  );
}

export function ThemedWatchHistory() {
  const { theme } = useTheme();
  
  return (
    <Suspense fallback={<FullscreenLoader label="Loading..." />}>
      {theme === "retro" ? <RetroWatchHistory /> : <ClassicWatchHistory />}
    </Suspense>
  );
}