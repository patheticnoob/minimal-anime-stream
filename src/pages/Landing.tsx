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
import { Loader2, Search, Play } from "lucide-react";

type TopAiringResult = {
  page: number;
  totalPage: number;
  hasNextPage: boolean;
  results: Array<{
    title?: string;
    image?: string;
    type?: string;
    id?: string; // human readable id/path
    dataId?: string; // numeric data id used for episodes
  }>;
};

type Episode = {
  id: string; // episode id for servers
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
      transition={{ duration: 0.35 }}
      className="min-h-screen flex flex-col"
    >
      {/* Header - Minimal */}
      <header className="w-full flex items-center justify-between px-8 py-8">
        <div className="flex items-center gap-3">
          <img
            src="./logo.svg"
            alt="Logo"
            width={32}
            height={32}
            className="rounded"
          />
          <span className="text-lg font-bold tracking-tight">Minimal Anime Stream</span>
        </div>
        <div className="w-full max-w-md hidden sm:block" />
        <div className="w-full max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search titles"
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-8 pb-16">
        {loading ? (
          <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid gap-8"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              }}
            >
              {filtered.map((item, idx) => (
                <motion.button
                  key={(item.id ?? item.title ?? "item") + idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openAnime(item)}
                  className="text-left"
                >
                  <Card className="border">
                    <CardContent className="p-0">
                      <div className="aspect-[3/4] w-full bg-muted" />
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title ?? "Poster"}
                          className="w-full h-auto aspect-[3/4] object-cover -mt-[calc(100%+1px)]"
                          loading="lazy"
                        />
                      ) : null}
                      <div className="p-4">
                        <div className="text-sm text-muted-foreground mb-1">
                          {item.type ?? "TV"}
                        </div>
                        <div className="font-medium tracking-tight line-clamp-2 min-h-[2.5rem]">
                          {item.title ?? "Untitled"}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.button>
              ))}
            </div>

            {/* Pagination */}
            {data && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <Button
                  variant="outline"
                  disabled={pageLoading || page <= 1}
                  onClick={() => loadPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {data.page} of {data.totalPage}
                </span>
                <Button
                  variant="outline"
                  disabled={pageLoading || !data.hasNextPage}
                  onClick={() => loadPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Watch Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="tracking-tight font-bold">
              {selected?.title ?? "Watch"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Choose an episode, then a server to view available sources.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-8 sm:grid-cols-2">
            {/* Poster */}
            <div className="space-y-4">
              <div className="aspect-[3/4] w-full bg-muted" />
              {selected?.image ? (
                <img
                  src={selected.image}
                  alt={selected.title ?? "Poster"}
                  className="w-full h-auto aspect-[3/4] object-cover -mt-[calc(100%+1px)]"
                />
              ) : null}
            </div>

            {/* Episodes / Servers / Sources */}
            <div className="space-y-6">
              {/* Episodes */}
              <section>
                <div className="mb-2 text-sm text-muted-foreground">
                  Episodes
                </div>
                {episodesLoading ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading episodes...
                  </div>
                ) : episodes.length ? (
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-auto pr-1">
                    {episodes.map((ep) => (
                      <Button
                        key={ep.id}
                        size="sm"
                        variant={selectedEpisode?.id === ep.id ? "default" : "outline"}
                        onClick={() => chooseEpisode(ep)}
                        className="rounded-md"
                      >
                        {ep.number ? `Ep ${ep.number}` : ep.title ?? "Episode"}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No episodes found.
                  </div>
                )}
              </section>

              {/* Servers */}
              <section>
                <div className="mb-2 text-sm text-muted-foreground">
                  Servers
                </div>
                {serversLoading ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading servers...
                  </div>
                ) : servers ? (
                  <div className="flex flex-wrap gap-2">
                    {[...(servers.sub ?? []), ...(servers.dub ?? [])].map((s) => (
                      <Button
                        key={s.id}
                        size="sm"
                        variant="outline"
                        onClick={() => getSources(s.id)}
                      >
                        {s.name}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Select an episode to view servers.
                  </div>
                )}
              </section>

              {/* Sources */}
              <section>
                <div className="mb-2 text-sm text-muted-foreground">
                  Sources
                </div>
                {sourcesLoading ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading sources...
                  </div>
                ) : sources?.sources?.length ? (
                  <div className="flex flex-col gap-2">
                    {sources.sources.map((src, idx) => (
                      <a
                        key={src.file + idx}
                        href={src.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm underline"
                      >
                        {src.type} — Open source
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Select a server to view sources.
                  </div>
                )}
              </section>
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button variant="default" disabled>
              <Play className="h-4 w-4 mr-2" />
              Player coming next
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}