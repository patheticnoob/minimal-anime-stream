import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { ThemedLanding, ThemedAuth, ThemedWatchHistory, ThemedWatch } from "./shared/components/ThemeRouter";
import NotFound from "./pages/NotFound";
import "./index.css";
import { Toaster } from "sonner";
import { registerDownloadServiceWorker } from "./download/service-worker-manager";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

// Register download service worker
registerDownloadServiceWorker().then((success) => {
  if (success) {
    console.log("✅ Download Service Worker registered successfully");
  } else {
    console.warn("⚠️ Download Service Worker registration failed");
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexAuthProvider client={convex}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ThemedLanding />} />
          <Route path="/auth" element={<ThemedAuth redirectAfterAuth="/" />} />
          <Route path="/watch/:animeId" element={<ThemedWatch />} />
          <Route path="/history" element={<ThemedWatchHistory />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </ConvexAuthProvider>
  </StrictMode>
);