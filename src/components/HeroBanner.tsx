import { Button } from "@/components/ui/button";
import { Play, Info, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { memo } from "react";
import { useTheme } from "@/hooks/use-theme";

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
};

interface HeroBannerProps {
  anime: AnimeItem;
  onPlay: () => void;
  onMoreInfo: () => void;
}

function HeroBannerBase({ anime, onPlay, onMoreInfo }: HeroBannerProps) {
  const { theme } = useTheme();
  const availableLanguages = [
    anime.language?.sub ? "Sub" : null,
    anime.language?.dub ? "Dub" : null,
  ].filter(Boolean) as string[];

  const heroStatusLabel = anime.type?.toLowerCase().includes("movie") 
    ? "PREMIERE SPOTLIGHT" 
    : "NOW STREAMING WEEKLY";

  // Apply the modern card hero only to the NothingOS theme
  if (theme === "nothing") {
    return (
    <motion.section
      className="hero-banner-modern bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex flex-col lg:flex-row">
        {/* Left Content */}
        <motion.div
          className="w-full lg:w-3/5 p-8 md:p-12 flex flex-col justify-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          {/* Status Badge */}
          <div className="mb-4">
            <span className="inline-block border-2 border-gray-900 dark:border-white rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-gray-900 dark:text-white dark:bg-[#E50914] dark:border-[#E50914]">
              {heroStatusLabel}
            </span>
          </div>

          {/* Compact Meta Info - Small inline tags */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {anime.type && (
              <span className="bg-gray-100 dark:bg-transparent text-gray-900 dark:text-white text-[10px] font-bold px-2.5 py-1 uppercase tracking-wide rounded">
                {anime.type}
              </span>
            )}
            {availableLanguages.length > 0 && (
              <span className="bg-gray-100 dark:bg-transparent text-gray-900 dark:text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wide border-2 border-gray-900 dark:border-white">
                {availableLanguages.join(" • ")}
              </span>
            )}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-transparent text-gray-900 dark:text-white text-[10px] font-bold px-2.5 py-1 rounded border-2 border-gray-900 dark:border-white">
              <span className="text-yellow-500 dark:text-yellow-300 text-xs">★</span>
              <span>4.8 / 5</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-black my-4 leading-none text-gray-900 dark:text-white tracking-tight">
            {anime.title ?? "Featured Anime"}
          </h1>

          {/* Description */}
          <p className="text-gray-600 dark:text-[#D1D5DB] max-w-xl mb-6 text-base leading-relaxed">
            Experience the thrill of this epic saga. Watch the latest episodes in high definition with multiple audio
            options available. Join the adventure today.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              onClick={onPlay}
              className="bg-[#E50914] border-2 border-[#E50914] text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 hover:bg-[#C4070F] hover:border-[#C4070F] transition-colors"
            >
              <Play className="h-5 w-5" />
              WATCH NOW
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={onMoreInfo}
              className="border-2 border-gray-900 dark:border-white bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
            >
              <Info className="h-5 w-5" />
              MORE INFO
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-2 border-gray-900 dark:border-white bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white font-bold py-3 px-4 rounded-full hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </motion.div>

        {/* Right Image - Hidden on mobile */}
        {anime.image && (
          <motion.div
            className="hidden lg:block w-2/5 relative hero-banner-art"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/50 dark:from-transparent dark:to-[#1A1D24]/80 z-10" />
            <img
              src={anime.image}
              alt={anime.title || "Anime poster"}
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}
      </div>
    </motion.section>
    );
  }

  // Default hero banner for retro and nothing themes
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
            Experience the thrill of this epic saga. Watch the latest episodes in high definition with multiple audio
            options available. Join the adventure today.
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
          </div>

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