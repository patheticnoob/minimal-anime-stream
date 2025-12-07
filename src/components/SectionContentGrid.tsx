import { AnimeCard } from "./AnimeCard";

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

interface SectionContentGridProps {
  title: string;
  items: AnimeItem[];
  onItemClick: (item: AnimeItem) => void;
}

export function SectionContentGrid({ title, items, onItemClick }: SectionContentGridProps) {
  return (
    <div className="mt-8">
      <h2 className="text-3xl font-bold mb-6 tracking-tight capitalize">
        {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {items.map((item, idx) => (
          <AnimeCard 
            key={item.id ?? idx} 
            anime={item} 
            onClick={() => onItemClick(item)} 
            index={idx}
          />
        ))}
      </div>
    </div>
  );
}
