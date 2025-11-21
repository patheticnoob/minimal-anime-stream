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
    <div className="hero-banner group">
      {/* Background Image */}
      {anime.image ? (
        <img
          src={anime.image}
          alt={anime.title ?? "Hero"}
          className="hero-banner-bg"
        />
      ) : (
        <div className="hero-banner-bg bg-gradient-to-br from-blue-900 to-black" />
      )}

      {/* Overlay */}
      <div className="hero-banner-overlay" />

      {/* Content */}
      <div className="hero-banner-content max-w-3xl">
        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-none mb-4 drop-shadow-lg">
          {anime.title ?? "Featured Anime"}
        </h1>

        {/* Meta Data */}
        <div className="flex flex-wrap items-center gap-3 text-sm md:text-base font-medium text-gray-300 mb-6">
          {anime.type && (
            <span className="px-2 py-0.5 rounded bg-white/10 border border-white/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
              {anime.type}
            </span>
          )}
          <div className="flex gap-2">
            {anime.language?.sub && (
              <Badge variant="outline" className="border-gray-500 text-gray-300 bg-transparent h-5 text-[10px]">SUB</Badge>
            )}
            {anime.language?.dub && (
              <Badge variant="outline" className="border-gray-500 text-gray-300 bg-transparent h-5 text-[10px]">DUB</Badge>
            )}
          </div>
          <span className="w-1 h-1 bg-gray-500 rounded-full" />
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span>4.8</span>
          </div>
          <span className="w-1 h-1 bg-gray-500 rounded-full" />
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>2024</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-300/90 text-base md:text-lg line-clamp-3 leading-relaxed mb-8 max-w-xl">
          Experience the thrill of this epic saga. Watch the latest episodes in high definition with multiple audio options available. Join the adventure today.
        </p>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button
            size="lg"
            onClick={onPlay}
            className="h-12 px-8 bg-white text-black hover:bg-gray-200 font-bold text-base rounded-lg transition-transform hover:scale-105"
          >
            <Play className="mr-2 h-5 w-5 fill-black" />
            Watch Now
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={onMoreInfo}
            className="h-12 px-8 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm font-semibold text-base rounded-lg"
          >
            <Info className="mr-2 h-5 w-5" />
            More Info
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="h-12 w-12 p-0 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm rounded-lg"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}