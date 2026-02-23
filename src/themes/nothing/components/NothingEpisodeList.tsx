import { Film, ArrowUpDown, Search } from "lucide-react";
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

interface NothingEpisodeListProps {
  episodes: any[];
  episodesLoading: boolean;
  currentEpisodeId?: string;
  onPlayEpisode: (ep: any) => void;
}

export function NothingEpisodeList({
  episodes,
  episodesLoading,
  currentEpisodeId,
  onPlayEpisode
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

    // Find which range this episode is in
    if (episodeRanges.length > 0) {
      const rangeIndex = episodeRanges.findIndex(r => episodeNum >= (r.start + 1) && episodeNum <= r.end);
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
      const exists = episodes.some(ep => ep.number === episodeNum);
      if (!exists) {
        toast.error(`Episode ${episodeNum} not found`);
      }
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  };

  return (
    <div className="bg-white dark:bg-[#1A1D24] border border-black/5 dark:border-white/10 rounded-[24px] overflow-hidden shadow-sm transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-[#1A1D24] z-10 pb-4 transition-colors duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/40">Episodes</h3>
          <span className="text-xs font-mono text-black/30 dark:text-white/30">{episodes.length} TOTAL</span>
        </div>

        {/* Compact Controls - Single Row Layout */}
        <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-3 border border-black/5 dark:border-white/10">
          <div className="flex flex-col gap-2">
            {/* Jump to Episode Row */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/20 dark:text-white/20 pointer-events-none" />
                <Input
                  type="number"
                  placeholder="Jump to episode..."
                  value={jumpToEpisode}
                  onChange={(e) => setJumpToEpisode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleJumpToEpisode()}
                  className="pl-9 bg-black/10 dark:bg-black/20 border-black/10 dark:border-white/5 text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/20 rounded-xl h-10 focus-visible:ring-[#ff4d4f]/50 focus-visible:border-[#ff4d4f]/50"
                  min="1"
                />
              </div>
              <Button
                onClick={handleJumpToEpisode}
                className="bg-[#ff4d4f] hover:bg-[#ff4d4f]/90 text-white rounded-xl px-6 font-bold h-10 shrink-0"
              >
                GO
              </Button>
            </div>

            {/* Filter Row - Range and Sort Side by Side */}
            <div className="flex gap-2">
              {episodeRanges.length > 0 ? (
                <Select
                  value={String(episodeRange)}
                  onValueChange={(value) => setEpisodeRange(Number(value))}
                >
                  <SelectTrigger className="flex-1 bg-black/10 dark:bg-black/20 border-black/10 dark:border-white/5 text-black/80 dark:text-white/80 rounded-xl h-10">
                    <SelectValue placeholder="Select Range" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#0B0F19] border-black/10 dark:border-white/10 text-black dark:text-white">
                    {episodeRanges.map((range, idx) => (
                      <SelectItem key={range.label} value={String(idx)}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex-1 bg-black/10 dark:bg-black/20 border border-black/10 dark:border-white/5 rounded-xl h-10 flex items-center px-3 text-sm text-black/40 dark:text-white/40">
                  All Episodes
                </div>
              )}

              <Button
                onClick={toggleSortOrder}
                variant="outline"
                className="bg-black/10 dark:bg-black/20 border-black/10 dark:border-white/5 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/20 dark:hover:bg-white/10 rounded-xl h-10 px-4 shrink-0 min-w-[120px]"
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                {sortOrder === "asc" ? "Oldest" : "Latest"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {episodesLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#ff4d4f]/20 border-t-[#ff4d4f] rounded-full animate-spin" />
            <p className="text-sm text-black/40 dark:text-white/40 tracking-wider uppercase">Loading episodes...</p>
          </div>
        </div>
      ) : displayedEpisodes.length > 0 ? (
        <div className="p-4">
          <div className="grid grid-cols-1 gap-1.5 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-black/10 dark:scrollbar-thumb-white/10">
            {displayedEpisodes.map((episode: any) => {
              const epNum = episode.episodeNumber ?? episode.number ?? episode.episode_no;
              const epTitle = episode.title ?? episode.name ?? `Episode ${epNum}`;
              const epId = episode.id ?? episode.episodeId;
              const isActive = epId === currentEpisodeId;
              const isFiller = episode.isFiller === true;

              return (
                <button
                  key={epId ?? epNum}
                  id={`episode-${epNum}`}
                  onClick={() => onPlayEpisode(episode)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 group ${
                    isActive
                      ? "bg-[#ff4d4f] text-white shadow-md"
                      : "hover:bg-black/5 dark:hover:bg-white/5 text-black/80 dark:text-white/80"
                  }`}
                >
                  <span className={`text-xs font-bold w-8 shrink-0 ${isActive ? "text-white/80" : "text-black/40 dark:text-white/30"}`}>
                    {epNum}
                  </span>
                  <span className="flex-1 text-sm font-medium truncate">{epTitle}</span>
                  {isFiller && (
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"
                    }`}>
                      FILLER
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-black/20 dark:text-white/20">
          <div className="w-12 h-12 rounded-full border border-dashed border-black/10 dark:border-white/10 flex items-center justify-center mb-4">
            <Film className="h-6 w-6" />
          </div>
          <p className="text-sm tracking-widest uppercase">No episodes found</p>
        </div>
      )}
    </div>
  );
}