import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InfoModal } from "@/components/InfoModal";
import { Loader2, Search } from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { EpisodeSelector } from "@/components/EpisodeSelector";
import { HeroBanner } from "@/components/HeroBanner";
import { ContentRail } from "@/components/ContentRail";

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

type Episode = {
  id: string;
  title?: string | null;
  number?: number | null;
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
  const fetchMostPopular = useAction(api.hianime.mostPopular);
  const fetchTVShows = useAction(api.hianime.tvShows);
  const fetchMovies = useAction(api.hianime.movies);
  const fetchEpisodes = useAction(api.hianime.episodes);
  const fetchServers = useAction(api.hianime.episodeServers);
  const fetchSources = useAction(api.hianime.episodeSources);

  const [loading, setLoading] = useState(true);
  const [popularItems, setPopularItems] = useState<AnimeItem[]>([]);
  const [topAiringItems, setTopAiringItems] = useState<AnimeItem[]>([]);
  const [tvShowItems, setTVShowItems] = useState<AnimeItem[]>([]);
  const [movieItems, setMovieItems] = useState<AnimeItem[]>([]);
  const [heroItems, setHeroItems] = useState<AnimeItem[]>([]);
  
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AnimeItem | null>(null);
  const [episodes, setEpisodes] = useState<Array<Episode>>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [videoSource, setVideoSource] = useState<string | null>(null);
  const [videoTracks, setVideoTracks] = useState<Array<{ file: string; label: string; kind?: string }>>([]);

  // Load all content rails in parallel
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([
      fetchMostPopular({ page: 1 }),
      fetchTopAiring({ page: 1 }),
      fetchTVShows({ page: 1 }),
      fetchMovies({ page: 1 }),
    ])
      .then(([popular, topAiring, tvShows, movies]) => {
        if (!mounted) return;
        
        const popularResults = (popular as any)?.results || [];
        const topAiringResults = (topAiring as any)?.results || [];
        const tvShowResults = (tvShows as any)?.results || [];
        const movieResults = (movies as any)?.results || [];

        setPopularItems(popularResults);
        setTopAiringItems(topAiringResults);
        setTVShowItems(tvShowResults);
        setMovieItems(movieResults);

        // Create hero items from top popular and airing (dedupe by dataId)
        const combined = [...popularResults.slice(0, 3), ...topAiringResults.slice(0, 2)];
        const uniqueHero = combined.filter(
          (item, index, self) => 
            index === self.findIndex((t) => t.dataId === item.dataId)
        );
        setHeroItems(uniqueHero.slice(0, 5));
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Failed to load content.";
        toast.error(msg);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [fetchMostPopular, fetchTopAiring, fetchTVShows, fetchMovies]);

  const openAnime = async (anime: AnimeItem) => {
    setSelected(anime);
    setSelectedEpisode(null);
    setVideoSource(null);
    setVideoTracks([]);
    
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
      if (msg.includes("nonce") || msg.includes("embed")) {
        toast.error("This episode is temporarily unavailable. Please try another episode.");
      } else {
        toast.error(msg);
      }
    }
  };

  const filteredPopular = query
    ? popularItems.filter((a) => (a.title ?? "").toLowerCase().includes(query.toLowerCase()))
    : popularItems;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-background"
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
              <span className="text-lg font-bold tracking-tight">HiAnime</span>
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
        {loading ? (
          <div className="h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading content...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Hero Banner */}
            {!query && (
              <HeroBanner
                items={heroItems}
                onPlay={openAnime}
                onDetails={openAnime}
              />
            )}

            {/* Content Rails */}
            <div className="py-8">
              {query ? (
                <div className="px-6">
                  <h2 className="text-2xl font-bold mb-4">Search Results</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    {filteredPopular.length} {filteredPopular.length === 1 ? "result" : "results"}
                  </p>
                  <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
                    {filteredPopular.map((item, idx) => (
                      <motion.div
                        key={item.dataId || idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => openAnime(item)}
                        className="cursor-pointer"
                      >
                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted mb-2">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.title || "Poster"}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          )}
                        </div>
                        <h3 className="text-sm font-medium line-clamp-2">{item.title}</h3>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <ContentRail
                    title="Popular Now"
                    items={popularItems}
                    onItemClick={openAnime}
                  />
                  <ContentRail
                    title="Top Airing"
                    items={topAiringItems}
                    onItemClick={openAnime}
                  />
                  <ContentRail
                    title="Series You'll Love"
                    items={tvShowItems}
                    onItemClick={openAnime}
                  />
                  <ContentRail
                    title="Trending Movies"
                    items={movieItems}
                    onItemClick={openAnime}
                  />
                </>
              )}
            </div>
          </>
        )}
      </motion.div>

      {/* Episode Selection Dialog */}
      <InfoModal
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        anime={selected}
        episodes={episodes}
        episodesLoading={episodesLoading}
        onPlayEpisode={playEpisode}
      />

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