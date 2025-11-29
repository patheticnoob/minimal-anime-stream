import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";
import { motion } from "framer-motion";

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
  // Progress tracking fields
  episodeNumber?: number;
  currentTime?: number;
  duration?: number;
};

interface AnimeCardProps {
  anime: AnimeItem;
  onClick: () => void;
  index?: number;
  variant?: "portrait" | "landscape";
}

export function AnimeCard({ anime, onClick, variant = "portrait" }: AnimeCardProps) {
  const progressPercentage = anime.currentTime && anime.duration
    ? (anime.currentTime / anime.duration) * 100
    : 0;

  const aspectRatioClass = variant === "landscape" ? "aspect-[1.45/1]" : "aspect-[2/3]";

  return (
    <motion.button
      type="button"
      aria-label={anime.title ?? "Open anime"}
      className="anime-card group relative flex flex-col gap-2 text-left"
      onClick={onClick}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 180, damping: 20 }}
    >
      <div
        className={`anime-card-poster-frame relative w-full ${aspectRatioClass} rounded-md overflow-hidden bg-[#1a1f2e] shadow-lg shadow-black/40`}
      >
        {anime.image ? (
          <img
            src={anime.image}
            alt={anime.title ?? "Anime"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gray-900">
            No Image
          </div>
        )}

        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="anime-card-retro-overlay" aria-hidden="true" />
        <div className="anime-card-retro-scanlines" aria-hidden="true" />

        {/* Episode number badge - Top Left */}
        {anime.episodeNumber && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-[#1977F3] text-white border-0 text-[10px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm">
              EP {anime.episodeNumber}
            </Badge>
          </div>
        )}

        {/* Type badge - Top Right */}
        {anime.type && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-black/60 backdrop-blur-md text-white border-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm">
              {anime.type}
            </Badge>
          </div>
        )}

        {/* Progress bar - Bottom */}
        {progressPercentage > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/30">
            <div 
              className="h-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.8)]"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}

        {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <Play className="h-5 w-5 text-white fill-white ml-0.5" />
           </div>
        </div>
      </div>
      
      <div className="px-0.5">
        <h3 className="font-medium text-sm text-gray-100 line-clamp-1 group-hover:text-[#1977F3] transition-colors">
          {anime.title ?? "Untitled"}
        </h3>
        
        <div className="flex gap-2 mt-1 text-[10px] font-medium text-[#8f9aa3]">
          {anime.language?.sub && <span>SUB {anime.language.sub}</span>}
          {anime.language?.sub && anime.language?.dub && <span className="text-gray-600">•</span>}
          {anime.language?.dub && <span>DUB {anime.language.dub}</span>}
        </div>
      </div>
    </motion.button>
  );
}