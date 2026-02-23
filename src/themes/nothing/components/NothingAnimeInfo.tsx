import { Play, Star, Calendar, Clock, Tv } from "lucide-react";
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
  const showBroadcastInfo = shouldShowBroadcast || (!isBroadcastLoading && !broadcastInfo);

  const airedFrom = anime?.aired?.from
    ? new Date(anime.aired.from).getFullYear()
    : null;
  const airedTo = anime?.aired?.to
    ? new Date(anime.aired.to).getFullYear()
    : null;
  const airedLabel = airedFrom
    ? airedTo && airedTo !== airedFrom
      ? `${airedFrom}–${airedTo}`
      : String(airedFrom)
    : null;

  return (
    <div className="space-y-4">
      {/* Main Info Card - Horizontal Layout */}
      <div className="bg-white dark:bg-[#1A1D24] border border-black/5 dark:border-white/10 rounded-[24px] p-6 relative overflow-hidden shadow-sm transition-colors duration-300">
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
          <h1 className="text-9xl font-bold tracking-tighter text-black dark:text-white">NOTHING</h1>
        </div>
        
        {/* Horizontal Layout: Poster + Content Side by Side */}
        <div className="flex gap-6 items-stretch relative z-10">
          {/* Poster - Left Side */}
          {anime?.image && (
            <div className="shrink-0 w-[200px] aspect-[2/3] rounded-xl overflow-hidden shadow-lg border border-black/5 dark:border-white/5">
              <img
                src={anime.image}
                alt={anime.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              />
            </div>
          )}

          {/* Content - Right Side */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-[#050814] dark:text-white break-words">
              {anime?.title || "Unknown Title"}
            </h2>

            {/* Meta row: MAL score, type, status, aired */}
            <div className="flex items-center gap-3 flex-wrap text-xs text-black/50 dark:text-white/50">
              {anime?.malScore && (
                <span className="flex items-center gap-1 text-yellow-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-yellow-500" />
                  {Number(anime.malScore).toFixed(2)}
                </span>
              )}
              {anime?.type && (
                <span className="flex items-center gap-1">
                  <Tv className="w-3 h-3" />
                  {anime.type}
                </span>
              )}
              {anime?.status && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                  anime.status.toLowerCase().includes("airing")
                    ? "bg-green-500/15 text-green-500"
                    : "bg-black/10 dark:bg-white/10 text-black/60 dark:text-white/60"
                }`}>
                  {anime.status}
                </span>
              )}
              {airedLabel && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {airedLabel}
                </span>
              )}
              {anime?.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {anime.duration}
                </span>
              )}
            </div>

            {/* Badges Row */}
            <div className="flex items-center gap-2 flex-wrap">
              {anime?.language?.sub && (
                <span className="px-3 py-1.5 rounded-full bg-black/10 dark:bg-white/10 text-xs font-medium tracking-wider uppercase text-black/80 dark:text-white/80">
                  SUB
                </span>
              )}
              {anime?.language?.dub && (
                <span className="px-3 py-1.5 rounded-full bg-black/10 dark:bg-white/10 text-xs font-medium tracking-wider uppercase text-black/80 dark:text-white/80">
                  DUB
                </span>
              )}
              {episodeCount > 0 && (
                <span className="px-3 py-1.5 rounded-full border border-[#ff4d4f]/30 text-[#ff4d4f] text-xs font-bold tracking-wider uppercase">
                  {episodeCount} EPISODES
                </span>
              )}
              {anime?.rating && (
                <span className="px-3 py-1.5 rounded-full bg-black/10 dark:bg-white/10 text-xs font-medium tracking-wider uppercase text-black/80 dark:text-white/80">
                  {anime.rating}
                </span>
              )}
            </div>

            {/* Genres */}
            {anime?.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {anime.genres.slice(0, 6).map((genre: string) => (
                  <span
                    key={genre}
                    className="px-2.5 py-1 rounded-full bg-[#ff4d4f]/10 text-[#ff4d4f] text-[10px] font-semibold tracking-wider uppercase"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Studios / Producers */}
            {(anime?.studios?.length > 0 || anime?.producers?.length > 0) && (
              <div className="flex flex-col gap-1 text-xs text-black/50 dark:text-white/40">
                {anime?.studios?.length > 0 && (
                  <span>
                    <span className="font-semibold text-black/70 dark:text-white/60">Studio: </span>
                    {anime.studios.join(", ")}
                  </span>
                )}
                {anime?.producers?.length > 0 && (
                  <span>
                    <span className="font-semibold text-black/70 dark:text-white/60">Producers: </span>
                    {anime.producers.slice(0, 3).join(", ")}
                    {anime.producers.length > 3 ? ` +${anime.producers.length - 3}` : ""}
                  </span>
                )}
              </div>
            )}

            {/* Spacer to push button to bottom */}
            <div className="flex-1" />

            {/* Play Button */}
            {episodeCount > 0 && (
              <Button
                onClick={onPlayFirst}
                className="w-full max-w-full h-14 px-6 rounded-full bg-[#ff4d4f] text-white hover:bg-[#ff4d4f]/90 transition-all text-sm sm:text-base font-bold tracking-wide shadow-lg shadow-[#ff4d4f]/20 hover:scale-105 active:scale-95"
                disabled={episodeCount === 0}
              >
                <Play className="mr-2 h-5 w-5 fill-white shrink-0" />
                <span className="truncate">START WATCHING</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Broadcast & Audio Section */}
      {(shouldShowBroadcast || anime?.language?.sub || anime?.language?.dub) && (
        <div className="bg-white dark:bg-[#1A1D24] border border-black/5 dark:border-white/10 rounded-[24px] p-5 flex flex-row gap-6 items-center justify-between shadow-sm transition-colors duration-300">
          {/* Audio Toggle */}
          {(anime?.language?.sub || anime?.language?.dub) && (
            <div className="flex items-center gap-3 shrink-0">
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
          {showBroadcastInfo && (
            <div className="flex flex-col items-end text-right flex-1 min-w-0">
              <span className="text-[10px] font-bold tracking-[0.2em] text-black/40 dark:text-white/40 uppercase mb-1">
                Next Broadcast
              </span>
              {isBroadcastLoading ? (
                <span className="text-sm text-black/60 dark:text-white/60 animate-pulse">Syncing schedule...</span>
              ) : (
                <>
                  <span className="text-sm font-medium text-black dark:text-white">
                    {broadcastDetails?.istLabel ?? broadcastInfo?.summary ?? "No broadcast info available"}
                  </span>
                  {broadcastDetails?.countdown && (
                    <span className="text-xs text-[#ff4d4f] font-medium">{broadcastDetails.countdown}</span>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}