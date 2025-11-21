import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Plus, Info, Star, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

export function HeroBanner({ anime, onPlay, onMoreInfo }: HeroBannerProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={anime.id || anime.dataId}
        className="relative w-full h-[50vh] md:h-[65vh] mb-10 overflow-hidden rounded-2xl shadow-2xl group"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          {anime.image ? (
            <img
              src={anime.image}
              alt={anime.title ?? "Hero"}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-900 to-black" />
          )}
        </div>

        {/* Gradient Overlays - Hotstar style (Left to Right) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F19] via-[#0B0F19]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent" />

        {/* Content */}
        <div className="relative h-full flex flex-col justify-center p-8 md:p-16 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-2xl space-y-6"
          >
            {/* Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-none drop-shadow-lg">
              {anime.title ?? "Featured Anime"}
            </h1>

            {/* Meta Data Row */}
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base font-medium text-gray-300">
              {anime.type && (
                <span className="text-blue-400 font-bold uppercase tracking-wider">{anime.type}</span>
              )}
              <span className="w-1 h-1 bg-gray-500 rounded-full" />
              <div className="flex gap-2">
                {anime.language?.sub && (
                  <Badge variant="outline" className="border-gray-500 text-gray-300 bg-transparent">SUB</Badge>
                )}
                {anime.language?.dub && (
                  <Badge variant="outline" className="border-gray-500 text-gray-300 bg-transparent">DUB</Badge>
                )}
              </div>
              <span className="w-1 h-1 bg-gray-500 rounded-full" />
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="h-4 w-4 fill-current" />
                <span>4.8</span>
              </div>
              <span className="w-1 h-1 bg-gray-500 rounded-full" />
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>2024</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-300/90 text-base md:text-lg line-clamp-3 leading-relaxed max-w-xl">
              Experience the thrill of this epic saga. Watch the latest episodes in high definition with multiple audio options available. Join the adventure today.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Button
                size="lg"
                onClick={onPlay}
                className="h-14 px-8 bg-white text-black hover:bg-gray-200 font-bold text-lg rounded-lg transition-transform hover:scale-105"
              >
                <Play className="mr-2 h-6 w-6 fill-black" />
                Watch Now
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={onMoreInfo}
                className="h-14 px-8 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm font-semibold text-lg rounded-lg"
              >
                <Info className="mr-2 h-6 w-6" />
                More Info
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="h-14 w-14 p-0 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm rounded-lg"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}