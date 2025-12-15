import { useState, useEffect } from "react";
import { Download, Check, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EpisodeDownloadManager, type DownloadedEpisode } from "@/lib/episode-download-manager";
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
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setIsDownloaded(EpisodeDownloadManager.isDownloaded(episodeId));
  }, [episodeId]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isDownloaded) {
      // Delete download
      const success = EpisodeDownloadManager.deleteDownload(episodeId);
      if (success) {
        setIsDownloaded(false);
        toast.success("Download removed");
      } else {
        toast.error("Failed to remove download");
      }
      return;
    }

    // Start download
    setIsDownloading(true);
    toast.loading("Preparing download...");

    try {
      const { videoUrl, tracks } = await onDownload();

      // Open video URL and copy to clipboard
      const filename = `${title.replace(/[^a-z0-9]/gi, '_')}_Episode_${episodeNumber}.m3u8`;
      const clipboardSuccess = await EpisodeDownloadManager.openForDownload(videoUrl, filename);

      // Save metadata to localStorage
      const episode: DownloadedEpisode = {
        episodeId,
        animeId,
        episodeNumber,
        title,
        videoUrl,
        tracks,
        downloadedAt: Date.now(),
      };

      const success = await EpisodeDownloadManager.saveDownload(episode);

      if (success) {
        setIsDownloaded(true);
        if (clipboardSuccess) {
          toast.success("Video URL copied to clipboard! Use a download manager like IDM or JDownloader to download the HLS stream.");
        } else {
          toast.success("Video URL opened in new tab. Episode metadata cached.");
        }
      } else {
        toast.error("Storage quota exceeded. Please delete some downloads.");
      }
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to prepare download");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDownload}
      disabled={isDownloading}
      className={`h-8 w-8 p-0 ${
        isDownloaded
          ? "text-green-500 hover:text-red-500"
          : "text-gray-400 hover:text-white"
      }`}
      title={isDownloaded ? "Remove cached episode" : "Download episode"}
    >
      {isDownloading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isDownloaded ? (
        <Check className="h-4 w-4" />
      ) : (
        <Download className="h-4 w-4" />
      )}
    </Button>
  );
}