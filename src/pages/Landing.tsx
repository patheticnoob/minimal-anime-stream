import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { HeroBanner } from "@/components/HeroBanner";
import { ContentRail } from "@/components/ContentRail";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VideoPlayer } from "@/components/VideoPlayer";

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

type Episode = {
  id: string;
  title?: string;
  number?: number;
};

export default function Landing() {
  const fetchTopAiring = useAction(api.hianime.topAiring);
  const fetchMostPopular = useAction(api.hianime.mostPopular);
  const fetchMovies = useAction(api.hianime.movies);
  const fetchTVShows = useAction(api.hianime.tvShows);
  const fetchEpisodes = useAction(api.hianime.episodes);
  const fetchServers = useAction(api.hianime.episodeServers);
  const fetchSources = useAction(api.hianime.episodeSources);

  const [loading, setLoading] = useState(true);
  const [popularItems, setPopularItems] = useState<AnimeItem[]>([]);
  const [airingItems, setAiringItems] = useState<AnimeItem[]>([]);
  const [movieItems, setMovieItems] = useState<AnimeItem[]>([]);
  const [tvShowItems, setTVShowItems] = useState<AnimeItem[]>([]);
  const [heroAnime, setHeroAnime] = useState<AnimeItem | null>(null);
  
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState("home");
  const [selected, setSelected] = useState<AnimeItem | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [videoSource, setVideoSource] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [videoTracks, setVideoTracks] = useState<Array<{ file: string; label: string; kind?: string }>>([]);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState<number | null>(null);

  // Load all content on mount
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([
      fetchMostPopular({ page: 1 }),
      fetchTopAiring({ page: 1 }),
      fetchMovies({ page: 1 }),
      fetchTVShows({ page: 1 }),
    ])
      .then(([popular, airing, movies, tvShows]) => {
        if (!mounted) return;
        
        const popularData = popular as { results: AnimeItem[] };
        const airingData = airing as { results: AnimeItem[] };
        const moviesData = movies as { results: AnimeItem[] };
        const tvShowsData = tvShows as { results: AnimeItem[] };

        setPopularItems(popularData.results || []);
        setAiringItems(airingData.results || []);
        setMovieItems(moviesData.results || []);
        setTVShowItems(tvShowsData.results || []);

        // Set hero to first popular item
        if (popularData.results && popularData.results.length > 0) {
          setHeroAnime(popularData.results[0]);
        }
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Failed to load content";
        toast.error(msg);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [fetchMostPopular, fetchTopAiring, fetchMovies, fetchTVShows]);

  const openAnime = async (anime: AnimeItem) => {
    setSelected(anime);
    if (!anime?.dataId) {
      toast("This title has no episodes available.");
      return;
    }
    setEpisodes([]);
    setEpisodesLoading(true);
    try {
      const eps = (await fetchEpisodes({ dataId: anime.dataId })) as Episode[];
      setEpisodes(eps);
      setCurrentEpisodeIndex(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load episodes.";
      toast.error(msg);
    } finally {
      setEpisodesLoading(false);
    }
  };

  const playEpisode = async (episode: Episode) => {
    toast("Loading video...");
    try {
      const servers = await fetchServers({ episodeId: episode.id });
      const serverData = servers as { sub: Array<{ id: string; name: string }>; dub: Array<{ id: string; name: string }> };
      
      // Try to get HD-2 sub server first
      const subServers = serverData.sub || [];
      const preferredServer = subServers.find(s => s.name === "HD-2") || subServers[0];
      
      if (!preferredServer) {
        toast.error("No streaming servers available");
        return;
      }

      const sources = await fetchSources({ serverId: preferredServer.id });
      const sourcesData = sources as { 
        sources: Array<{ file: string; type: string }>;
        tracks?: Array<{ file: string; label: string; kind?: string }>;
      };
      
      if (sourcesData.sources && sourcesData.sources.length > 0) {
        const m3u8Source = sourcesData.sources.find(s => s.file.includes(".m3u8"));
        const originalUrl = m3u8Source?.file || sourcesData.sources[0].file;

        // Build Convex HTTP endpoint base (.site), robust for various env formats
        const raw = import.meta.env.VITE_CONVEX_URL as string;
        let base = raw;
        try {
          const u = new URL(raw);
          const hostname = u.hostname.replace(".convex.cloud", ".convex.site");
          base = `${u.protocol}//${hostname}`;
        } catch {
          base = raw.replace("convex.cloud", "convex.site");
        }
        base = base.replace("/.well-known/convex.json", "").replace(/\/$/, "");

        // Proxy the m3u8 URL through Convex HTTP endpoint
        const proxiedUrl = `${base}/proxy?url=${encodeURIComponent(originalUrl)}`;

        // Proxy subtitle tracks as well (CORS-safe) and ensure kind defaults to "subtitles"
        const proxiedTracks = (sourcesData.tracks || []).map((t) => ({
          ...t,
          kind: t.kind || "subtitles",
          file: `${base}/proxy?url=${encodeURIComponent(t.file)}`,
        }));

        setVideoSource(proxiedUrl);
        setVideoTitle(`${selected?.title} - Episode ${episode.number}`);
        setVideoTracks(proxiedTracks);

        // Close the info modal once playback is ready
        setSelected(null);

        const idx = episodes.findIndex((e) => e.id === episode.id);
        if (idx !== -1) setCurrentEpisodeIndex(idx);

        toast.success(`Playing Episode ${episode.number}`);
      } else {
        toast.error("No video sources available");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load video";
      toast.error(msg);
    }
  };

  const filteredPopular = popularItems.filter(item =>
    query ? (item.title ?? "").toLowerCase().includes(query.toLowerCase()) : true
  );

  // Filter content based on active section
  const getSectionContent = () => {
    switch (activeSection) {
      case "tv":
        return tvShowItems;
      case "movies":
        return movieItems;
      case "popular":
        return popularItems;
      case "recent":
        return airingItems;
      default:
        return null;
    }
  };

  const sectionContent = getSectionContent();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="text-gray-400">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      {/* Sidebar */}
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      {/* Top Bar */}
      <TopBar searchQuery={query} onSearchChange={setQuery} />

      {/* Main Content */}
      <main className="ml-20 md:ml-64 pt-16">
        <div className="px-4 md:px-8 py-6 max-w-[1920px] mx-auto">
          {/* Hero Banner */}
          {!query && activeSection === "home" && heroAnime && (
            <HeroBanner
              anime={heroAnime}
              onPlay={() => openAnime(heroAnime)}
              onMoreInfo={() => openAnime(heroAnime)}
            />
          )}

          {/* Search Results */}
          {query ? (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-6 tracking-tight">Search Results</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredPopular.map((item, idx) => (
                  <div key={item.id ?? idx} onClick={() => openAnime(item)}>
                    <motion.div
                      className="cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-900">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title ?? "Anime"}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <p className="mt-2 text-sm text-white line-clamp-2">{item.title}</p>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          ) : sectionContent ? (
            /* Section-specific content */
            <div className="mt-8">
              <h2 className="text-3xl font-bold mb-6 tracking-tight capitalize">
                {activeSection === "tv" ? "TV Shows" : activeSection === "recent" ? "Recently Added" : activeSection}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {sectionContent.map((item, idx) => (
                  <div key={item.id ?? idx} onClick={() => openAnime(item)}>
                    <motion.div
                      className="cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-900">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title ?? "Anime"}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <p className="mt-2 text-sm text-white line-clamp-2">{item.title}</p>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Home view with content rails */
            <>
              <ContentRail
                title="Trending Now"
                items={popularItems}
                onItemClick={openAnime}
              />
              <ContentRail
                title="Top Airing"
                items={airingItems}
                onItemClick={openAnime}
              />
              <ContentRail
                title="Popular Movies"
                items={movieItems}
                onItemClick={openAnime}
              />
              <ContentRail
                title="TV Series"
                items={tvShowItems}
                onItemClick={openAnime}
              />
            </>
          )}
        </div>
      </main>

      {/* Info Modal */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-3xl bg-[#0B0F19] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{selected?.title}</DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6">
              {/* Poster */}
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900">
                {selected?.image && (
                  <img
                    src={selected.image}
                    alt={selected.title ?? "Anime"}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Badges */}
              <div className="flex gap-2">
                {selected?.type && <Badge className="bg-blue-600">{selected.type}</Badge>}
                {selected?.language?.sub && <Badge className="bg-gray-700">SUB</Badge>}
                {selected?.language?.dub && <Badge className="bg-gray-700">DUB</Badge>}
              </div>

              {/* Episodes */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Episodes</h3>
                {episodesLoading ? (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading episodes...
                  </div>
                ) : episodes.length > 0 ? (
                  <div className="grid grid-cols-5 gap-2 max-h-[200px] overflow-y-auto">
                    {episodes.map((ep) => (
                      <Button
                        key={ep.id}
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelected(null);
                          playEpisode(ep);
                        }}
                        className="bg-gray-800 border-gray-700 hover:bg-gray-700"
                      >
                        {ep.number ?? "?"}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No episodes available</p>
                )}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Video Player */}
      {videoSource && (
        <VideoPlayer
          source={videoSource}
          title={videoTitle}
          tracks={videoTracks}
          info={{
            title: selected?.title ?? "",
            image: selected?.image,
            type: selected?.type,
            language: selected?.language,
          }}
          episodes={episodes}
          currentEpisode={currentEpisodeIndex !== null ? episodes[currentEpisodeIndex]?.number : undefined}
          onSelectEpisode={(ep) => playEpisode(ep)}
          onNext={() => {
            if (currentEpisodeIndex === null) return;
            const next = episodes[currentEpisodeIndex + 1];
            if (next) playEpisode(next);
          }}
          nextTitle={
            currentEpisodeIndex !== null && episodes[currentEpisodeIndex + 1]
              ? `${selected?.title} • Ep ${episodes[currentEpisodeIndex + 1].number ?? "?"}`
              : undefined
          }
          onClose={() => {
            setVideoSource(null);
            setVideoTitle("");
            setVideoTracks([]);
          }}
        />
      )}
    </div>
  );
}