import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";

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

interface AnimeCardProps {
  anime: AnimeItem;
  onClick: () => void;
  index?: number;
}

export function AnimeCard({ anime, onClick, index = 0 }: AnimeCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className="anime-card group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="border-0 overflow-hidden bg-transparent shadow-none ring-0 outline-none h-full">
        <CardContent className="p-0 h-full flex flex-col">
          <div className="anime-card-poster-wrapper">
            {anime.image ? (
              <img
                src={anime.image}
                alt={anime.title ?? "Anime"}
                className="anime-card-poster"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gray-900">
                No Image
              </div>
            )}
            
            {/* Hover overlay */}
            <div className="anime-card-overlay">
              <div className="flex items-center gap-2 text-white">
                <div className="anime-card-play-btn">
                  <Play className="h-4 w-4 fill-white ml-0.5" />
                </div>
                <span className="font-semibold text-sm">Watch Now</span>
              </div>
            </div>

            {/* Type badge (Top Right) */}
            {anime.type && (
              <div className="anime-card-top-badge">
                <Badge className="bg-black/70 backdrop-blur-md text-white border-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                  {anime.type}
                </Badge>
              </div>
            )}
          </div>
          
          <div className="anime-card-footer">
            <h3 className="anime-card-title">
              {anime.title ?? "Untitled"}
            </h3>
            
            {/* Mini Pills */}
            <div className="anime-card-chips">
              {anime.language?.sub && <span>SUB</span>}
              {anime.language?.sub && anime.language?.dub && <span>•</span>}
              {anime.language?.dub && <span>DUB</span>}
              {(anime.language?.sub || anime.language?.dub) && anime.type && <span>•</span>}
              {anime.type && <span>{anime.type}</span>}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.button>
  );
}