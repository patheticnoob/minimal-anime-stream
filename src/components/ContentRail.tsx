import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Play, Plus, Info } from "lucide-react";
import { useState } from "react";

type AnimeItem = {
  id?: string;
  image?: string;
  title?: string;
  type?: string;
  dataId?: string;
  language?: {
    sub?: string;
    dub?: string;
  };
};

type ContentRailProps = {
  title: string;
  items: AnimeItem[];
  onItemClick: (item: AnimeItem) => void;
  onSeeAll?: () => void;
};

export function ContentRail({ title, items, onItemClick, onSeeAll }: ContentRailProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (items.length === 0) return null;

  return (
    <div className="mb-8 md:mb-12">
      {/* Rail Header */}
      <div className="flex items-center justify-between mb-4 px-6">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">{title}</h2>
        {onSeeAll && (
          <Button variant="ghost" size="sm" onClick={onSeeAll} className="text-muted-foreground hover:text-foreground">
            See All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Scrollable Rail */}
      <div className="relative">
        <div className="overflow-x-auto scrollbar-hide px-6">
          <div className="flex gap-3 md:gap-4 pb-4">
            {items.map((item, idx) => {
              const subCount = parseInt(item.language?.sub || "0");
              const dubCount = parseInt(item.language?.dub || "0");
              const isHovered = hoveredId === item.dataId;

              return (
                <motion.div
                  key={item.dataId || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex-shrink-0 w-[140px] md:w-[180px] group cursor-pointer"
                  onMouseEnter={() => setHoveredId(item.dataId || null)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => onItemClick(item)}
                >
                  {/* Poster */}
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted mb-2">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title || "Poster"}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        No Image
                      </div>
                    )}

                    {/* Type Badge */}
                    {item.type && (
                      <Badge className="absolute top-2 right-2 bg-black/70 backdrop-blur text-white text-xs">
                        {item.type}
                      </Badge>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 p-3">
                      <Button size="sm" variant="secondary" className="w-full">
                        <Play className="mr-1 h-3 w-3" fill="currentColor" />
                        Play
                      </Button>
                      <div className="flex gap-2 w-full">
                        <Button size="sm" variant="ghost" className="flex-1 text-white hover:bg-white/20">
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="flex-1 text-white hover:bg-white/20">
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Title & Chips */}
                  <h3 className="text-sm font-medium line-clamp-2 mb-1">{item.title || "Untitled"}</h3>
                  <div className="flex flex-wrap gap-1">
                    {subCount >= 1 && (
                      <Badge variant="outline" className="text-xs">
                        Sub • {item.language?.sub}
                      </Badge>
                    )}
                    {dubCount >= 1 && (
                      <Badge variant="outline" className="text-xs">
                        Dub • {item.language?.dub}
                      </Badge>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
