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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [servers, setServers] = useState<EpisodeServers | null>(null);
  const [serversLoading, setServersLoading] = useState(false);

  const [sources, setSources] = useState<EpisodeSources | null>(null);
  const [sourcesLoading, setSourcesLoading] = useState(false);

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
        const msg =
          err instanceof Error ? err.message : "Failed to load top airing.";
        toast.error(msg);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const msg =
        err instanceof Error ? err.message : "Failed to change page.";
      toast.error(msg);
    } finally {
      setPageLoading(false);
    }
  };

  const openAnime = async (anime: TopAiringResult["results"][number]) => {
    setSelected(anime);
    setSelectedEpisode(null);
    setServers(null);
    setSources(null);
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
      const msg =
        err instanceof Error ? err.message : "Failed to load episodes.";
      toast.error(msg);
    } finally {
      setEpisodesLoading(false);
    }
  };

  const chooseEpisode = async (ep: Episode) => {
    setSelectedEpisode(ep);
    setServers(null);
    setSources(null);
    if (!ep?.id) return;
    setServersLoading(true);
    try {
      const s = (await fetchServers({ episodeId: ep.id })) as EpisodeServers;
      setServers(s);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to load servers.";
      toast.error(msg);
    } finally {
      setServersLoading(false);
    }
  };

  const getSources = async (serverId: string) => {
    setSources(null);
    setSourcesLoading(true);
    try {
      const res = (await fetchSources({ serverId })) as EpisodeSources;
      setSources(res);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to load sources.";
      toast.error(msg);
    } finally {
      setSourcesLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col bg-background"
    >
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-20 items-center justify-between px-8 max-w-7xl mx-auto">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <img
              src="./logo.svg"
              alt="Logo"
              width={40}
              height={40}
              className="rounded"
            />
            <span className="text-xl font-bold tracking-tight">Minimal Anime Stream</span>
          </motion.div>
          
          <motion.div 
            className="w-full max-w-md"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search anime titles..."
                className="pl-9 h-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container px-8 py-12 max-w-7xl mx-auto">
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
              className="mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                {query ? "Search Results" : "Top Airing Anime"}
              </h1>
              <p className="text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "title" : "titles"} found
              </p>
            </motion.div>

            {/* Anime Grid */}
            <motion.div 
              className="grid gap-6 mb-12"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {filtered.map((item, idx) => (
                <motion.button
                  key={(item.id ?? item.title ?? "item") + idx}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openAnime(item)}
                  className="text-left group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx }}
                >
                  <Card className="border overflow-hidden transition-all duration-200 group-hover:border-primary/50">
                    <CardContent className="p-0">
                      <div className="relative aspect-[3/4] w-full bg-muted overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title ?? "Poster"}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            No Image
                          </div>
                        )}
                        {item.type && (
                          <Badge className="absolute top-2 right-2 bg-background/90 backdrop-blur">
                            {item.type}
                          </Badge>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold tracking-tight line-clamp-2 min-h-[3rem] text-sm leading-tight">
                          {item.title ?? "Untitled"}
                        </h3>
                      </div>
                    </CardContent>
                  </Card>
                </motion.button>
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
                <div className="flex items-center gap-2 min-w-[120px] justify-center">
                  <span className="text-sm font-medium">
                    Page {data.page}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    of {data.totalPage}
                  </span>
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

      {/* Watch Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="tracking-tight font-bold text-xl pr-8">
              {selected?.title ?? "Watch"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Select an episode and server to view streaming sources
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-200px)]">
            <div className="grid gap-8 md:grid-cols-[300px_1fr] pr-4">
              {/* Poster */}
              <div className="space-y-4">
                <div className="relative aspect-[3/4] w-full bg-muted rounded-lg overflow-hidden">
                  {selected?.image ? (
                    <img
                      src={selected.image}
                      alt={selected.title ?? "Poster"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>
                {selected?.type && (
                  <Badge variant="secondary" className="w-full justify-center">
                    {selected.type}
                  </Badge>
                )}
              </div>

              {/* Episodes / Servers / Sources */}
              <div className="space-y-6">
                {/* Episodes */}
                <section>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    Episodes
                    {episodes.length > 0 && (
                      <Badge variant="outline">{episodes.length}</Badge>
                    )}
                  </h3>
                  {episodesLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading episodes...
                    </div>
                  ) : episodes.length ? (
                    <ScrollArea className="h-[200px] pr-4">
                      <div className="grid grid-cols-5 gap-2">
                        {episodes.map((ep) => (
                          <Button
                            key={ep.id}
                            size="sm"
                            variant={selectedEpisode?.id === ep.id ? "default" : "outline"}
                            onClick={() => chooseEpisode(ep)}
                            className="h-9"
                          >
                            {ep.number ?? "?"}
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4">
                      No episodes available
                    </p>
                  )}
                </section>

                {/* Servers */}
                {selectedEpisode && (
                  <section>
                    <h3 className="text-sm font-semibold mb-3">
                      Streaming Servers
                    </h3>
                    {serversLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading servers...
                      </div>
                    ) : servers ? (
                      <div className="space-y-3">
                        {servers.sub && servers.sub.length > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Subtitled</p>
                            <div className="flex flex-wrap gap-2">
                              {servers.sub.map((s) => (
                                <Button
                                  key={s.id}
                                  size="sm"
                                  variant="outline"
                                  onClick={() => getSources(s.id)}
                                  className="h-8"
                                >
                                  {s.name}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                        {servers.dub && servers.dub.length > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Dubbed</p>
                            <div className="flex flex-wrap gap-2">
                              {servers.dub.map((s) => (
                                <Button
                                  key={s.id}
                                  size="sm"
                                  variant="outline"
                                  onClick={() => getSources(s.id)}
                                  className="h-8"
                                >
                                  {s.name}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground py-4">
                        Select an episode to view servers
                      </p>
                    )}
                  </section>
                )}

                {/* Sources */}
                {sources && (
                  <section>
                    <h3 className="text-sm font-semibold mb-3">
                      Available Sources
                    </h3>
                    {sourcesLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading sources...
                      </div>
                    ) : sources?.sources?.length ? (
                      <div className="space-y-2">
                        {sources.sources.map((src, idx) => (
                          <a
                            key={src.file + idx}
                            href={src.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <Play className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                              <div>
                                <p className="text-sm font-medium">{src.type}</p>
                                <p className="text-xs text-muted-foreground">Click to open source</p>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground py-4">
                        No sources available
                      </p>
                    )}
                  </section>
                )}
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setSelected(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}