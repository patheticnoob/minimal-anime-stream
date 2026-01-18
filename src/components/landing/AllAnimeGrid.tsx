import { AnimeCard } from "@/components/AnimeCard";
import { AnimeItem } from "@/shared/types";

interface AllAnimeGridProps {
  items: AnimeItem[];
  onOpenAnime: (anime: AnimeItem) => void;
}

export function AllAnimeGrid({ items, onOpenAnime }: AllAnimeGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {items.map((item, idx) => (
        <AnimeCard
          key={item.id ?? idx}
          anime={item}
          onClick={() => onOpenAnime(item)}
          index={idx}
        />
      ))}
    </div>
  );
}
