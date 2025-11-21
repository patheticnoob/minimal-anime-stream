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
}

export function ContentRail({ title, items, onItemClick, onViewAll }: ContentRailProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          {title}
        </h2>
        {onViewAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="text-gray-400 hover:text-white"
          >
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory px-1">
          {items.slice(0, 12).map((item, idx) => (
            <div
              key={item.id ?? item.dataId ?? idx}
              className="flex-none w-[140px] md:w-[180px] snap-start"
            >
              <AnimeCard
                anime={item}
                onClick={() => onItemClick(item)}
                index={idx}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
