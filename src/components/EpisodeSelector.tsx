import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

type Episode = {
  id: string;
  title?: string;
  number?: number;
};

type EpisodeSelectorProps = {
  episodes: Episode[];
  loading: boolean;
  selectedEpisode: Episode | null;
  onSelectEpisode: (episode: Episode) => void;
};

export function EpisodeSelector({
  episodes,
  loading,
  selectedEpisode,
  onSelectEpisode,
}: EpisodeSelectorProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading episodes...
      </div>
    );
  }

  if (episodes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No episodes available
      </p>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        Episodes
        <Badge variant="outline">{episodes.length}</Badge>
      </h3>
      <ScrollArea className="h-[300px] pr-4">
        <div className="grid grid-cols-6 gap-2">
          {episodes.map((ep) => (
            <Button
              key={ep.id}
              size="sm"
              variant={selectedEpisode?.id === ep.id ? "default" : "outline"}
              onClick={() => onSelectEpisode(ep)}
              className="h-10"
            >
              {ep.number ?? "?"}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
