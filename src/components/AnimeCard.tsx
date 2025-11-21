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
      className="group relative text-left w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="border-0 overflow-hidden bg-transparent shadow-none ring-0 outline-none">
        <CardContent className="p-0">
          <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] group-hover:ring-2 group-hover:ring-white/20">
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
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <div className="flex items-center gap-2 text-white mb-2">
                <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center">
                  <Play className="h-4 w-4 fill-black ml-0.5" />
                </div>
                <span className="font-semibold text-sm">Watch Now</span>
              </div>
            </div>

            {/* Type badge (Top Right) */}
            {anime.type && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-black/60 backdrop-blur-md text-white border-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                  {anime.type}
                </Badge>
              </div>
            )}
          </div>
          
          <div className="mt-3 px-1 space-y-1">
            <h3 className="font-medium text-base text-gray-100 line-clamp-1 group-hover:text-blue-400 transition-colors">
              {anime.title ?? "Untitled"}
            </h3>
            
            {/* Mini Pills */}
            <div className="flex gap-2 text-[10px] font-medium text-gray-400">
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