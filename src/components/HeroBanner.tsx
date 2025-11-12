import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Plus, Info } from "lucide-react";
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
    <motion.div
      className="relative w-full h-[60vh] md:h-[70vh] mb-8 overflow-hidden rounded-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        {anime.image ? (
          <img
            src={anime.image}
            alt={anime.title ?? "Hero"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-900 to-black" />
        )}
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-8 md:p-12 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="max-w-2xl"
        >
          {/* Badges */}
          <div className="flex gap-2 mb-4">
            {anime.type && (
              <Badge className="bg-blue-600 text-white border-0">
                {anime.type}
              </Badge>
            )}
            {anime.language?.sub && (
              <Badge className="bg-gray-800 text-white border-0">SUB</Badge>
            )}
            {anime.language?.dub && (
              <Badge className="bg-gray-800 text-white border-0">DUB</Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            {anime.title ?? "Featured Anime"}
          </h1>

          {/* Description placeholder */}
          <p className="text-gray-300 text-sm md:text-base mb-6 line-clamp-3">
            Watch the latest episodes and enjoy high-quality streaming with multiple audio options.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={onPlay}
              className="bg-white text-black hover:bg-gray-200 font-semibold"
            >
              <Play className="mr-2 h-5 w-5 fill-black" />
              Play Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onMoreInfo}
              className="bg-gray-800/80 text-white border-gray-700 hover:bg-gray-700"
            >
              <Info className="mr-2 h-5 w-5" />
              More Info
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-gray-800/80 text-white border-gray-700 hover:bg-gray-700"
            >
              <Plus className="mr-2 h-5 w-5" />
              Watchlist
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
