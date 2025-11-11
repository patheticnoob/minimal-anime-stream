import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";

type AnimeCardProps = {
  anime: {
    title?: string;
    image?: string;
    type?: string;
    id?: string;
    dataId?: string;
  };
  index: number;
  onClick: () => void;
};

export function AnimeCard({ anime, index, onClick }: AnimeCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="text-left group relative cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
    >
      <Card className="border-0 overflow-hidden bg-transparent shadow-none">
        <CardContent className="p-0">
          <div className="relative aspect-[2/3] w-full bg-muted overflow-hidden rounded-md">
            {anime.image ? (
              <img
                src={anime.image}
                alt={anime.title ?? "Poster"}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Play className="h-12 w-12 text-white" fill="white" />
            </div>
            {anime.type && (
              <Badge className="absolute top-2 right-2 bg-primary/90 backdrop-blur text-primary-foreground">
                {anime.type}
              </Badge>
            )}
          </div>
          <div className="mt-2">
            <h3 className="font-medium tracking-tight line-clamp-2 text-sm">
              {anime.title ?? "Untitled"}
            </h3>
          </div>
        </CardContent>
      </Card>
    </motion.button>
  );
}