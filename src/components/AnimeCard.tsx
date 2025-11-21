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
  // Progress tracking fields
  episodeNumber?: number;
  currentTime?: number;
  duration?: number;
};

interface AnimeCardProps {
  anime: AnimeItem;
  onClick: () => void;
  index?: number;
}

export function AnimeCard({ anime, onClick }: AnimeCardProps) {
  const progressPercentage = anime.currentTime && anime.duration 
    ? (anime.currentTime / anime.duration) * 100 
    : 0;

  return (
    <div 
      className="anime-card group" 
      onClick={onClick}
    >
      <div className="anime-card-inner">
        <div className="relative">
          {anime.image ? (
            <img
              src={anime.image}
              alt={anime.title ?? "Anime"}
              className="anime-card-poster"
              loading="lazy"
            />
          ) : (
            <div className="anime-card-poster flex items-center justify-center text-gray-600 bg-gray-900">
              No Image
            </div>
          )}
          
          {/* Type badge */}
          {anime.type && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-black/60 backdrop-blur-md text-white border-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                {anime.type}
              </Badge>
            </div>
          )}

          {/* Episode number badge */}
          {anime.episodeNumber && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-blue-600/80 backdrop-blur-md text-white border-0 text-[10px] font-bold px-2 py-0.5">
                EP {anime.episodeNumber}
              </Badge>
            </div>
          )}

          {/* Progress bar */}
          {progressPercentage > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800/80">
              <div 
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}

          {/* Hover overlay with Play icon */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
             <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Play className="h-5 w-5 text-white fill-white" />
             </div>
          </div>
        </div>
        
        <div className="p-3">
          <h3 className="font-medium text-sm text-gray-100 line-clamp-1 group-hover:text-blue-400 transition-colors">
            {anime.title ?? "Untitled"}
          </h3>
          
          <div className="flex gap-2 mt-1 text-[10px] font-medium text-gray-400">
            {anime.language?.sub && <span>SUB</span>}
            {anime.language?.sub && anime.language?.dub && <span>•</span>}
            {anime.language?.dub && <span>DUB</span>}
          </div>
        </div>
      </div>
    </div>
  );
}