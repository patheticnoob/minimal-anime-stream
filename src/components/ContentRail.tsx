import { AnimeCard } from "./AnimeCard";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface ContentRailProps {
  title: string;
  items: AnimeItem[];
  onItemClick: (item: AnimeItem) => void;
  onViewAll?: () => void;
  variant?: "portrait" | "landscape";
}

export function ContentRail({ title, items, onItemClick, onViewAll, variant = "portrait" }: ContentRailProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-3 px-4 md:px-0">
        <h2 className="text-lg md:text-xl font-bold text-white tracking-wide uppercase">
          {title}
        </h2>
        {onViewAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="text-[#1977F3] hover:text-[#1977F3] hover:bg-blue-500/10 text-xs font-semibold"
          >
            View All
            <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="relative group">
        {/* Left Fade */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#050814] to-transparent z-10 pointer-events-none md:hidden" />
        
        {/* Right Fade */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#050814] to-transparent z-10 pointer-events-none md:hidden" />

        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory px-4 md:px-0">
          {items.slice(0, 12).map((item, idx) => (
            <div
              key={item.id ?? item.dataId ?? idx}
              className={`flex-none snap-start ${variant === "landscape" ? "w-[220px] md:w-[260px]" : "w-[130px] md:w-[160px]"}`}
            >
              <AnimeCard
                anime={item}
                onClick={() => onItemClick(item)}
                index={idx}
                variant={variant}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}