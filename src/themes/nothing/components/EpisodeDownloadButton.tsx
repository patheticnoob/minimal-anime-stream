import { useState, useEffect } from "react";
import { Download, Check, Loader2, X, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadOrchestrator } from "@/download/download-orchestrator";
import type { DownloadMetadata } from "@/download/types";
import { toast } from "sonner";

interface EpisodeDownloadButtonProps {
  episodeId: string;
  animeId: string;
  episodeNumber: number;
  title: string;
  onDownload: () => Promise<{
    videoUrl: string;
    tracks: Array<{ file: string; label: string; kind?: string }>;
  }>;
}

export function EpisodeDownloadButton({
  episodeId,
  animeId,
  episodeNumber,
  title,
  onDownload,
}: EpisodeDownloadButtonProps) {
  const [downloadStatus, setDownloadStatus] = useState<DownloadMetadata | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Load initial status
    downloadOrchestrator.getDownloadStatus(episodeId).then(setDownloadStatus);

    // Subscribe to progress updates
    const unsubscribe = downloadOrchestrator.onProgress(episodeId, (progressEvent) => {
      setProgress(progressEvent.progress);
    });

    // Poll for status updates
    const interval = setInterval(async () => {
      const status = await downloadOrchestrator.getDownloadStatus(episodeId);
      setDownloadStatus(status);
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [episodeId]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (downloadStatus?.status === 'completed') {
      // Delete download
      await downloadOrchestrator.deleteDownload(episodeId);
      setDownloadStatus(null);
      setProgress(0);
      toast.success("Download removed");
      return;
    }

    if (downloadStatus?.status === 'downloading') {
      // Cancel download
      await downloadOrchestrator.cancelDownload(episodeId);
      toast.info("Download cancelled");
      return;
    }

    // Start download
    toast.loading("Preparing download...");

    try {
      const { videoUrl } = await onDownload();

      await downloadOrchestrator.startDownload(
        episodeId,
        animeId,
        episodeNumber,
        title,
        videoUrl
      );

      toast.success("Download started in background");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to start download");
    }
  };

  const getButtonContent = () => {
    if (!downloadStatus) {
      return <Download className="h-4 w-4" />;
    }

    switch (downloadStatus.status) {
      case 'downloading':
      case 'pending':
        return (
          <div className="relative flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="absolute text-[8px] font-bold">
              {Math.round(progress)}
            </span>
          </div>
        );
      case 'completed':
        return <Check className="h-4 w-4" />;
      case 'failed':
        return <X className="h-4 w-4" />;
      case 'cancelled':
        return <Pause className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  const getButtonColor = () => {
    if (!downloadStatus) return "text-gray-400 hover:text-white";
    
    switch (downloadStatus.status) {
      case 'completed':
        return "text-green-500 hover:text-red-500";
      case 'downloading':
      case 'pending':
        return "text-blue-500 hover:text-red-500";
      case 'failed':
        return "text-red-500 hover:text-white";
      case 'cancelled':
        return "text-yellow-500 hover:text-white";
      default:
        return "text-gray-400 hover:text-white";
    }
  };

  const getTitle = () => {
    if (!downloadStatus) return "Download episode";
    
    switch (downloadStatus.status) {
      case 'completed':
        return "Remove cached episode";
      case 'downloading':
      case 'pending':
        return `Downloading... ${Math.round(progress)}%`;
      case 'failed':
        return "Download failed - Click to retry";
      case 'cancelled':
        return "Download cancelled - Click to retry";
      default:
        return "Download episode";
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDownload}
      className={`h-8 w-8 p-0 ${getButtonColor()}`}
      title={getTitle()}
    >
      {getButtonContent()}
    </Button>
  );
}