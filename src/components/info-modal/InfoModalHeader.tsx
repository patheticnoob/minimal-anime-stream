import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface InfoModalHeaderProps {
  anime: any;
  episodeCount: number;
  onPlayFirst: () => void;
}

export function InfoModalHeader({ anime, episodeCount, onPlayFirst }: InfoModalHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-6 items-start">
      {/* Poster */}
      <div className="shrink-0 w-[140px] sm:w-[160px] aspect-[2/3] rounded-xl overflow-hidden shadow-2xl relative group mx-auto sm:mx-0 border border-white/10">
        {anime.image ? (
          <img 
            src={anime.image} 
            alt={anime.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full bg-gray-800 animate-pulse" />
        )}
        
        {/* Type Badge Overlay */}
        {anime.type && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-black/60 backdrop-blur-md border-white/10 text-white text-[10px] font-bold px-2 py-0.5">
              {anime.type}
            </Badge>
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="flex-1 flex flex-col gap-4 w-full text-center sm:text-left min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight line-clamp-2">
          {anime.title}
        </h1>
        
        <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-start">
           {anime.language?.sub && (
             <Badge variant="outline" className="border-white/20 text-white/80 bg-white/5 hover:bg-white/10 px-3 py-1">SUB</Badge>
           )}
           {anime.language?.dub && (
             <Badge variant="outline" className="border-white/20 text-white/80 bg-white/5 hover:bg-white/10 px-3 py-1">DUB</Badge>
           )}
           {episodeCount > 0 && (
             <span className="text-xs font-bold text-[#ff4d4f] tracking-wider ml-2 uppercase">{episodeCount} Episodes</span>
           )}
        </div>
        
        {/* Synopsis Preview (Optional, small) */}
        {anime.synopsis && (
          <p className="text-sm text-white/60 line-clamp-3 leading-relaxed hidden sm:block">
            {anime.synopsis}
          </p>
        )}
        
        <div className="mt-auto pt-2">
          <Button 
            onClick={onPlayFirst}
            disabled={episodeCount === 0}
            className="w-full sm:w-auto min-w-[200px] bg-[#ff4d4f] hover:bg-[#ff4d4f]/90 text-white rounded-full h-12 font-bold shadow-lg shadow-[#ff4d4f]/20 transition-all hover:scale-105 active:scale-95"
          >
             <Play className="fill-white mr-2 h-5 w-5" /> START WATCHING
          </Button>
        </div>
      </div>
    </div>
  );
}
