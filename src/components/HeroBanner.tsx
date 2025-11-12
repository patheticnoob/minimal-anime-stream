import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Info } from "lucide-react";

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

type HeroBannerProps = {
  items: AnimeItem[];
  onPlay: (item: AnimeItem) => void;
  onDetails: (item: AnimeItem) => void;
};

export function HeroBanner({ items, onPlay, onDetails }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (items.length === 0) return null;

  const current = items[currentIndex];
  const subCount = parseInt(current.language?.sub || "0");
  const dubCount = parseInt(current.language?.dub || "0");

  return (
    <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${current.image})`,
            }}
          />
          
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex items-end">
            <div className="container max-w-7xl mx-auto px-6 pb-16 md:pb-20">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="max-w-2xl"
              >
                {current.type && (
                  <Badge className="mb-3 bg-primary/90 backdrop-blur text-primary-foreground">
                    {current.type}
                  </Badge>
                )}
                
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-white drop-shadow-lg">
                  {current.title}
                </h1>

                <div className="flex items-center gap-3 mb-6">
                  {subCount >= 1 && (
                    <Badge variant="outline" className="bg-background/80 backdrop-blur border-white/20 text-white">
                      Sub • {current.language?.sub}
                    </Badge>
                  )}
                  {dubCount >= 1 && (
                    <Badge variant="outline" className="bg-background/80 backdrop-blur border-white/20 text-white">
                      Dub • {current.language?.dub}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    size="lg"
                    onClick={() => onPlay(current)}
                    className="bg-white text-black hover:bg-white/90 font-semibold"
                  >
                    <Play className="mr-2 h-5 w-5" fill="currentColor" />
                    Play
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => onDetails(current)}
                    className="bg-white/20 backdrop-blur border-white/30 text-white hover:bg-white/30"
                  >
                    <Info className="mr-2 h-5 w-5" />
                    Details
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Indicators */}
          <div className="absolute bottom-6 right-6 flex gap-2">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1 rounded-full transition-all ${
                  idx === currentIndex ? "w-8 bg-white" : "w-6 bg-white/40"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
