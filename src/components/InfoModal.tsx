import { useState } from "react";
import { X, Play, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Episode = {
  id: string;
  title?: string;
  number?: number;
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

  if (!isOpen || !anime) return null;

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-sheet" onClick={(e) => e.stopPropagation()}>
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
              <div className="flex gap-2 ml-2">
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
                className="btn btn-primary"
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
                className="btn btn-secondary"
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
              </div>
              {episodesLoading ? (
                <div className="detail-placeholder">Loading episodes...</div>
              ) : episodes.length > 0 ? (
                <div className="detail-episode-list">
                  {episodes.map((ep) => (
                    <button
                      key={ep.id}
                      className="detail-episode"
                      onClick={() => onPlayEpisode(ep)}
                    >
                      <div className="detail-episode-thumb-wrapper">
                        <div className="detail-episode-thumb placeholder">
                          <span className="play-icon">
                            <Play className="h-4 w-4 fill-white" />
                          </span>
                        </div>
                      </div>
                      <div className="detail-episode-info">
                        <div className="detail-episode-title-row">
                          <span className="detail-episode-title">
                            {ep.title || `Episode ${ep.number ?? "?"}`}
                          </span>
                          <span className="detail-episode-meta">
                            Episode {ep.number ?? "?"}
                          </span>
                        </div>
                        <p className="detail-episode-description">
                          Watch this exciting episode now in high quality.
                        </p>
                      </div>
                    </button>
                  ))}
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
