import { Play, Clock3, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type BroadcastInfo } from "@/types/broadcast";

interface NothingAnimeInfoProps {
  anime: any;
  episodeCount: number;
  onPlayFirst: () => void;
  broadcastInfo: BroadcastInfo | null;
  broadcastDetails: any;
  isBroadcastLoading: boolean;
  shouldShowBroadcast: boolean;
  audioPreference: "sub" | "dub";
  onAudioPreferenceChange: (preference: "sub" | "dub") => void;
}

export function NothingAnimeInfo({
  anime,
  episodeCount,
  onPlayFirst,
  broadcastInfo,
  broadcastDetails,
  isBroadcastLoading,
  shouldShowBroadcast,
  audioPreference,
  onAudioPreferenceChange
}: NothingAnimeInfoProps) {
  return (
    <div className="bg-white dark:bg-[#1A1D24] border border-black/5 dark:border-white/10 rounded-[24px] p-6 relative overflow-hidden shadow-sm transition-colors duration-300">
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
        <h1 className="text-9xl font-bold tracking-tighter text-black dark:text-white">NOTHING</h1>
      </div>
      
      {/* Horizontal Layout: Poster + Info Side by Side */}
      <div className="flex flex-col sm:flex-row gap-6 relative z-10">
        {/* Poster */}
        {anime?.image && (
          <div className="shrink-0 w-[140px] sm:w-[160px] aspect-[2/3] rounded-xl overflow-hidden shadow-lg border border-black/5 dark:border-white/5 mx-auto sm:mx-0">
            <img
              src={anime.image}
              alt={anime.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
          </div>
        )}

        {/* Info Section */}
        <div className="flex-1 space-y-4 min-w-0">
          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-[#050814] dark:text-white line-clamp-2">
            {anime?.title || "Unknown Title"}
          </h2>

          {/* Alternative Title */}
          {anime?.alternativeTitle && (
            <p className="text-sm text-black/50 dark:text-white/50 italic line-clamp-1">{anime.alternativeTitle}</p>
          )}

          {/* Badges Row */}
          <div className="flex items-center gap-2 flex-wrap">
            {anime?.type && (
              <span className="px-3 py-1 rounded-full border border-black/10 dark:border-white/20 text-xs font-medium tracking-wider uppercase text-black/60 dark:text-white/60">
                {anime.type}
              </span>
            )}
            {anime?.language?.sub && (
              <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-xs font-medium tracking-wider uppercase text-black/80 dark:text-white/80">
                SUB
              </span>
            )}
            {anime?.language?.dub && (
              <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-xs font-medium tracking-wider uppercase text-black/80 dark:text-white/80">
                DUB
              </span>
            )}
            {episodeCount > 0 && (
              <span className="px-3 py-1 rounded-full border border-[#ff4d4f]/30 text-[#ff4d4f] text-xs font-bold tracking-wider uppercase">
                {episodeCount} Episodes
              </span>
            )}
            {anime?.quality && (
              <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-xs font-bold tracking-wider uppercase">
                {anime.quality}
              </span>
            )}
            {anime?.malScore && (
              <span className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold tracking-wider uppercase flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                {anime.malScore}
              </span>
            )}
            {anime?.status && (
              <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-medium tracking-wider uppercase">
                {anime.status}
              </span>
            )}
          </div>

          {/* Synopsis - Compact */}
          {anime?.synopsis && (
            <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed line-clamp-3 hidden sm:block">
              {anime.synopsis}
            </p>
          )}

          {/* Genres - Compact */}
          {anime?.genres && anime.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {anime.genres.slice(0, 5).map((genre: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-medium text-black/70 dark:text-white/70"
                >
                  {genre}
                </span>
              ))}
              {anime.genres.length > 5 && (
                <span className="px-2.5 py-1 text-xs text-black/40 dark:text-white/40">
                  +{anime.genres.length - 5} more
                </span>
              )}
            </div>
          )}

          {/* Play Button */}
          {episodeCount > 0 && (
            <Button
              onClick={onPlayFirst}
              className="w-full sm:w-auto min-w-[200px] h-12 px-8 rounded-full bg-[#ff4d4f] text-white hover:bg-[#ff4d4f]/90 transition-all text-base font-bold tracking-wide shadow-lg shadow-[#ff4d4f]/20 hover:scale-105 active:scale-95"
              disabled={episodeCount === 0}
            >
              <Play className="mr-2 h-5 w-5 fill-white" />
              START WATCHING
            </Button>
          )}
        </div>
      </div>

      {/* Broadcast & Audio Section - Horizontal Bar */}
      {(shouldShowBroadcast || anime?.language?.sub || anime?.language?.dub) && (
        <div className="mt-6 bg-black/5 dark:bg-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between border border-black/5 dark:border-white/10">
          {/* Audio Toggle */}
          {(anime?.language?.sub || anime?.language?.dub) && (
            <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
              <span className="text-sm font-medium text-black/60 dark:text-white/60">Audio:</span>
              <div className="flex bg-black/20 dark:bg-white/10 rounded-full p-1 border border-black/10 dark:border-white/10">
                <button
                  onClick={() => onAudioPreferenceChange("sub")}
                  disabled={!anime?.language?.sub}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    audioPreference === "sub"
                      ? "bg-[#ff4d4f] text-white shadow-md"
                      : "text-black/60 dark:text-white/40 hover:text-black/80 dark:hover:text-white/60"
                  } ${!anime?.language?.sub ? "opacity-30 cursor-not-allowed" : ""}`}
                >
                  SUB
                </button>
                <button
                  onClick={() => onAudioPreferenceChange("dub")}
                  disabled={!anime?.language?.dub}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    audioPreference === "dub"
                      ? "bg-[#ff4d4f] text-white shadow-md"
                      : "text-black/60 dark:text-white/40 hover:text-black/80 dark:hover:text-white/60"
                  } ${!anime?.language?.dub ? "opacity-30 cursor-not-allowed" : ""}`}
                >
                  DUB
                </button>
              </div>
            </div>
          )}

          {/* Broadcast Info */}
          {shouldShowBroadcast && (
            <div className="flex items-center gap-3 text-center md:text-right w-full md:w-auto justify-center md:justify-end">
              <div className="hidden md:block w-px h-10 bg-black/10 dark:bg-white/10 mx-2" />
              <div className="flex flex-col items-center md:items-end">
                <span className="text-[10px] font-bold tracking-[0.2em] text-black/40 dark:text-white/40 uppercase mb-1">
                  Next Broadcast
                </span>
                {isBroadcastLoading ? (
                  <span className="text-sm text-black/60 dark:text-white/60 animate-pulse">Syncing schedule...</span>
                ) : (
                  <>
                    <span className="text-sm font-medium text-black dark:text-white">
                      {broadcastDetails?.istLabel ?? broadcastInfo?.summary ?? "TBA"}
                    </span>
                    {broadcastDetails?.countdown && (
                      <span className="text-xs text-[#ff4d4f] font-medium">{broadcastDetails.countdown}</span>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}