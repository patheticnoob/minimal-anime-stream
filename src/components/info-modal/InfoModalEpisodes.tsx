import { useState, useMemo, useRef, useEffect } from "react";
import { Play, ArrowUpDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Episode {
  id: string;
  title?: string;
  number?: number;
  currentTime?: number;
  duration?: number;
}

interface InfoModalEpisodesProps {
  episodes: Episode[];
  episodesLoading: boolean;
  onPlayEpisode: (episode: Episode) => void;
  currentEpisodeId?: string;
}

export function InfoModalEpisodes({ 
  episodes, 
  episodesLoading, 
  onPlayEpisode,
  currentEpisodeId 
}: InfoModalEpisodesProps) {
  const [jumpToEpisode, setJumpToEpisode] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [episodeRange, setEpisodeRange] = useState(0);
  const episodeListRef = useRef<HTMLDivElement>(null);

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
        // Wait for render then scroll
        setTimeout(() => scrollToEpisode(episodeNum), 100);
        return;
      }
    }

    scrollToEpisode(episodeNum);
  };

  const scrollToEpisode = (episodeNum: number) => {
    const targetEpisode = displayedEpisodes.find(ep => ep.number === episodeNum);
    if (!targetEpisode) {
      // If we just switched ranges, we might need to re-find in the new displayedEpisodes
      // But displayedEpisodes is a dependency of the effect, so we might need a better way.
      // For now, simple scroll if found.
      const element = document.getElementById(`episode-${episodeNum}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        toast.success(`Scrolled to Episode ${episodeNum}`);
        setJumpToEpisode("");
      } else {
        // Try to find in all episodes to see if it exists
        const exists = episodes.some(ep => ep.number === episodeNum);
        if (exists) {
           // It exists but maybe not in current view (should be handled by range switch above)
           // If we are here, maybe the range switch didn't happen fast enough or logic is slightly off
           // But for now, just show error if not found
        } else {
           toast.error(`Episode ${episodeNum} not found`);
        }
      }
    } else {
       const element = document.getElementById(`episode-${episodeNum}`);
       if (element) {
         element.scrollIntoView({ behavior: "smooth", block: "center" });
         toast.success(`Scrolled to Episode ${episodeNum}`);
         setJumpToEpisode("");
       }
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  };

  return (
    <div className="space-y-4">
       <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-white/40 tracking-[0.2em] text-sm uppercase">Episodes</h3>
          <span className="text-xs font-mono text-white/30">{episodes.length} TOTAL</span>
       </div>
       
       {/* Controls Container */}
       <div className="bg-white/5 rounded-2xl p-3 space-y-3 border border-white/10">
         {/* Jump Row */}
         <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
              <Input 
                type="number"
                placeholder="Jump to episode..." 
                value={jumpToEpisode}
                onChange={(e) => setJumpToEpisode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJumpToEpisode()}
                className="pl-9 bg-black/20 border-white/5 text-white placeholder:text-white/20 rounded-xl h-10 focus-visible:ring-[#ff4d4f]/50 focus-visible:border-[#ff4d4f]/50"
              />
            </div>
            <Button 
              onClick={handleJumpToEpisode}
              className="bg-[#ff4d4f] hover:bg-[#ff4d4f]/90 text-white rounded-xl px-6 font-bold h-10"
            >
              GO
            </Button>
         </div>
         
         {/* Filter Row */}
         <div className="flex gap-2">
            {episodeRanges.length > 0 ? (
              <Select
                value={String(episodeRange)}
                onValueChange={(value) => setEpisodeRange(Number(value))}
              >
                 <SelectTrigger className="flex-1 bg-black/20 border-white/5 text-white/80 rounded-xl h-10">
                   <SelectValue placeholder="Select Range" />
                 </SelectTrigger>
                 <SelectContent className="bg-[#0B0F19] border-white/10 text-white">
                    {episodeRanges.map((range, idx) => (
                      <SelectItem key={range.label} value={String(idx)}>
                        Episodes {range.label}
                      </SelectItem>
                    ))}
                 </SelectContent>
              </Select>
            ) : (
              <div className="flex-1 bg-black/20 border border-white/5 rounded-xl h-10 flex items-center px-3 text-sm text-white/40 cursor-not-allowed">
                All Episodes
              </div>
            )}
            
            <Button 
              onClick={toggleSortOrder}
              variant="outline" 
              className="bg-black/20 border-white/5 text-white/60 hover:text-white hover:bg-white/10 rounded-xl h-10 px-4"
            >
               <ArrowUpDown className="h-4 w-4 mr-2" /> 
               {sortOrder === "asc" ? "Oldest" : "Latest"}
            </Button>
         </div>
       </div>
       
       {/* List */}
       {episodesLoading ? (
         <div className="flex justify-center py-12">
           <div className="w-8 h-8 border-2 border-[#ff4d4f] border-t-transparent rounded-full animate-spin" />
         </div>
       ) : (
         <div ref={episodeListRef} className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {displayedEpisodes.length > 0 ? (
              displayedEpisodes.map((ep) => {
                const progressPercentage = ep.currentTime && ep.duration 
                  ? (ep.currentTime / ep.duration) * 100 
                  : 0;
                const isCurrent = currentEpisodeId === ep.id;

                return (
                  <button
                    key={ep.id}
                    id={`episode-${ep.number}`}
                    onClick={() => onPlayEpisode(ep)}
                    className={`group w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 text-left ${
                      isCurrent 
                        ? "bg-[#ff4d4f]/10 border-[#ff4d4f]/50 shadow-[0_0_15px_rgba(255,77,79,0.1)]" 
                        : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                    }`}
                  >
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-mono text-sm font-bold shrink-0 ${
                      isCurrent ? "bg-[#ff4d4f] text-white" : "bg-white/10 text-white/40 group-hover:text-white group-hover:bg-white/20"
                    }`}>
                      {ep.number ?? "#"}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium truncate ${isCurrent ? "text-[#ff4d4f]" : "text-white group-hover:text-white"}`}>
                        {ep.title || `Episode ${ep.number}`}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-white/40 font-mono">EP {ep.number ?? "?"}</span>
                        {progressPercentage > 0 && (
                          <div className="h-1 w-16 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#ff4d4f]" 
                              style={{ width: `${Math.min(progressPercentage, 100)}%` }} 
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isCurrent ? "bg-[#ff4d4f] text-white" : "bg-white/5 text-white/20 group-hover:bg-white/20 group-hover:text-white"
                    }`}>
                      <Play className="h-3.5 w-3.5 fill-current" />
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-12 text-white/20">
                No episodes found
              </div>
            )}
         </div>
       )}
    </div>
  );
}
