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
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="border-0 overflow-hidden bg-transparent shadow-none">
        <CardContent className="p-0">
          <div className="relative aspect-[2/3] w-full bg-gradient-to-b from-gray-900 to-black overflow-hidden rounded-lg">
            {anime.image ? (
              <img
                src={anime.image}
                alt={anime.title ?? "Anime"}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600">
                No Image
              </div>
            )}
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                <Play className="h-6 w-6 text-black fill-black ml-1" />
              </div>
            </div>

            {/* Type badge */}
            {anime.type && (
              <Badge className="absolute top-2 right-2 bg-blue-600/90 backdrop-blur text-white border-0 text-xs">
                {anime.type}
              </Badge>
            )}

            {/* Language badges */}
            <div className="absolute bottom-2 left-2 flex gap-1">
              {anime.language?.sub && (
                <Badge className="bg-gray-900/90 backdrop-blur text-white border-0 text-xs">
                  SUB
                </Badge>
              )}
              {anime.language?.dub && (
                <Badge className="bg-gray-900/90 backdrop-blur text-white border-0 text-xs">
                  DUB
                </Badge>
              )}
            </div>
          </div>
          
          <div className="mt-2 px-1">
            <h3 className="font-semibold text-sm text-white line-clamp-2 leading-tight">
              {anime.title ?? "Untitled"}
            </h3>
          </div>
        </CardContent>
      </Card>
    </motion.button>
  );
}
