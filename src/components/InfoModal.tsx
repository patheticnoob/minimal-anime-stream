import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp, Loader2, Play, Plus, Share2, X } from "lucide-react";
import { toast } from "sonner";

type AnimeItem = {
  id?: string;
  image?: string;
  cover?: string | null; // optional wide backdrop
  title?: string;
  type?: string | null;
  dataId?: string;
  year?: number | null;
  status?: string | null;
  genres?: string[] | null;
  rating?: number | null; // 0-5
  language?: { sub?: string | null; dub?: string | null } | null;
  synopsis?: string | null;
};

type Episode = {
  id: string;
  title?: string | null;
  number?: number | null;
  thumbnail?: string | null;
  duration?: string | null;
  releaseDate?: string | null;
};

type InfoModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anime: AnimeItem | null;
  episodes: Episode[];
  episodesLoading: boolean;
  onPlayEpisode: (ep: Episode) => void;
};

export function InfoModal({
  open,
  onOpenChange,
  anime,
  episodes,
  episodesLoading,
  onPlayEpisode,
}: InfoModalProps) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"oldest" | "newest">("oldest");
  const [expanded, setExpanded] = useState(false);
  const [watchlisted, setWatchlisted] = useState(false);

  const subCount = Number(anime?.language?.sub || 0);
  const dubCount = Number(anime?.language?.dub || 0);
  const hasSub = subCount >= 1;
  const hasDub = dubCount >= 1;

  const bgImage = anime?.cover || anime?.image || "";
  const poster = anime?.image || "";
  const title = anime?.title || "Untitled";
  const type = anime?.type || undefined;
  const year = anime?.year || undefined;
  const status = anime?.status || undefined;
  const genres = anime?.genres && anime.genres.length ? anime.genres : undefined;
  const rating = typeof anime?.rating === "number" ? anime?.rating : undefined;
  const synopsis = anime?.synopsis || "No description available.";

  const filteredSortedEpisodes = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? episodes.filter((e) => {
          const t = (e.title || "").toLowerCase();
          const n = String(e.number ?? "");
          return t.includes(q) || n.includes(q);
        })
      : episodes;

    const sorted = [...filtered].sort((a, b) => {
      const na = a.number ?? 0;
      const nb = b.number ?? 0;
      return sort === "oldest" ? na - nb : nb - na;
    });
    return sorted;
  }, [episodes, query, sort]);

  const playResume = () => {
    if (!episodes?.length) {
      toast("No episodes available for this title.");
      return;
    }
    const chosen =
      sort === "oldest"
        ? filteredSortedEpisodes[0] || episodes[0]
        : filteredSortedEpisodes[0] || episodes[episodes.length - 1];
    if (chosen) onPlayEpisode(chosen);
  };

  const toggleWatchlist = () => {
    setWatchlisted((w) => !w);
    toast(watchlisted ? "Removed from Watchlist" : "Added to Watchlist");
  };

  const shareTitle = async () => {
    try {
      const shareText = `Check this out: ${title}`;
      if (navigator.share) {
        await navigator.share({ title, text: shareText, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
        toast("Link copied to clipboard");
      }
    } catch {
      toast.error("Unable to share right now.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-5xl max-w-[95vw] p-0 overflow-hidden max-h-[90vh] sm:max-h-[85vh]"
        aria-label={`${title} info`}
      >
        <div className="relative">
          {/* Media Header */}
          <div className="relative w-full aspect-video">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: bgImage ? `url(${bgImage})` : undefined }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
            {/* Close */}
            <button
              aria-label="Close"
              onClick={() => onOpenChange(false)}
              className="absolute top-3 right-3 rounded-md bg-black/50 hover:bg-black/60 transition-colors p-2"
            >
              <X className="h-5 w-5 text-white" />
            </button>

            {/* Foreground Content */}
            <div className="absolute inset-0 flex items-end">
              <div className="w-full px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="grid grid-cols-12 gap-4 sm:gap-6 items-end">
                  {/* Poster */}
                  <div className="col-span-4 sm:col-span-3 md:col-span-3">
                    <div className="relative aspect-[2/3] rounded-md overflow-hidden border border-white/10 bg-black/20">
                      {poster ? (
                        <img
                          src={poster}
                          alt={`${title} poster`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/70 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="col-span-8 sm:col-span-9 md:col-span-9">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {type && (
                        <Badge className="bg-white/90 text-black"> {type} </Badge>
                      )}
                      {year && (
                        <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                          {year}
                        </Badge>
                      )}
                      {status && (
                        <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                          {status}
                        </Badge>
                      )}
                      {hasSub && (
                        <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                          Sub • {subCount}
                        </Badge>
                      )}
                      {hasDub && (
                        <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                          Dub • {dubCount}
                        </Badge>
                      )}
                    </div>

                    <DialogHeader className="p-0">
                      <DialogTitle className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow">
                        {title}
                      </DialogTitle>
                    </DialogHeader>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-white/80">
                      {genres && (
                        <span className="text-sm">{genres.join(", ")}</span>
                      )}
                      {rating !== undefined && (
                        <>
                          {genres && <span className="opacity-50">•</span>}
                          <span className="text-sm">Rating {rating.toFixed(1)}/5</span>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        className="bg-white text-black hover:bg-white/90"
                        onClick={playResume}
                      >
                        <Play className="mr-2 h-4 w-4" fill="currentColor" />
                        Play
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={toggleWatchlist}
                        className="bg-white/10 backdrop-blur border-white/30 text-white hover:bg-white/20"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {watchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={shareTitle}
                        className="bg-white/10 backdrop-blur border-white/30 text-white hover:bg-white/20"
                        aria-label="Share"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-6 overflow-y-auto max-h-[50vh] sm:max-h-[48vh]">
            {/* Synopsis */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Synopsis</h3>
              <div className="text-sm text-muted-foreground">
                <p className={`${expanded ? "" : "line-clamp-4"}`}>{synopsis}</p>
                <button
                  className="mt-2 text-xs underline text-primary"
                  onClick={() => setExpanded((e) => !e)}
                  aria-expanded={expanded}
                >
                  {expanded ? (
                    <span className="inline-flex items-center gap-1">
                      Show less <ChevronUp className="h-3 w-3" />
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      More <ChevronDown className="h-3 w-3" />
                    </span>
                  )}
                </button>
              </div>
            </div>

            <Separator />

            {/* Episodes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">Episodes</h3>
                  <Badge variant="outline">{episodes.length}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:block">
                    <Input
                      placeholder="Search episodes..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="h-8 w-[220px]"
                    />
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={sort === "oldest" ? "default" : "outline"}
                      onClick={() => setSort("oldest")}
                    >
                      Oldest
                    </Button>
                    <Button
                      size="sm"
                      variant={sort === "newest" ? "default" : "outline"}
                      onClick={() => setSort("newest")}
                    >
                      Newest
                    </Button>
                  </div>
                </div>
              </div>

              <div className="sm:hidden mb-3">
                <Input
                  placeholder="Search episodes..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-9"
                />
              </div>

              {episodesLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading episodes...
                </div>
              ) : filteredSortedEpisodes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Episodes unavailable for this title.</p>
              ) : (
                <div className="space-y-2">
                  {filteredSortedEpisodes.map((ep) => {
                    const epNum = ep.number ?? undefined;
                    const epTitle = ep.title || `Episode ${epNum ?? "?"}`;
                    return (
                      <div
                        key={ep.id}
                        className="group grid grid-cols-12 gap-3 rounded-md border border-border/60 p-2 hover:bg-white/5 transition"
                      >
                        {/* Thumbnail */}
                        <div className="col-span-4 sm:col-span-2">
                          <div className="relative w-full overflow-hidden rounded-sm aspect-video bg-muted">
                            {/* Fallback thumb with ep number */}
                            <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                              {ep.thumbnail ? (
                                <img
                                  src={ep.thumbnail}
                                  alt={`Episode ${epNum ?? "?"} thumbnail`}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <span className="text-sm">Ep {epNum ?? "?"}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="col-span-8 sm:col-span-8 flex flex-col justify-center">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              Ep {epNum ?? "?"}
                            </span>
                            <span className="text-sm">•</span>
                            <span className="text-sm font-medium line-clamp-1">
                              {epTitle}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            {hasSub && (
                              <Badge variant="outline" className="text-xs">
                                Sub
                              </Badge>
                            )}
                            {hasDub && (
                              <Badge variant="outline" className="text-xs">
                                Dub
                              </Badge>
                            )}
                            {ep.duration && (
                              <span className="text-xs text-muted-foreground">
                                • {ep.duration}
                              </span>
                            )}
                            {ep.releaseDate && (
                              <span className="text-xs text-muted-foreground">
                                • {ep.releaseDate}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="col-span-12 sm:col-span-2 flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            className="h-8"
                            onClick={() => onPlayEpisode(ep)}
                          >
                            <Play className="mr-1 h-3 w-3" fill="currentColor" />
                            Play
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
