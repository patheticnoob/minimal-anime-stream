import { useState, useMemo, useEffect } from "react";
import { X, Play, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Episode = {
  id: string;
  title?: string;
  number?: number;
  // Progress tracking
  currentTime?: number;
  duration?: number;
};

type AnimeDetail = {
  title?: string;
  image?: string;
  type?: string;
  dataId?: string;
  language?: {
    sub?: string | null;
    dub?: string | null;
  };
};

interface InfoModalProps {
  anime: AnimeDetail | null;
  isOpen: boolean;
  onClose: () => void;
  episodes: Episode[];
  episodesLoading: boolean;
  onPlayEpisode: (episode: Episode) => void;
  isInWatchlist?: boolean;
  onToggleWatchlist?: () => void;
}

export function InfoModal({
  anime,
  isOpen,
  onClose,
  episodes,
  episodesLoading,
  onPlayEpisode,
  isInWatchlist,
  onToggleWatchlist,
}: InfoModalProps) {
  const [activeTab, setActiveTab] = useState<"episodes" | "more" | "trailers">("episodes");
  const [episodeRange, setEpisodeRange] = useState(0);

  // Reset episode range when anime changes
  useEffect(() => {
    setEpisodeRange(0);
  }, [anime?.dataId]);

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

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

  // Filter episodes based on selected range
  const displayedEpisodes = useMemo(() => {
    if (episodeRanges.length === 0) return episodes;
    
    // Safety check: ensure episodeRange is valid
    const currentIndex = episodeRange >= episodeRanges.length ? 0 : episodeRange;
    const range = episodeRanges[currentIndex];
    
    if (!range) return episodes;
    
    return episodes.slice(range.start, range.end);
  }, [episodes, episodeRange, episodeRanges]);

  if (!isOpen || !anime) return null;

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="detail-drag-handle md:hidden" aria-hidden="true" />
        {/* Close button */}
        <button className="detail-close" onClick={onClose}>
          <X className="h-5 w-5" />
        </button>

        {/* TOP HERO AREA */}
        <div className="detail-hero">
          {anime.image ? (
            <img src={anime.image} alt={anime.title ?? "Anime"} className="detail-hero-bg" />
          ) : (
            <div className="detail-hero-bg bg-gradient-to-br from-blue-900 to-black" />
          )}
          <div className="detail-hero-scrim" />
          <div className="detail-hero-content">
            {anime.type && <div className="detail-hero-tag">{anime.type}</div>}
            <h1 className="detail-hero-title">{anime.title ?? "Untitled"}</h1>
            <div className="detail-hero-meta">
              <span>2024</span>
              <span className="detail-dot" />
              <span>★ 4.8</span>
              {episodes.length > 0 && (
                <>
                  <span className="detail-dot" />
                  <span>{episodes.length} Episodes</span>
                </>
              )}
              <div className="detail-language-badges">
                {anime.language?.sub && (
                  <Badge variant="outline" className="border-gray-500 text-gray-300 bg-transparent h-5 text-[10px]">
                    SUB
                  </Badge>
                )}
                {anime.language?.dub && (
                  <Badge variant="outline" className="border-gray-500 text-gray-300 bg-transparent h-5 text-[10px]">
                    DUB
                  </Badge>
                )}
              </div>
            </div>
            <p className="detail-hero-description">
              Experience the thrill of this epic saga. Watch the latest episodes in high definition with multiple audio options available.
            </p>
            <div className="detail-hero-actions">
              <Button
                className="btn btn-primary w-full sm:w-auto justify-center"
                onClick={() => {
                  if (episodes.length > 0) {
                    onPlayEpisode(episodes[0]);
                  }
                }}
                disabled={episodes.length === 0}
              >
                <Play className="h-5 w-5 fill-white mr-2" />
                Watch Now
              </Button>
              <Button
                className="btn btn-secondary w-full sm:w-auto justify-center"
                onClick={onToggleWatchlist}
              >
                {isInWatchlist ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    In Watchlist
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 mr-2" />
                    Watchlist
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* BOTTOM CONTENT (tabs + episodes) */}
        <div className="detail-body">
          <div className="detail-tabs">
            <button
              className={"detail-tab" + (activeTab === "episodes" ? " is-active" : "")}
              onClick={() => setActiveTab("episodes")}
            >
              Episodes
            </button>
            <button
              className={"detail-tab" + (activeTab === "more" ? " is-active" : "")}
              onClick={() => setActiveTab("more")}
            >
              More Like This
            </button>
            <button
              className={"detail-tab" + (activeTab === "trailers" ? " is-active" : "")}
              onClick={() => setActiveTab("trailers")}
            >
              Trailers & More
            </button>
          </div>

          {activeTab === "episodes" && (
            <div className="detail-episodes">
              <div className="detail-season-header">
                <span className="detail-season-title">All Episodes</span>
                {episodeRanges.length > 0 && (
                  <Select
                    value={String(episodeRange)}
                    onValueChange={(value) => setEpisodeRange(Number(value))}
                  >
                    <SelectTrigger className="ml-3 h-8 w-32 bg-white/5 border-white/10 text-white text-xs tracking-wide uppercase">
                      <SelectValue placeholder="Episodes range" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 border-white/10 text-white z-[100]">
                      {episodeRanges.map((range, idx) => (
                        <SelectItem
                          key={range.label}
                          value={String(idx)}
                          className="cursor-pointer focus:bg-white/10 data-[state=checked]:bg-blue-600/20 data-[state=checked]:text-blue-400"
                        >
                          Episodes {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              {episodesLoading ? (
                <div className="detail-placeholder">Loading episodes...</div>
              ) : displayedEpisodes.length > 0 ? (
                <div className="detail-episode-list">
                  {displayedEpisodes.map((ep) => {
                    const progressPercentage = ep.currentTime && ep.duration 
                      ? (ep.currentTime / ep.duration) * 100 
                      : 0;

                    return (
                      <button
                        key={ep.id}
                        className="detail-episode"
                        onClick={() => onPlayEpisode(ep)}
                      >
                        <div className="detail-episode-thumb-wrapper">
                          <div className="detail-episode-thumb placeholder relative">
                            <span className="play-icon">
                              <Play className="h-4 w-4 fill-white" />
                            </span>
                            {/* Progress bar on episode thumbnail */}
                            {progressPercentage > 0 && (
                              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800/80">
                                <div 
                                  className="h-full bg-blue-500 transition-all"
                                  style={{ width: `${progressPercentage}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="detail-episode-info">
                          <div className="detail-episode-title-row">
                            <span className="detail-episode-title">
                              {ep.title || `Episode ${ep.number ?? "?"}`}
                            </span>
                            <span className="detail-episode-meta">
                              Episode {ep.number ?? "?"}
                              {progressPercentage > 0 && (
                                <span className="ml-2 text-blue-400">
                                  • {Math.round(progressPercentage)}% watched
                                </span>
                              )}
                            </span>
                          </div>
                          <p className="detail-episode-description">
                            Watch this exciting episode now in high quality.
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="detail-placeholder">No episodes available</div>
              )}
            </div>
          )}

          {activeTab === "more" && (
            <div className="detail-placeholder">More Like This (coming soon)</div>
          )}

          {activeTab === "trailers" && (
            <div className="detail-placeholder">Trailers & More (coming soon)</div>
          )}
        </div>
      </div>
    </div>
  );
}