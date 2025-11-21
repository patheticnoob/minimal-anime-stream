import { motion, AnimatePresence } from "framer-motion";
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
    <AnimatePresence mode="wait">
      <motion.div
        key={anime.id || anime.dataId}
        className="hero-banner group"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background Image */}
        <div className="hero-banner-bg-wrapper">
          {anime.image ? (
            <img
              src={anime.image}
              alt={anime.title ?? "Hero"}
              className="hero-banner-bg"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-900 to-black" />
          )}
        </div>

        {/* Gradient Overlay */}
        <div className="hero-banner-overlay" />

        {/* Content */}
        <div className="hero-banner-content">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-2xl space-y-6"
          >
            {/* Title */}
            <h1 className="hero-banner-title">
              {anime.title ?? "Featured Anime"}
            </h1>

            {/* Meta Data Row */}
            <div className="hero-banner-meta">
              {anime.type && (
                <span className="meta-pill-primary">{anime.type}</span>
              )}
              <span className="meta-dot" />
              <div className="flex gap-2">
                {anime.language?.sub && (
                  <span className="meta-pill">SUB</span>
                )}
                {anime.language?.dub && (
                  <span className="meta-pill">DUB</span>
                )}
              </div>
              <span className="meta-dot" />
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="h-4 w-4 fill-current" />
                <span>4.8</span>
              </div>
              <span className="meta-dot" />
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>2024</span>
              </div>
            </div>

            {/* Description */}
            <p className="hero-banner-description">
              Experience the thrill of this epic saga. Watch the latest episodes in high definition with multiple audio options available. Join the adventure today.
            </p>

            {/* Action Buttons */}
            <div className="hero-banner-actions">
              <Button
                size="lg"
                onClick={onPlay}
                className="btn-hero-primary"
              >
                <div className="btn-icon">
                  <Play className="h-4 w-4 fill-black" />
                </div>
                Watch Now
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={onMoreInfo}
                className="btn-hero-secondary"
              >
                <Info className="mr-2 h-5 w-5" />
                More Info
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="btn-hero-icon"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}