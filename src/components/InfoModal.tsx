import { useEffect } from "react";
import { X } from "lucide-react";
import { BroadcastInfo } from "@/types/broadcast";
import { useGamepad, GAMEPAD_BUTTONS } from "@/hooks/use-gamepad";
import { InfoModalHeader } from "./info-modal/InfoModalHeader";
import { InfoModalBroadcast } from "./info-modal/InfoModalBroadcast";
import { InfoModalEpisodes } from "./info-modal/InfoModalEpisodes";

type Episode = {
  id: string;
  title?: string;
  number?: number;
  currentTime?: number;
  duration?: number;
};

type AnimeDetail = {
  title?: string;
  image?: string;
  type?: string;
  dataId?: string;
  synopsis?: string;
  language?: {
    sub?: string | null;
    dub?: string | null;
  };
};

interface InfoModalProps {
  anime: AnimeDetail | null;
  isOpen: boolean;
  onClose: () => void;
  episodes: Episode[];
  episodesLoading: boolean;
  onPlayEpisode: (episode: Episode) => void;
  isInWatchlist?: boolean;
  onToggleWatchlist?: () => void;
  broadcastInfo?: BroadcastInfo | null;
  broadcastLoading?: boolean;
  audioPreference?: "sub" | "dub";
  onAudioPreferenceChange?: (preference: "sub" | "dub") => void;
}

export function InfoModal({
  anime,
  isOpen,
  onClose,
  episodes,
  episodesLoading,
  onPlayEpisode,
  broadcastInfo,
  broadcastLoading,
  audioPreference = "sub",
  onAudioPreferenceChange,
}: InfoModalProps) {
  const { buttonPressed } = useGamepad();

  // D-pad scrolling for episode list
  useEffect(() => {
    if (!isOpen || buttonPressed === null) return;

    const episodeList = document.querySelector('.custom-scrollbar');
    if (!episodeList) return;

    switch (buttonPressed) {
      case GAMEPAD_BUTTONS.DPAD_UP:
        episodeList.scrollBy({ top: -200, behavior: 'smooth' });
        break;
      case GAMEPAD_BUTTONS.DPAD_DOWN:
        episodeList.scrollBy({ top: 200, behavior: 'smooth' });
        break;
    }
  }, [buttonPressed, isOpen]);

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !anime) return null;

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div 
        className="detail-sheet bg-[#0B0F19] text-white max-w-2xl mx-auto max-h-[90vh] overflow-hidden flex flex-col rounded-t-2xl md:rounded-2xl shadow-2xl border border-white/10" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="detail-drag-handle md:hidden bg-white/20" aria-hidden="true" />
        
        <button 
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white/60 hover:text-white hover:bg-black/80 transition-all backdrop-blur-sm" 
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          {/* Header Section */}
          <InfoModalHeader 
            anime={anime} 
            episodeCount={episodes.length} 
            onPlayFirst={() => episodes.length > 0 && onPlayEpisode(episodes[0])} 
          />

          {/* Broadcast & Audio Section */}
          <InfoModalBroadcast 
            broadcastInfo={broadcastInfo}
            broadcastLoading={broadcastLoading}
            audioPreference={audioPreference}
            onAudioPreferenceChange={onAudioPreferenceChange}
            hasSub={!!anime.language?.sub}
            hasDub={!!anime.language?.dub}
          />

          {/* Episodes Section */}
          <InfoModalEpisodes 
            episodes={episodes}
            episodesLoading={episodesLoading}
            onPlayEpisode={onPlayEpisode}
          />
        </div>
      </div>
    </div>
  );
}