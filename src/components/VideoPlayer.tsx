import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
 // Dynamically load hls.js from CDN if not present/installed
const loadHls = async (): Promise<any> => {
  if (typeof window !== "undefined" && (window as any).Hls) {
    return (window as any).Hls;
  }
  const id = "hlsjs-cdn-script";
  if (typeof document !== "undefined") {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) {
      if ((window as any).Hls) return (window as any).Hls;
      await new Promise<void>((resolve, reject) => {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () => reject(new Error("Failed to load HLS script")));
      });
      return (window as any).Hls;
    }
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.id = id;
      s.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.14/dist/hls.min.js";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load HLS script"));
      document.head.appendChild(s);
    });
  }
  return (window as any).Hls;
};

type VideoPlayerProps = {
  source: string;
  title: string;
  tracks?: Array<{ file: string; label: string; kind?: string }>;
  onClose: () => void;
};

export function VideoPlayer({ source, title, tracks, onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  // Fix TS error: avoid using Hls as a type (value-only). Use `any` for the ref.
  const hlsRef = useRef<any | null>(null);
  const isHls = /\.m3u8($|\?)/i.test(source);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setLoading(true);
    setError(false);

    const handleLoadedData = () => {
      setLoading(false);
      setError(false);
    };

    const handleError = () => {
      setLoading(false);
      setError(true);
      toast.error("Failed to load video. The source may be unavailable.");
    };

    const handleCanPlay = () => {
      setLoading(false);
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    if (isHls) {
      (async () => {
        try {
          const Hls: any = await loadHls();
          if (Hls && Hls.isSupported()) {
            const hls = new Hls({
              maxBufferLength: 60,
              xhrSetup: (xhr: any, url: string) => {
                xhr.withCredentials = false;
                xhr.setRequestHeader('Referer', 'https://megacloud.blog/');
                console.log("XHR setup for URL:", url);
              },
            });
            hlsRef.current = hls;
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              console.log("HLS manifest parsed successfully");
              setLoading(false);
              video.play().catch((err) => {
                console.error("Video play error:", err);
              });
            });
            hls.on(Hls.Events.ERROR, (_evt: any, data: any) => {
              console.error("HLS error:", data);
              if (data?.fatal) {
                try {
                  if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                    return;
                  }
                  if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                    return;
                  }
                } catch { /* noop */ }
                setError(true);
                setLoading(false);
                toast.error("Stream error. Please try another episode or server.");
                hls.destroy();
                hlsRef.current = null;
              }
            });
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            // Safari native HLS
            video.src = source;
            video.onloadedmetadata = () => setLoading(false);
            video.play().catch(() => {});
          } else {
            setError(true);
            setLoading(false);
            toast.error("Your browser doesn't support HLS.");
          }
        } catch {
          setError(true);
          setLoading(false);
          toast.error("Failed to load HLS library.");
        }
      })();
    } else {
      // MP4 or other directly playable source
      video.src = source;
    }

    return () => {
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [source, isHls]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative w-full h-full flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <h2 className="text-white font-semibold text-lg truncate">{title}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Video */}
        <div className="flex-1 flex items-center justify-center">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-white" />
            </div>
          )}
          {error ? (
            <div className="text-white text-center">
              <p className="text-xl mb-4">Unable to load video</p>
              <div className="flex items-center justify-center gap-2">
                <Button onClick={onClose} variant="outline">
                  Go Back
                </Button>
                {/* Fallback: open the source directly in a new tab if the player is blocked */}
                <Button
                  variant="secondary"
                  onClick={() => {
                    try {
                      window.open(source, "_blank", "noopener,noreferrer");
                    } catch {
                      toast.error("Could not open the video source.");
                    }
                  }}
                >
                  Open Source
                </Button>
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              // Do not set src for HLS when using hls.js; it will be attached programmatically
              src={isHls ? undefined : source}
              controls
              autoPlay
              muted
              playsInline
              preload="metadata"
              className="w-full h-full"
              controlsList="nodownload"
              crossOrigin="anonymous"
              onError={(e) => {
                console.error("Video error:", e);
                setError(true);
                setLoading(false);
              }}
            >
              {tracks && tracks.length > 0 && tracks.map((track, idx) => (
                <track
                  key={idx}
                  src={track.file}
                  kind={track.kind || "subtitles"}
                  label={track.label || `Subtitle ${idx + 1}`}
                  srcLang={track.label?.toLowerCase().replace(/[^a-z]/g, "") || "en"}
                  default={idx === 0}
                />
              ))}
            </video>
          )}
        </div>
      </div>
    </div>
  );
}