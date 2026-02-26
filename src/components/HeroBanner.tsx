import { Button } from "@/components/ui/button";
import { Play, Info, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { memo } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Skeleton } from "@/components/ui/skeleton";

type AnimeItem = {
  title?: string;
  alternativeTitle?: string;
  image?: string;
  type?: string;
  id?: string;
  dataId?: string;
  language?: {
    sub?: string | null;
    dub?: string | null;
  };
  synopsis?: string;
  genres?: string[];
  score?: number;
  malScore?: number;
  quality?: string;
  rank?: number | string; // V4: Can be string like "#1 Spotlight"
  rating?: string;
  totalEpisodes?: number;
  status?: string;
  aired?: string | { from?: string; to?: string | null };
  // V4 Spotlight-specific fields
  description?: string;
  releaseDate?: string;
  duration?: number | string; // number (progress) or string (V4: "24m")
  japaneseTitle?: string;
};

interface HeroBannerProps {
  anime: AnimeItem;
  onPlay: () => void;
  onMoreInfo: () => void;
  isLoading?: boolean;
}

function HeroBannerSkeleton({ theme }: { theme: string }) {
  if (theme === "nothing") {
    return (
      <motion.section
        className="hero-banner-modern bg-[#151821] rounded-[28px] overflow-hidden relative h-[500px] md:h-[550px] lg:h-[600px] flex w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-full lg:w-2/3 p-6 md:p-10 lg:p-12 flex flex-col justify-end lg:justify-center h-full z-20 relative">
          <Skeleton className="h-6 w-40 bg-white/10 rounded-full mb-6" />
          <div className="flex gap-2 mb-4">
            <Skeleton className="h-6 w-12 bg-white/10 rounded-sm" />
            <Skeleton className="h-6 w-16 bg-white/10 rounded-sm" />
            <Skeleton className="h-6 w-20 bg-white/10 rounded-sm" />
          </div>
          <Skeleton className="h-4 w-32 bg-white/10 mb-2" />
          <Skeleton className="h-12 md:h-16 w-full max-w-xl bg-white/10 my-2" />
          <Skeleton className="h-20 w-full max-w-xl bg-white/10 my-6" />
          <div className="flex gap-3 mt-2">
            <Skeleton className="h-12 w-40 rounded-full bg-white/10" />
            <Skeleton className="h-12 w-36 rounded-full bg-white/10" />
            <Skeleton className="h-12 w-12 rounded-full bg-white/10" />
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="hero-banner"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="hero-banner-inner">
        <div className="hero-banner-copy space-y-4">
          <Skeleton className="h-8 w-48 bg-white/10" />
          <Skeleton className="h-20 w-full max-w-2xl bg-white/10" />
          <Skeleton className="h-16 w-full max-w-xl bg-white/10" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 bg-white/10" />
            <Skeleton className="h-6 w-20 bg-white/10" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-12 w-40 bg-white/10" />
            <Skeleton className="h-12 w-36 bg-white/10" />
            <Skeleton className="h-12 w-12 bg-white/10" />
          </div>
        </div>
        <div className="hero-banner-art">
          <Skeleton className="w-full h-full bg-white/10" />
        </div>
      </div>
    </motion.section>
  );
}

function HeroBannerBase({ anime, onPlay, onMoreInfo, isLoading = false }: HeroBannerProps) {
  const { theme } = useTheme();
  
  if (isLoading) {
    return <HeroBannerSkeleton theme={theme} />;
  }

  const availableLanguages = [
    anime.language?.sub ? "Sub" : null,
    anime.language?.dub ? "Dub" : null,
  ].filter(Boolean) as string[];

  const heroStatusLabel = anime.type?.toLowerCase().includes("movie") 
    ? "PREMIERE SPOTLIGHT" 
    : "NOW STREAMING WEEKLY";

  // Check if we have V2/V4 enriched data
  const hasEnrichedData = !!(anime.synopsis || anime.description || anime.genres || anime.score || anime.malScore);
  const displayScore = anime.malScore?.toFixed(1) || anime.score?.toFixed(1) || "N/A";

  // V4 spotlight has 'description', V2 has 'synopsis'
  const rawDescription = anime.description || anime.synopsis;
  const displayDescription = rawDescription
    ? rawDescription.slice(0, 280) + (rawDescription.length > 280 ? "..." : "")
    : "Experience the thrill of this epic saga. Watch the latest episodes in high definition with multiple audio options available. Join the adventure today.";

  // Debug logging to see what data hero banner receives
  console.log('[HeroBanner] Received anime data:', {
    title: anime.title,
    synopsis: anime.synopsis?.substring(0, 50) + '...',
    quality: anime.quality,
    rank: anime.rank,
    rating: anime.rating,
    genres: anime.genres,
    hasEnrichedData,
    allKeys: Object.keys(anime)
  });

  // Apply the modern card hero only to the NothingOS theme
  if (theme === "nothing") {
    return (
    <motion.section
      className="hero-banner-modern bg-[var(--nothing-card-bg)] rounded-[28px] overflow-hidden relative h-[500px] md:h-[550px] lg:h-[600px] flex w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Background Image */}
      {anime.image && (
        <motion.div
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/95 via-black/80 lg:via-black/70 to-black/30 z-10" />
          <img
            src={anime.image}
            alt={anime.title || "Anime poster"}
            className="w-full h-full object-cover object-center"
          />
        </motion.div>
      )}

      {/* Left Content - always white text since it's on dark overlay */}
      <motion.div
        className="w-full lg:w-2/3 p-6 md:p-10 lg:p-12 flex flex-col justify-end lg:justify-center z-20 relative"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        {/* Status Badge */}
        <div className="mb-6">
          <span className="inline-block bg-[#E50914] text-white rounded-full px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase">
            {heroStatusLabel}
          </span>
        </div>

        {/* Compact Meta Info - Small inline tags */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {anime.rank && (
            <span className="bg-[#E50914] text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wide">
              {anime.rank}
            </span>
          )}
          {anime.type && (
            <span className="bg-[#E50914] text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wide">
              {anime.type}
            </span>
          )}
          {anime.duration && (
            <span className="bg-[#E50914] text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wide">
              {anime.duration}
            </span>
          )}
          {availableLanguages.length > 0 && (
            <span className="bg-[#E50914] text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wide">
              {availableLanguages.join(" + ")}
            </span>
          )}
          <div className="flex items-center gap-1 bg-white text-gray-900 text-[10px] font-bold px-2 py-1 rounded-sm">
            <span className="text-yellow-500 text-[10px]">★</span>
            <span>{displayScore} / 5</span>
          </div>
          {anime.quality && (
            <span className="bg-[#E50914] text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wide">
              {anime.quality}
            </span>
          )}
        </div>

        {/* Alternative Title or Japanese Title (V4) */}
        {(anime.alternativeTitle || anime.japaneseTitle) && (
          <p className="text-white/60 text-xs mb-2 font-mono">
            {anime.alternativeTitle || anime.japaneseTitle}
          </p>
        )}

        {/* Title - always white since it's on dark overlay */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black my-2 leading-tight !text-white tracking-tight drop-shadow-lg">
          {anime.title ?? "Featured Anime"}
        </h1>

        {/* Description - always light since it's on dark overlay */}
        <p className="!text-white/80 max-w-xl my-6 text-sm leading-relaxed font-mono line-clamp-4 drop-shadow">
          {displayDescription}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <Button
            size="lg"
            onClick={onPlay}
            className="bg-[#E50914] hover:bg-[#C4070F] text-white font-bold py-6 px-8 rounded-full flex items-center gap-2 transition-colors text-xs tracking-widest uppercase border-0"
          >
            <Play className="h-4 w-4 fill-current" />
            WATCH NOW
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={onMoreInfo}
            className="border border-white/40 hover:bg-white/10 bg-black/30 text-white font-bold py-6 px-8 rounded-full flex items-center gap-2 transition-colors text-xs tracking-widest uppercase"
          >
            <Info className="h-4 w-4" />
            MORE INFO
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="border border-white/40 hover:bg-white/10 bg-black/30 text-white font-bold h-12 w-12 rounded-full flex items-center justify-center transition-colors p-0"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </motion.div>
    </motion.section>
    );
  }

  // Default hero banner for retro and classic themes
  return (
    <motion.section
      className="hero-banner"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="hero-banner-inner">
        <div className="hero-banner-copy">
          <div className="hero-banner-pill">
            {heroStatusLabel}
          </div>

          <h1 className="hero-banner-title">
            {anime.title ?? "Featured Anime"}
          </h1>

          <p className="hero-banner-description">
            {displayDescription}
          </p>

          <div className="hero-banner-meta-row">
            {anime.type && (
              <span className="hero-banner-type-chip">{anime.type}</span>
            )}
            {availableLanguages.length > 0 && (
              <span className="hero-banner-language-chip">
                {availableLanguages.join(" • ")}
              </span>
            )}
            {hasEnrichedData && (
              <span className="hero-banner-type-chip">★ {displayScore}</span>
            )}
            {(anime as any).status && (
              <span className="hero-banner-language-chip">{(anime as any).status}</span>
            )}
          </div>

          {/* Genres for classic/retro themes */}
          {(anime as any).genres && (anime as any).genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 mb-2">
              {(anime as any).genres.slice(0, 5).map((genre: string, idx: number) => (
                <span key={idx} className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30">
                  {genre}
                </span>
              ))}
            </div>
          )}

          <div className="hero-banner-actions">
            <Button
              size="lg"
              onClick={onPlay}
              className="hero-banner-primary-btn"
            >
              <Play className="h-5 w-5 fill-white mr-2" />
              WATCH NOW
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={onMoreInfo}
              className="hero-banner-secondary-btn"
            >
              <Info className="h-5 w-5 mr-2" />
              MORE INFO
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="hero-banner-icon-btn"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {anime.image && (
          <div className="hero-banner-art">
            <img
              src={anime.image}
              alt={anime.title || "Anime poster"}
            />
          </div>
        )}
      </div>
    </motion.section>
  );
}

const areHeroBannerPropsEqual = (prev: HeroBannerProps, next: HeroBannerProps) => {
  const prevAnime = prev.anime;
  const nextAnime = next.anime;

  const sameAnime =
    prevAnime?.id === nextAnime?.id &&
    prevAnime?.dataId === nextAnime?.dataId &&
    prevAnime?.title === nextAnime?.title &&
    prevAnime?.image === nextAnime?.image &&
    prevAnime?.type === nextAnime?.type &&
    prevAnime?.language?.sub === nextAnime?.language?.sub &&
    prevAnime?.language?.dub === nextAnime?.language?.dub;

  return sameAnime && prev.onPlay === next.onPlay && prev.onMoreInfo === next.onMoreInfo;
};

export const HeroBanner = memo(HeroBannerBase, areHeroBannerPropsEqual);