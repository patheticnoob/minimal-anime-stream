import { useTheme } from "@/hooks/use-theme";
import { lazy, Suspense } from "react";
import { FullscreenLoader } from "@/components/FullscreenLoader";

const ClassicLanding = lazy(() => import("@/themes/classic/pages/Landing"));
const RetroLanding = lazy(() => import("@/themes/retro/pages/Landing"));
const NothingLanding = lazy(() => import("@/themes/nothing/pages/Landing"));

const ClassicAuth = lazy(() => import("@/themes/classic/pages/Auth"));
const RetroAuth = lazy(() => import("@/themes/retro/pages/Auth"));
const NothingAuth = lazy(() => import("@/themes/nothing/pages/Auth"));

const ClassicWatchHistory = lazy(() => import("@/themes/classic/pages/WatchHistory"));
const RetroWatchHistory = lazy(() => import("@/themes/retro/pages/WatchHistory"));
const NothingWatchHistory = lazy(() => import("@/themes/nothing/pages/WatchHistory"));

export function ThemedLanding() {
  const { theme } = useTheme();
  
  return (
    <Suspense fallback={<FullscreenLoader label="Loading..." />}>
      {theme === "retro" ? (
        <RetroLanding />
      ) : theme === "nothing" ? (
        <NothingLanding />
      ) : (
        <ClassicLanding />
      )}
    </Suspense>
  );
}

export function ThemedAuth(props: { redirectAfterAuth: string }) {
  const { theme } = useTheme();
  
  return (
    <Suspense fallback={<FullscreenLoader label="Loading..." />}>
      {theme === "retro" ? (
        <RetroAuth {...props} />
      ) : theme === "nothing" ? (
        <NothingAuth {...props} />
      ) : (
        <ClassicAuth {...props} />
      )}
    </Suspense>
  );
}

export function ThemedWatchHistory() {
  const { theme } = useTheme();
  
  return (
    <Suspense fallback={<FullscreenLoader label="Loading..." />}>
      {theme === "retro" ? (
        <RetroWatchHistory />
      ) : theme === "nothing" ? (
        <NothingWatchHistory />
      ) : (
        <ClassicWatchHistory />
      )}
    </Suspense>
  );
}