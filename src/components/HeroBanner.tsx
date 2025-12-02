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
            <span className="inline-block border-2 border-gray-900 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-gray-900">
              {heroStatusLabel}
            </span>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {anime.type && (
              <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded uppercase">
                {anime.type}
              </span>
            )}
            {availableLanguages.length > 0 && (
              <span className="border-2 border-gray-900 text-gray-900 text-xs font-bold px-3 py-1 rounded uppercase">
                {availableLanguages.join(" • ")}
              </span>
            )}
            <div className="flex items-center gap-1">
              <span className="text-yellow-400 text-base">★</span>
              <span className="font-bold text-sm text-gray-900">4.8 / 5</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-black my-4 leading-none text-gray-900 tracking-tight">
            {anime.title ?? "Featured Anime"}
          </h1>

          {/* Description */}
          <p className="text-gray-600 max-w-xl mb-6 text-base leading-relaxed">
            Experience the thrill of this epic saga. Watch the latest episodes in high definition with multiple audio
            options available. Join the adventure today.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b-2 border-dashed border-gray-300">
            <div className="border-2 border-gray-900 rounded-lg p-3 text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Format</div>
              <div className="text-lg font-black text-gray-900">{anime.type || "TV"}</div>
            </div>
            <div className="border-2 border-gray-900 rounded-lg p-3 text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Audio</div>
              <div className="text-lg font-black text-gray-900">{availableLanguages.join(" / ") || "Sub / Dub"}</div>
            </div>
            <div className="border-2 border-gray-900 rounded-lg p-3 text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Rating</div>
              <div className="text-lg font-black text-gray-900">4.8 / 5</div>
            </div>
          </div>

          {/* Server Selection */}
          <div className="flex items-center gap-2 mb-6">
            <button className="border-2 border-gray-900 rounded-full px-4 py-1.5 text-xs font-bold uppercase hover:bg-gray-900 hover:text-white transition-colors">
              HD-1
            </button>
            <button className="border-2 border-gray-900 rounded-full px-4 py-1.5 text-xs font-bold uppercase hover:bg-gray-900 hover:text-white transition-colors">
              HD-2
            </button>
            <button className="border-2 border-gray-900 rounded-full px-4 py-1.5 text-xs font-bold uppercase hover:bg-gray-900 hover:text-white transition-colors">
              HD-3
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              onClick={onPlay}
              className="bg-[#FF3333] hover:bg-[#FF3333]/90 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 shadow-lg"
            >
              <Play className="h-5 w-5 fill-white" />
              WATCH NOW
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={onMoreInfo}
              className="border-2 border-gray-900 text-gray-900 font-bold py-3 px-8 rounded-lg flex items-center gap-2 hover:bg-gray-900 hover:text-white transition-colors"
            >
              <Info className="h-5 w-5" />
              MORE INFO
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-2 border-gray-900 text-gray-900 font-bold py-3 px-4 rounded-lg hover:bg-gray-900 hover:text-white transition-colors"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </motion.div>

        {/* Right Image - Hidden on mobile */}
        {anime.image && (
          <motion.div
            className="hidden lg:block w-2/5 relative"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/50 z-10" />
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