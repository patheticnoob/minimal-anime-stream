import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimeCard } from "@/components/AnimeCard";
import { VideoPlayer } from "@/components/VideoPlayer";
import { EpisodeSelector } from "@/components/EpisodeSelector";

type TopAiringResult = {
  page: number;
  totalPage: number;
  hasNextPage: boolean;
  results: Array<{
    title?: string;
    image?: string;
    type?: string;
    id?: string;
    dataId?: string;
  }>;
};

type Episode = {
  id: string;
  title?: string;
  number?: number;
};

type EpisodeServers = {
  sub: Array<{ id: string; name: string }>;
  dub: Array<{ id: string; name: string }>;
};

type EpisodeSources = {
  sources: Array<{ file: string; type: string }>;
  tracks?: Array<{ file: string; label: string; kind?: string }>;
};

export default function Landing() {
  const fetchTopAiring = useAction(api.hianime.topAiring);
  const fetchEpisodes = useAction(api.hianime.episodes);
  const fetchServers = useAction(api.hianime.episodeServers);
  const fetchSources = useAction(api.hianime.episodeSources);

  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [data, setData] = useState<TopAiringResult | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<TopAiringResult["results"][number] | null>(null);
  const [episodes, setEpisodes] = useState<Array<Episode>>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [videoSource, setVideoSource] = useState<string | null>(null);
  const [videoTracks, setVideoTracks] = useState<Array<{ file: string; label: string; kind?: string }>>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchTopAiring({ page: 1 })
      .then((res) => {
        if (!mounted) return;
        setData(res as TopAiringResult);
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Failed to load top airing.";
        toast.error(msg);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [fetchTopAiring]);

  const filtered = useMemo(() => {
    if (!data?.results) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data.results;
    return data.results.filter((a) =>
      (a.title ?? "").toLowerCase().includes(q),
    );
  }, [data, query]);

  const loadPage = async (nextPage: number) => {
    if (nextPage < 1) return;
    setPageLoading(true);
    try {
      const res = (await fetchTopAiring({ page: nextPage })) as TopAiringResult;
      setData(res);
      setPage(nextPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to change page.";
      toast.error(msg);
    } finally {
      setPageLoading(false);
    }
  };

  const openAnime = async (anime: TopAiringResult["results"][number]) => {
    setSelected(anime);
    setSelectedEpisode(null);
    setVideoSource(null);
    if (!anime?.dataId) {
      toast("This title has no episodes available.");
      return;
    }
    setEpisodes([]);
    setEpisodesLoading(true);
    try {
      const eps = (await fetchEpisodes({ dataId: anime.dataId })) as Episode[];
      setEpisodes(eps);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load episodes.";
      toast.error(msg);
    } finally {
      setEpisodesLoading(false);
    }
  };

  const playEpisode = async (ep: Episode) => {
    setSelectedEpisode(ep);
    if (!ep?.id) return;

    const loadingToast = toast.loading("Loading video...");
    
    try {
      const servers = (await fetchServers({ episodeId: ep.id })) as EpisodeServers;
      
      // Find HD-2 server (case-insensitive search in both sub and dub)
      const allServers = [...(servers.sub || []), ...(servers.dub || [])];
      const hd2Server = allServers.find(
        (s) => s.name && s.name.toLowerCase().includes("hd-2")
      );
      
      if (!hd2Server) {
        toast.dismiss(loadingToast);
        toast.error("HD-2 server not available for this episode.");
        return;
      }

      const sources = (await fetchSources({ serverId: hd2Server.id })) as EpisodeSources;
      
      if (sources?.sources?.length) {
        toast.dismiss(loadingToast);
        // Set video source and tracks (tracks can be empty array if not available)
        setVideoSource(sources.sources[0].file);
        setVideoTracks(sources.tracks || []);
        setSelected(null);
      } else {
        toast.dismiss(loadingToast);
        toast.error("No video sources available for this episode.");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      const msg = err instanceof Error ? err.message : "Failed to load video.";
      // Provide more helpful error message
      if (msg.includes("nonce") || msg.includes("embed")) {
        toast.error("This episode is temporarily unavailable. Please try another episode.");
      } else {
        toast.error(msg);
      }
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen flex flex-col bg-background"
      >
        {/* Header */}
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between px-6 max-w-7xl mx-auto">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <img
                src="./logo.svg"
                alt="Logo"
                width={32}
                height={32}
                className="rounded"
              />
              <span className="text-lg font-bold tracking-tight">Anime Stream</span>
            </motion.div>
            
            <motion.div 
              className="w-full max-w-sm"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search anime..."
                  className="pl-9 h-9 bg-muted/50"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </motion.div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container px-6 py-8 max-w-7xl mx-auto">
          {loading ? (
            <div className="h-[60vh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading anime...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Page Info */}
              <motion.div 
                className="mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-2xl font-bold tracking-tight mb-1">
                  {query ? "Search Results" : "Top Airing"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {filtered.length} {filtered.length === 1 ? "title" : "titles"}
                </p>
              </motion.div>

              {/* Anime Grid */}
              <motion.div 
                className="grid gap-4 mb-8"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {filtered.map((item, idx) => (
                  <AnimeCard
                    key={(item.id ?? item.title ?? "item") + idx}
                    anime={item}
                    index={idx}
                    onClick={() => openAnime(item)}
                  />
                ))}
              </motion.div>

              {/* Pagination */}
              {data && (
                <motion.div 
                  className="flex items-center justify-center gap-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={pageLoading || page <= 1}
                    onClick={() => loadPage(page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2 min-w-[100px] justify-center">
                    <span className="text-sm font-medium">Page {data.page}</span>
                    <span className="text-sm text-muted-foreground">of {data.totalPage}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={pageLoading || !data.hasNextPage}
                    onClick={() => loadPage(page + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </main>

        {/* Episode Selection Dialog */}
        <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold tracking-tight pr-8">
                {selected?.title ?? "Select Episode"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <EpisodeSelector
                episodes={episodes}
                loading={episodesLoading}
                selectedEpisode={selectedEpisode}
                onSelectEpisode={playEpisode}
              />
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Video Player */}
      {videoSource && (
        <VideoPlayer
          source={videoSource}
          title={`${selected?.title ?? "Anime"} - Episode ${selectedEpisode?.number ?? "?"}`}
          tracks={videoTracks}
          onClose={() => {
            setVideoSource(null);
            setVideoTracks([]);
          }}
        />
      )}
    </>
  );
}