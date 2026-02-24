import { Film, ArrowUpDown } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface AnimeProgress {
  episodeId: string;
  currentTime: number;
  duration: number;
}

interface NothingEpisodeListProps {
  episodes: any[];
  episodesLoading: boolean;
  currentEpisodeId?: string;
  onPlayEpisode: (ep: any) => void;
  animeProgress?: AnimeProgress | null;
}

export function NothingEpisodeList({
  episodes,
  episodesLoading,
  currentEpisodeId,
  onPlayEpisode,
  animeProgress,
}: NothingEpisodeListProps) {
  const [jumpToEpisode, setJumpToEpisode] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [episodeRange, setEpisodeRange] = useState(0);

  // Calculate episode ranges (100 episodes per range)
  const episodeRanges = useMemo(() => {
    if (episodes.length <= 100) return [];

    const ranges: Array<{ label: string; start: number; end: number }> = [];
    for (let i = 0; i < episodes.length; i += 100) {
      const start = i + 1;
      const end = Math.min(i + 100, episodes.length);
      ranges.push({
        label: `${start}-${end}`,
        start: i,
        end: Math.min(i + 100, episodes.length),
      });
    }
    return ranges;
  }, [episodes.length]);

  // Filter and sort episodes
  const displayedEpisodes = useMemo(() => {
    let filtered = episodes;

    if (episodeRanges.length > 0) {
      const currentIndex = episodeRange >= episodeRanges.length ? 0 : episodeRange;
      const range = episodeRanges[currentIndex];
      if (range) {
        filtered = episodes.slice(range.start, range.end);
      }
    }

    return [...filtered].sort((a, b) => {
      const aNum = a.number ?? 0;
      const bNum = b.number ?? 0;
      return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
    });
  }, [episodes, episodeRange, episodeRanges, sortOrder]);

  const handleJumpToEpisode = () => {
    const episodeNum = parseInt(jumpToEpisode);
    if (isNaN(episodeNum) || episodeNum < 1) {
      toast.error("Please enter a valid episode number");
      return;
    }

    if (episodeRanges.length > 0) {
      const rangeIndex = episodeRanges.findIndex(
        (r) => episodeNum >= r.start + 1 && episodeNum <= r.end
      );
      if (rangeIndex !== -1) {
        setEpisodeRange(rangeIndex);
        setTimeout(() => scrollToEpisode(episodeNum), 100);
        return;
      }
    }

    scrollToEpisode(episodeNum);
  };

  const scrollToEpisode = (episodeNum: number) => {
    const element = document.getElementById(`episode-${episodeNum}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      toast.success(`Scrolled to Episode ${episodeNum}`);
      setJumpToEpisode("");
    } else {
      const exists = episodes.some((ep) => ep.number === episodeNum);
      if (!exists) {
        toast.error(`Episode ${episodeNum} not found`);
      }
    }
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="bg-[#1A1D24] border border-white/10 rounded-[24px] overflow-hidden shadow-sm p-5">
      {/* Header */}
      <div className="sticky top-0 bg-[#1A1D24] z-10 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/40">Episodes</h3>
          <span className="text-xs font-mono text-white/30">{episodes.length} TOTAL</span>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2">
          {/* Jump to Episode Row */}
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Jump to episode..."
              value={jumpToEpisode}
              onChange={(e) => setJumpToEpisode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJumpToEpisode()}
              className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-full h-11 px-5 focus-visible:ring-[#ff4d4f]/50 focus-visible:border-[#ff4d4f]/50 text-sm"
              min="1"
            />
            <Button
              onClick={handleJumpToEpisode}
              className="bg-[#ff4d4f] hover:bg-[#ff4d4f]/90 text-white rounded-full px-6 font-bold h-11 shrink-0"
            >
              GO
            </Button>
          </div>

          {/* Range + Sort Row */}
          <div className="flex gap-2">
            {episodeRanges.length > 0 ? (
              <Select
                value={String(episodeRange)}
                onValueChange={(value) => setEpisodeRange(Number(value))}
              >
                <SelectTrigger className="flex-1 bg-white/5 border-white/10 text-white/60 rounded-full h-11 px-5 uppercase tracking-widest text-xs">
                  <SelectValue placeholder="Select Range" />
                </SelectTrigger>
                <SelectContent className="bg-[#0B0F19] border-white/10 text-white">
                  {episodeRanges.map((range, idx) => (
                    <SelectItem key={range.label} value={String(idx)}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex-1 bg-white/5 border border-white/10 rounded-full h-11 flex items-center px-5 text-xs text-white/40 uppercase tracking-widest">
                Select Range
              </div>
            )}

            <Button
              onClick={toggleSortOrder}
              variant="outline"
              className="bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10 rounded-full h-11 px-5 shrink-0 uppercase tracking-widest text-xs gap-2"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              {sortOrder === "asc" ? "Oldest" : "Latest"}
            </Button>
          </div>
        </div>
      </div>

      {episodesLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#ff4d4f]/20 border-t-[#ff4d4f] rounded-full animate-spin" />
            <p className="text-sm text-white/40 tracking-wider uppercase">Loading episodes...</p>
          </div>
        </div>
      ) : displayedEpisodes.length > 0 ? (
        <div className="flex flex-col gap-2">
          {displayedEpisodes.map((episode: any) => {
            const epNum = episode.episodeNumber ?? episode.number ?? episode.episode_no;
            const epTitle = episode.title ?? episode.name ?? `Episode ${epNum}`;
            const epId = episode.id ?? episode.episodeId;
            const isActive = epId === currentEpisodeId;
            const isFiller = episode.isFiller === true;

            // Progress for this episode
            const hasProgress =
              animeProgress?.episodeId === epId &&
              (animeProgress?.duration ?? 0) > 0;
            const progressPct = hasProgress
              ? Math.min(100, ((animeProgress?.currentTime ?? 0) / (animeProgress?.duration ?? 1)) * 100)
              : 0;

            return (
              <button
                key={epId ?? epNum}
                id={`episode-${epNum}`}
                onClick={() => onPlayEpisode(episode)}
                className={`w-full text-left rounded-2xl transition-all duration-200 flex items-center gap-4 px-4 group relative overflow-hidden h-[68px] ${
                  isActive
                    ? "bg-[#ff4d4f] shadow-lg shadow-[#ff4d4f]/20"
                    : "bg-white/5 hover:bg-white/10"
                }`}
              >
                {/* Progress bar background */}
                {hasProgress && !isActive && (
                  <div
                    className="absolute inset-0 bg-[#ff4d4f]/10 rounded-2xl pointer-events-none"
                    style={{ width: `${progressPct}%` }}
                  />
                )}

                {/* Episode Number Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  {epNum}
                </div>

                {/* Episode Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-bold uppercase tracking-wide truncate ${
                      isActive ? "text-white" : "text-white/90"
                    }`}
                  >
                    {epTitle}
                  </p>
                  <p
                    className={`text-xs mt-0.5 ${
                      isActive ? "text-white/70" : "text-white/40"
                    }`}
                  >
                    EP {epNum}
                    {hasProgress && !isActive && (
                      <span className="ml-2 text-[#ff4d4f]">
                        {Math.round(progressPct)}%
                      </span>
                    )}
                  </p>
                </div>

                {/* Filler badge */}
                {isFiller && (
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-yellow-500/15 text-yellow-400"
                    }`}
                  >
                    FILLER
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-white/20">
          <div className="w-12 h-12 rounded-full border border-dashed border-white/10 flex items-center justify-center mb-4">
            <Film className="h-6 w-6" />
          </div>
          <p className="text-sm tracking-widest uppercase">No episodes found</p>
        </div>
      )}
    </div>
  );
}