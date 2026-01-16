import { Play, Film, ArrowUpDown } from "lucide-react";
import { useState, useRef } from "react";
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
  const episodeListRef = useRef<HTMLDivElement>(null);

  const sortedEpisodes = [...episodes].sort((a, b) => {
    const aNum = a.number ?? 0;
    const bNum = b.number ?? 0;
    return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
  });

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  };

  const handleJumpToEpisode = () => {
    const episodeNum = parseInt(jumpToEpisode);
    if (isNaN(episodeNum) || episodeNum < 1) {
      toast.error("Please enter a valid episode number");
      return;
    }

    const targetEpisode = sortedEpisodes.find(ep => ep.number === episodeNum);
    if (!targetEpisode) {
      toast.error(`Episode ${episodeNum} not found`);
      return;
    }

    const targetIndex = sortedEpisodes.findIndex(ep => ep.number === episodeNum);
    if (targetIndex !== -1 && episodeListRef.current) {
      const episodeElement = episodeListRef.current.querySelector(`[data-episode-index="${targetIndex}"]`);
      if (episodeElement) {
        episodeElement.scrollIntoView({ behavior: "smooth", block: "center" });
        toast.success(`Scrolled to Episode ${episodeNum}`);
        setJumpToEpisode("");
      }
    }
  };

  const handleRangeClick = (startEpisode: number) => {
    const targetEpisode = sortedEpisodes.find(ep => ep.number === startEpisode);
    if (!targetEpisode) {
      const closestEpisode = sortedEpisodes.find(ep => (ep.number ?? 0) >= startEpisode);
      if (closestEpisode) {
        const targetIndex = sortedEpisodes.findIndex(ep => ep.id === closestEpisode.id);
        if (targetIndex !== -1 && episodeListRef.current) {
          const episodeElement = episodeListRef.current.querySelector(`[data-episode-index="${targetIndex}"]`);
          if (episodeElement) {
            episodeElement.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      }
      return;
    }

    const targetIndex = sortedEpisodes.findIndex(ep => ep.number === startEpisode);
    if (targetIndex !== -1 && episodeListRef.current) {
      const episodeElement = episodeListRef.current.querySelector(`[data-episode-index="${targetIndex}"]`);
      if (episodeElement) {
        episodeElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const getEpisodeRanges = () => {
    const totalEpisodes = episodes.length;
    if (totalEpisodes <= 100) return [];

    const ranges = [];
    for (let i = 1; i <= totalEpisodes; i += 100) {
      const end = Math.min(i + 99, totalEpisodes);
      ranges.push({ start: i, end, label: `${i}-${end}` });
    }
    return ranges;
  };

  const episodeRanges = getEpisodeRanges();

  return (
    <div id="episode-list-container" className="bg-white dark:bg-[#1A1D24] border border-black/5 dark:border-white/10 rounded-[24px] p-6 h-fit max-h-[calc(100vh-120px)] flex flex-col shadow-sm transition-colors duration-300">
      <div className="sticky top-0 bg-white dark:bg-[#1A1D24] z-10 pb-4 transition-colors duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/40">Episodes</h3>
          <span className="text-xs font-mono text-black/30 dark:text-white/30">{episodes.length} TOTAL</span>
        </div>

        {/* Jump to Episode */}
        <div className="flex gap-2 mb-3">
          <Input
            type="number"
            placeholder="Jump to episode..."
            value={jumpToEpisode}
            onChange={(e) => setJumpToEpisode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleJumpToEpisode();
              }
            }}
            className="flex-1 bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 rounded-xl"
            min="1"
          />
          <Button
            onClick={handleJumpToEpisode}
            size="sm"
            className="px-4 bg-[#ff4d4f] hover:bg-[#ff4d4f]/90 text-white rounded-xl"
          >
            Go
          </Button>
        </div>

        {/* Range Dropdown and Sort Button */}
        <div className="flex gap-2 mb-3">
          {episodeRanges.length > 0 && (
            <Select onValueChange={(value) => handleRangeClick(parseInt(value))}>
              <SelectTrigger size="sm" className="flex-1 bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-black dark:text-white rounded-xl">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                {episodeRanges.map((range) => (
                  <SelectItem key={range.start} value={range.start.toString()}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            onClick={toggleSortOrder}
            size="sm"
            variant="outline"
            className={`bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 hover:border-[#ff4d4f] text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white rounded-xl ${episodeRanges.length === 0 ? 'ml-auto' : ''}`}
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            {sortOrder === "asc" ? "Oldest" : "Latest"}
          </Button>
        </div>
      </div>
      
      {episodesLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#ff4d4f]/20 border-t-[#ff4d4f] rounded-full animate-spin" />
            <p className="text-sm text-black/40 dark:text-white/40 tracking-wider uppercase">Loading episodes...</p>
          </div>
        </div>
      ) : sortedEpisodes.length > 0 ? (
        <div ref={episodeListRef} className="space-y-3 overflow-y-auto flex-1">
          {sortedEpisodes.map((ep, idx) => {
            const progressPercentage =
              ep.currentTime && ep.duration ? (ep.currentTime / ep.duration) * 100 : 0;
            const isCurrentEpisode = currentEpisodeId === ep.id;

            return (
              <button
                key={ep.id}
                data-episode-index={idx}
                onClick={() => onPlayEpisode(ep)}
                className={`group relative w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                  isCurrentEpisode
                    ? "bg-[#ff4d4f]/5 dark:bg-[#ff4d4f]/10 border-[#ff4d4f] shadow-[0_0_20px_rgba(255,77,79,0.1)]"
                    : "bg-black/5 dark:bg-white/5 border-transparent hover:bg-black/10 dark:hover:bg-white/10 hover:border-black/10 dark:hover:border-white/10"
                }`}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-mono text-sm font-bold ${
                    isCurrentEpisode ? "bg-[#ff4d4f] text-white" : "bg-white dark:bg-[#2A2F3A] text-black/40 dark:text-white/40 group-hover:text-black dark:group-hover:text-white shadow-sm"
                  }`}>
                    {ep.number ?? "#"}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isCurrentEpisode ? "text-[#ff4d4f]" : "text-[#050814] dark:text-white group-hover:text-black dark:group-hover:text-white"}`}>
                      {ep.title || `Episode ${ep.number ?? "?"}`}
                    </p>
                    <p className="text-xs text-black/40 dark:text-white/40 font-mono mt-0.5">
                      EP {ep.number ?? "?"}
                    </p>
                  </div>

                  {isCurrentEpisode ? (
                    <div className="w-2 h-2 rounded-full bg-[#ff4d4f] animate-pulse" />
                  ) : (
                    <Play className="h-4 w-4 text-black/0 dark:text-white/0 group-hover:text-black/40 dark:group-hover:text-white/40 transition-all transform translate-x-2 group-hover:translate-x-0" />
                  )}
                </div>

                {progressPercentage > 0 && (
                  <div className="absolute inset-x-5 bottom-3 pointer-events-none">
                    <div className="h-1 rounded-full bg-[#ff4d4f]/15 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#ff4d4f] transition-all"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
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
