import { Loader2, AlertCircle } from "lucide-react";

interface SubtitleStatusProps {
  loading: boolean;
  error: string | null;
}

export function SubtitleStatus({ loading, error }: SubtitleStatusProps) {
  if (!loading && !error) return null;

  return (
    <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg text-sm">
      {loading && (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
          <span className="text-white">Loading subtitles...</span>
        </>
      )}
      {error && !loading && (
        <>
          <AlertCircle className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400">{error}</span>
        </>
      )}
    </div>
  );
}
