import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";
import { motion } from "framer-motion";
import { memo } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Skeleton } from "@/components/ui/skeleton";

type AnimeItem = {
  title?: string;
  image?: string;
  type?: string;
  id?: string;
  dataId?: string;
  language?: {
    sub?: string | null;
    dub?: string | null;
  };
  episodeNumber?: number;
  currentTime?: number;
  duration?: number;
};

interface AnimeCardProps {
  anime: AnimeItem;
  onClick: () => void;
  index?: number;
  variant?: "portrait" | "landscape";
  isLoading?: boolean;
}

function AnimeCardSkeleton({ variant = "portrait", theme }: { variant?: "portrait" | "landscape"; theme: string }) {
  const aspectRatioClass = variant === "landscape" ? "aspect-[1.45/1]" : "aspect-[2/3]";
  const borderRadiusClass = theme === "nothing" ? "rounded-[28px]" : "rounded-[4px]";

  return (
    <div className="anime-card flex flex-col gap-2">
      <Skeleton className={`w-full ${aspectRatioClass} ${borderRadiusClass} ${theme === "nothing" ? "bg-[var(--nothing-elevated)]" : "bg-white/10"}`} />
      <div className="px-0.5 space-y-2">
        <Skeleton className={`h-4 w-full ${theme === "nothing" ? "bg-[var(--nothing-elevated)]" : "bg-white/10"}`} />
        <Skeleton className={`h-4 w-3/4 ${theme === "nothing" ? "bg-[var(--nothing-elevated)]" : "bg-white/10"}`} />
        <Skeleton className={`h-3 w-1/2 ${theme === "nothing" ? "bg-[var(--nothing-elevated)]" : "bg-white/10"}`} />
      </div>
    </div>
  );
}

function AnimeCardBase({ anime, onClick, variant = "portrait", isLoading = false }: AnimeCardProps) {
  const { theme } = useTheme();
  
  if (isLoading) {
    return <AnimeCardSkeleton variant={variant} theme={theme} />;
  }

  const progressPercentage = anime.currentTime && anime.duration
    ? (anime.currentTime / anime.duration) * 100
    : 0;

  const aspectRatioClass = variant === "landscape" ? "aspect-[1.45/1]" : "aspect-[2/3]";
  
  // NothingOS theme uses larger border radius
  const borderRadiusClass = theme === "nothing" ? "rounded-[28px]" : "rounded-[4px]";

  return (
    <motion.button
      type="button"
      aria-label={anime.title ?? "Open anime"}
      className="anime-card group relative flex flex-col gap-2 text-left"
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 22,
        duration: window.innerWidth < 768 ? 0 : undefined
      }}
    >
      <div
        className={`anime-card-poster-frame relative w-full ${aspectRatioClass} overflow-hidden bg-[#1a1f2e] ${theme === "nothing" ? "" : "shadow-lg"} ${borderRadiusClass}`}
      >
        {anime.image ? (
          <img
            src={anime.image}
            alt={anime.title ?? "Anime"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gray-900">
            No Image
          </div>
        )}

        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="anime-card-retro-overlay" aria-hidden="true" />
        <div className="anime-card-retro-scanlines" aria-hidden="true" />

        <div
          className="anime-card-play-overlay absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-hidden="true"
        >
          <div className={`anime-card-play-button w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40`}>
            <Play className="h-6 w-6 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Episode number badge - Top Left */}
        {anime.episodeNumber && (
          <div className="absolute top-2 left-2">
            <Badge className={`${theme === "nothing" ? "badge-accent" : "bg-[#1977F3]"} text-white border-0 text-[10px] font-bold px-2 py-1 ${theme === "nothing" ? "rounded-full" : "rounded-sm"} shadow-sm`}>
              EP {anime.episodeNumber}
            </Badge>
          </div>
        )}

        {/* Type badge - Top Right */}
        {anime.type && (
          <div className="absolute top-2 right-2">
            <Badge className={`${theme === "nothing" ? "bg-[var(--nothing-elevated)] text-[var(--nothing-fg)] border border-[var(--nothing-border)]" : "bg-black/60 backdrop-blur-md text-white border-0"} text-[9px] font-bold uppercase tracking-wider px-2 py-1 ${theme === "nothing" ? "rounded-full" : "rounded-sm"}`}>
              {anime.type}
            </Badge>
          </div>
        )}

        {/* Progress bar - Bottom */}
        {progressPercentage > 0 && (
          <div className={`absolute bottom-0 left-0 right-0 h-1 ${theme === "nothing" ? "bg-[var(--nothing-border)]" : "bg-white/30"}`}>
            <div 
              className={`h-full ${theme === "nothing" ? "bg-[var(--nothing-accent)]" : "bg-white"} shadow-[0_0_4px_rgba(255,255,255,0.8)]`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
      </div>
      
      <div className="px-0.5">
        <h3 className={`font-medium text-sm ${theme === "nothing" ? "text-[var(--nothing-fg)]" : "text-gray-100"} line-clamp-2 ${theme === "nothing" ? "group-hover:text-[var(--nothing-accent)]" : "group-hover:text-[#1977F3]"} transition-colors leading-tight min-h-[2.5rem]`}>
          {anime.title ?? "Untitled"}
        </h3>
        
        <div className={`flex gap-2 mt-1 text-[10px] font-medium ${theme === "nothing" ? "text-[var(--nothing-gray-4)]" : "text-[#8f9aa3]"}`}>
          {anime.language?.sub && <span>SUB {anime.language.sub}</span>}
          {anime.language?.sub && anime.language?.dub && <span className="text-gray-600">•</span>}
          {anime.language?.dub && <span>DUB {anime.language.dub}</span>}
        </div>
      </div>
    </motion.button>
  );
}

const areAnimeCardPropsEqual = (prev: AnimeCardProps, next: AnimeCardProps) => {
  const prevAnime = prev.anime;
  const nextAnime = next.anime;

  if (prevAnime === nextAnime && prev.onClick === next.onClick && prev.variant === next.variant) {
    return true;
  }

  if (!prevAnime || !nextAnime) {
    return false;
  }

  const sameAnime =
    prevAnime.id === nextAnime.id &&
    prevAnime.dataId === nextAnime.dataId &&
    prevAnime.title === nextAnime.title &&
    prevAnime.image === nextAnime.image &&
    prevAnime.type === nextAnime.type &&
    prevAnime.episodeNumber === nextAnime.episodeNumber &&
    prevAnime.currentTime === nextAnime.currentTime &&
    prevAnime.duration === nextAnime.duration &&
    prevAnime.language?.sub === nextAnime.language?.sub &&
    prevAnime.language?.dub === nextAnime.language?.dub;

  return sameAnime && prev.variant === next.variant && prev.onClick === next.onClick;
};

export const AnimeCard = memo(AnimeCardBase, areAnimeCardPropsEqual);