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
    <div className="bg-white dark:bg-[#1A1D24] border border-black/5 dark:border-white/10 rounded-[24px] p-8 relative overflow-hidden shadow-sm transition-colors duration-300">
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
        <h1 className="text-9xl font-bold tracking-tighter text-black dark:text-white">NOTHING</h1>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8 relative z-10">
        {anime?.image && (
          <div className="shrink-0">
            <img
              src={anime.image}
              alt={anime.title}
              className="w-40 h-60 object-cover rounded-2xl shadow-lg border border-black/5 dark:border-white/5"
            />
          </div>
        )}
        <div className="flex-1 space-y-6">
          <div>
            <h2 className="text-4xl font-bold mb-3 tracking-tight leading-tight text-[#050814] dark:text-white">{anime?.title || "Unknown Title"}</h2>

            {/* Alternative Title */}
            {anime?.alternativeTitle && (
              <p className="text-sm text-black/50 dark:text-white/50 mb-3 italic">{anime.alternativeTitle}</p>
            )}

            <div className="flex items-center gap-3 flex-wrap">
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
                <span className="px-3 py-1 rounded-full border border-[#ff4d4f]/30 text-[#ff4d4f] text-xs font-medium tracking-wider uppercase">
                  {episodeCount} Episodes
                </span>
              )}
              {anime?.quality && (
                <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-xs font-bold tracking-wider uppercase">
                  {anime.quality}
                </span>
              )}
              {anime?.rating && (
                <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-bold tracking-wider uppercase">
                  {anime.rating}
                </span>
              )}
              {anime?.status && (
                <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-medium tracking-wider uppercase">
                  {anime.status}
                </span>
              )}
              {anime?.malScore && (
                <span className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold tracking-wider uppercase flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  {anime.malScore}
                </span>
              )}
            </div>

            {/* Genres */}
            {anime?.genres && anime.genres.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {anime.genres.map((genre: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-medium text-black/70 dark:text-white/70"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Synopsis */}
            {anime?.synopsis && (
              <div className="mt-4 p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                <h3 className="text-xs font-bold tracking-[0.2em] text-black/40 dark:text-white/40 uppercase mb-2">Synopsis</h3>
                <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed">
                  {anime.synopsis}
                </p>
              </div>
            )}

            {/* Additional Info (Premiered, Studios, Producers) */}
            {(anime?.premiered || anime?.studios || anime?.producers) && (
              <div className="mt-4 space-y-2">
                {anime.premiered && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-black/60 dark:text-white/60">Premiered:</span>
                    <span className="text-black/80 dark:text-white/80">{anime.premiered}</span>
                  </div>
                )}
                {anime.studios && anime.studios.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-black/60 dark:text-white/60">Studios:</span>
                    <span className="text-black/80 dark:text-white/80">{anime.studios.join(", ")}</span>
                  </div>
                )}
                {anime.producers && anime.producers.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-black/60 dark:text-white/60">Producers:</span>
                    <span className="text-black/80 dark:text-white/80">{anime.producers.join(", ")}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {(anime?.language?.sub || anime?.language?.dub) && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-black/60 dark:text-white/60">Audio:</span>
              <div className="inline-flex rounded-full border border-black/10 dark:border-white/20 p-1 bg-black/5 dark:bg-white/5">
                <button
                  onClick={() => onAudioPreferenceChange("sub")}
                  disabled={!anime?.language?.sub}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${
                    audioPreference === "sub"
                      ? "bg-[#ff4d4f] text-white shadow-md"
                      : "text-black/60 dark:text-white/60 hover:text-black/80 dark:hover:text-white/80"
                  } ${!anime?.language?.sub ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  SUB
                </button>
                <button
                  onClick={() => onAudioPreferenceChange("dub")}
                  disabled={!anime?.language?.dub}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${
                    audioPreference === "dub"
                      ? "bg-[#ff4d4f] text-white shadow-md"
                      : "text-black/60 dark:text-white/60 hover:text-black/80 dark:hover:text-white/80"
                  } ${!anime?.language?.dub ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  DUB
                </button>
              </div>
            </div>
          )}

          {episodeCount > 0 && (
            <Button
              onClick={onPlayFirst}
              className="nothing-play-cta h-14 px-8 rounded-full bg-[#ff4d4f] text-white hover:bg-[#ff4d4f]/90 transition-all text-base font-bold tracking-wide shadow-lg shadow-[#ff4d4f]/20"
              disabled={episodeCount === 0}
            >
              <Play className="mr-2 h-5 w-5 fill-white" />
              START WATCHING
            </Button>
          )}

          {shouldShowBroadcast && (
            <div className="flex items-start gap-4 p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 max-w-md">
              <div className="p-2 rounded-full bg-[#ff4d4f]/10 dark:bg-[#ff4d4f]/20 text-[#ff4d4f]">
                <Clock3 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                {isBroadcastLoading ? (
                  <span className="text-sm text-black/60 dark:text-white/60">Syncing broadcast data...</span>
                ) : (
                  <div className="space-y-1">
                    <span className="block text-xs font-bold tracking-[0.2em] text-black/40 dark:text-white/40 uppercase">
                      Next Broadcast
                    </span>
                    <span className="block font-medium text-[#050814] dark:text-white">
                      {broadcastDetails?.istLabel ?? broadcastInfo?.summary ?? "TBA"}
                    </span>
                    {broadcastDetails?.countdown && (
                      <span className="block text-sm text-[#ff4d4f]">
                        {broadcastDetails.countdown}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}