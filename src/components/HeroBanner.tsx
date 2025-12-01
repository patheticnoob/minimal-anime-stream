import { Button } from "@/components/ui/button";
import { Play, Plus, Info, Star, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { memo } from "react";
import type { CSSProperties } from "react";

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

type HeroBannerStyle = CSSProperties;

function HeroBannerBase({ anime, onPlay, onMoreInfo }: HeroBannerProps) {
  const heroArtStyle: HeroBannerStyle | undefined = anime.image
    ? { backgroundImage: `url(${anime.image})` }
    : undefined;

  const availableLanguages = [
    anime.language?.sub ? "Sub" : null,
    anime.language?.dub ? "Dub" : null,
  ].filter(Boolean) as string[];

  const heroStatusLabel =
    anime.type?.toLowerCase().includes("movie") ? "Premiere Spotlight" : "Now Streaming Weekly";

  const stats = [
    { label: "Format", value: anime.type ?? "Series" },
    { label: "Audio", value: availableLanguages.length ? availableLanguages.join(" / ") : "Multi Audio" },
    { label: "Rating", value: "4.8 / 5" },
  ];

  const preferredServers = ["HD-1", "HD-2", "HD-3"];

  return (
    <motion.section
      className="hero-banner group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="hero-banner-inner">
        <motion.div
          className="hero-banner-copy"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <div className="hero-banner-pill">{heroStatusLabel}</div>

          <div className="hero-banner-meta-row">
            {anime.type && <span className="hero-banner-type-chip">{anime.type}</span>}

            <div className="hero-banner-language-chip">
              {availableLanguages.length ? availableLanguages.join(" • ") : "Global Audio"}
            </div>

            <div className="hero-banner-meta-divider" />

            <div className="hero-banner-meta-info">
              <Star className="h-3.5 w-3.5 fill-current text-yellow-500" />
              <span>4.8</span>
            </div>

            <div className="hero-banner-meta-info">
              <Calendar className="h-3.5 w-3.5" />
              <span>2024</span>
            </div>
          </div>

          <h1 className="hero-banner-title">
            {anime.title ?? "Featured Anime"}
          </h1>

          <p className="hero-banner-description">
            Experience the thrill of this epic saga. Watch the latest episodes in high definition with multiple audio
            options available. Join the adventure today.
          </p>

          <div className="hero-banner-stats-grid">
            {stats.map((stat) => (
              <div key={stat.label} className="hero-banner-stat-card">
                <span className="hero-banner-stat-label">{stat.label}</span>
                <span className="hero-banner-stat-value">{stat.value}</span>
              </div>
            ))}
          </div>

          <div className="hero-banner-server-row">
            <span className="hero-banner-server-label">Servers</span>
            <div className="hero-banner-server-chips">
              {preferredServers.map((server) => (
                <span key={server} className="hero-banner-server-chip">
                  {server}
                </span>
              ))}
            </div>
          </div>

          <div className="hero-banner-actions">
            <Button
              size="lg"
              onClick={onPlay}
              className="hero-banner-primary-btn"
            >
              <Play className="mr-2 h-5 w-5 fill-white" />
              Watch Now
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={onMoreInfo}
              className="hero-banner-secondary-btn"
            >
              <Info className="mr-2 h-5 w-5" />
              More Info
            </Button>

            <Button
              size="lg"
              variant="secondary"
              className="hero-banner-icon-btn"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>

          <div className="hero-banner-footnote">
            <span className="hero-banner-footnote-dot" />
            Instant playback powered by adaptive HLS streams.
          </div>
        </motion.div>

        {anime.image && (
          <motion.div
            className="hero-banner-art group"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <img
              src={anime.image}
              alt={anime.title || "Anime poster"}
              className="w-full h-full object-cover"
            />
            <div className="hero-banner-art-overlay" aria-hidden="true">
              <div className="hero-banner-art-play">
                <Play className="h-6 w-6 fill-current" />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}

const areHeroBannerPropsEqual = (prev: HeroBannerProps, next: HeroBannerProps) => {
  const prevAnime = prev.anime;
  const nextAnime = next.anime;

  const sameAnime =
    prevAnime?.id === nextAnime?.id &&
    prevAnime?.dataId === nextAnime?.dataId &&
    prevAnime?.title === nextAnime?.title &&
    prevAnime?.image === nextAnime?.image &&
    prevAnime?.type === nextAnime?.type &&
    prevAnime?.language?.sub === nextAnime?.language?.sub &&
    prevAnime?.language?.dub === nextAnime?.language?.dub;

  return sameAnime && prev.onPlay === next.onPlay && prev.onMoreInfo === next.onMoreInfo;
};

export const HeroBanner = memo(HeroBannerBase, areHeroBannerPropsEqual);