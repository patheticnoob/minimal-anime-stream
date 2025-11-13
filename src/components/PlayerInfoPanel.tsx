import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Play, Share2, Plus } from "lucide-react";

type Ep = { id: string; title?: string; number?: number };

interface PlayerInfoPanelProps {
  title: string;
  image?: string;
  description?: string;
  type?: string;
  language?: { sub?: string | null; dub?: string | null };
  episodes?: Array<Ep>;
  currentEpisodeNumber?: number;
  onSelectEpisode?: (ep: Ep) => void;
  onClose?: () => void;
}

export function PlayerInfoPanel({
  title,
  image,
  description,
  type,
  language,
  episodes = [],
  currentEpisodeNumber,
  onSelectEpisode,
  onClose,
}: PlayerInfoPanelProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          {image ? (
            <img src={image} alt={title} className="h-10 w-16 rounded object-cover" />
          ) : (
            <div className="h-10 w-16 rounded bg-white/10" />
          )}
          <div className="min-w-0">
            <div className="text-white font-semibold truncate">{title}</div>
            <div className="flex gap-1 mt-1">
              {type && <Badge className="bg-blue-600/90 border-0"> {type} </Badge>}
              {language?.sub && <Badge className="bg-gray-800/90 border-0">SUB</Badge>}
              {language?.dub && <Badge className="bg-gray-800/90 border-0">DUB</Badge>}
            </div>
          </div>
        </div>
        <Button size="icon" variant="ghost" className="text-white hover:bg-white/10" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {description && (
            <p className="text-sm text-white/80 leading-relaxed line-clamp-4">{description}</p>
          )}

          {/* Quick actions */}
          <div className="flex gap-2">
            <Button size="sm" className="bg-white text-black hover:bg-gray-200">
              <Play className="h-4 w-4 mr-2" /> Continue
            </Button>
            <Button size="sm" variant="outline" className="bg-white/10 border-white/10 text-white hover:bg-white/15">
              <Plus className="h-4 w-4 mr-2" /> Watchlist
            </Button>
            <Button size="sm" variant="outline" className="bg-white/10 border-white/10 text-white hover:bg-white/15">
              <Share2 className="h-4 w-4 mr-2" /> Share
            </Button>
          </div>

          {/* Episodes */}
          {episodes.length > 0 && (
            <div>
              <div className="text-sm text-white/70 mb-2">Episodes</div>
              <div className="grid grid-cols-5 gap-2">
                {episodes.map((ep) => {
                  const isActive = ep.number === currentEpisodeNumber;
                  return (
                    <motion.button
                      key={ep.id}
                      onClick={() => onSelectEpisode?.(ep)}
                      className={`px-2 py-1.5 rounded border text-xs ${
                        isActive
                          ? "bg-white text-black border-white"
                          : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                      }`}
                      whileTap={{ scale: 0.98 }}
                    >
                      {ep.number ?? "?"}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
