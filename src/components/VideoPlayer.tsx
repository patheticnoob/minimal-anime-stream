import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setLoading(false);
      setError(false);
    };

    const handleError = () => {
      setLoading(false);
      setError(true);
      toast.error("Failed to load video. The source may be unavailable.");
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("error", handleError);
    };
  }, [source]);

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
              <Button onClick={onClose} variant="outline">
                Go Back
              </Button>
            </div>
          ) : (
            <video
              ref={videoRef}
              src={source}
              controls
              autoPlay
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
                  srcLang={track.label?.toLowerCase().replace(/[^a-z]/g, '') || "en"}
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