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
    <div className="hero-banner group relative w-full h-[65vh] min-h-[500px] overflow-hidden">
      {/* Dark Background Base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e1a] via-[#050814] to-black" />

      {/* Portrait Image - Right Side with Shadow */}
      {anime.image && (
        <div className="absolute right-0 top-0 bottom-0 w-[55%] md:w-[50%]">
          <div className="relative h-full flex items-center justify-end pr-8 md:pr-16">
            <div className="relative h-[85%] aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={anime.image}
                alt={anime.title ?? "Hero"}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Subtle inner shadow for depth */}
              <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.4)]" />
            </div>
            {/* Soft glow behind poster */}
            <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-transparent to-transparent blur-3xl" />
          </div>
          {/* Left fade gradient */}
          <div className="absolute left-0 top-0 bottom-0 w-48 bg-gradient-to-r from-[#050814] to-transparent" />
        </div>
      )}

      {/* Content - Left Side */}
      <div className="hero-banner-content absolute bottom-0 left-0 w-full md:w-[55%] p-6 md:p-12 flex flex-col justify-end items-start z-10">
        {/* Meta Data */}
        <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-gray-300 mb-3">
          {anime.type && (
            <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
              {anime.type}
            </span>
          )}
          <div className="flex gap-2">
            {anime.language?.sub && (
              <Badge variant="secondary" className="bg-[#1E88E5] text-white hover:bg-[#1E88E5]/90 border-0 h-5 text-[10px] px-1.5 rounded-sm">SUB</Badge>
            )}
            {anime.language?.dub && (
              <Badge variant="secondary" className="bg-[#1E88E5] text-white hover:bg-[#1E88E5]/90 border-0 h-5 text-[10px] px-1.5 rounded-sm">DUB</Badge>
            )}
          </div>
          <span className="w-1 h-1 bg-gray-500 rounded-full" />
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="text-white">4.8</span>
          </div>
          <span className="w-1 h-1 bg-gray-500 rounded-full" />
          <div className="flex items-center gap-1 text-gray-300">
            <Calendar className="h-3.5 w-3.5" />
            <span>2024</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-none mb-6 drop-shadow-xl max-w-xl">
          {anime.title ?? "Featured Anime"}
        </h1>

        {/* Description */}
        <p className="hidden md:block text-gray-300/90 text-lg line-clamp-2 leading-relaxed mb-8 max-w-xl">
          Experience the thrill of this epic saga. Watch the latest episodes in high definition with multiple audio options available. Join the adventure today.
        </p>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <Button
            size="lg"
            onClick={onPlay}
            className="flex-1 md:flex-none h-12 px-8 bg-gradient-to-r from-[#673AB7] to-[#512DA8] hover:from-[#5E35B1] hover:to-[#4527A0] text-white font-bold text-base rounded-lg shadow-lg shadow-purple-900/20 transition-all hover:scale-105 active:scale-95"
          >
            <Play className="mr-2 h-5 w-5 fill-white" />
            Watch Now
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            onClick={onMoreInfo}
            className="flex-1 md:flex-none h-12 px-8 bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/50 font-semibold text-base rounded-lg backdrop-blur-sm transition-all"
          >
            <Info className="mr-2 h-5 w-5" />
            More Info
          </Button>
          
          <Button
            size="lg"
            variant="secondary"
            className="h-12 w-12 p-0 bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-sm rounded-lg transition-all hover:scale-105"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}