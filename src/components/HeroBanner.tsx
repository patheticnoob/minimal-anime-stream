import { Button } from "@/components/ui/button";
import { Play, Info, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { memo } from "react";
import type { CSSProperties } from "react";

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
  const availableLanguages = [
    anime.language?.sub ? "Sub" : null,
    anime.language?.dub ? "Dub" : null,
  ].filter(Boolean) as string[];

  const heroStatusLabel = anime.type?.toLowerCase().includes("movie") 
    ? "PREMIERE SPOTLIGHT" 
    : "NOW STREAMING WEEKLY";

  return (
    <motion.section
      className="hero-banner-modern"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Content */}
        <motion.div
          className="w-full lg:w-2/5 flex flex-col justify-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <div className="mb-4">
            <span className="font-display text-sm border border-current rounded-full px-4 py-1.5 tracking-widest uppercase">
              {heroStatusLabel}
            </span>
          </div>

          <div className="flex items-center gap-4 mb-2">
            {anime.type && (
              <span className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded uppercase">
                {anime.type}
              </span>
            )}
            {availableLanguages.length > 0 && (
              <span className="border border-gray-400 text-xs font-bold px-2 py-1 rounded">
                {availableLanguages.join(" • ")}
              </span>
            )}
            <div className="flex items-center gap-1">
              <span className="text-yellow-400 text-lg">★</span>
              <span className="font-bold text-sm">4.8 / 5</span>
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold my-4 leading-none">
            {anime.title ?? "Featured Anime"}
          </h1>

          <p className="text-gray-600 max-w-lg mb-6 text-base leading-relaxed">
            Experience the thrill of this epic saga. Watch the latest episodes in high definition with multiple audio
            options available. Join the adventure today.
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Button
              size="lg"
              onClick={onPlay}
              className="bg-[#FF3333] hover:bg-[#FF3333]/90 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2"
            >
              <Play className="h-5 w-5 fill-white" />
              WATCH NOW
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={onMoreInfo}
              className="border border-gray-400 font-medium py-3 px-6 rounded-lg flex items-center gap-2 hover:bg-gray-100"
            >
              <Info className="h-5 w-5" />
              MORE INFO
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border border-gray-400 font-medium py-3 px-3 rounded-lg hover:bg-gray-100"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>

          <p className="font-display text-xs tracking-wider text-gray-500 uppercase">
            • Instant playback powered by adaptive HLS streams.
          </p>
        </motion.div>

        {/* Right Image */}
        {anime.image && (
          <motion.div
            className="w-full lg:w-3/5"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <img
              src={anime.image}
              alt={anime.title || "Anime poster"}
              className="w-full h-auto object-cover rounded-lg shadow-2xl"
            />
          </motion.div>
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