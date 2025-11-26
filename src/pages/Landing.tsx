import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Loader2, Play, Plus, Check } from "lucide-react";
import { HeroBanner } from "@/components/HeroBanner";
import { ContentRail } from "@/components/ContentRail";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { AnimeCard } from "@/components/AnimeCard";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { InfoModal } from "@/components/InfoModal";
import { VideoPlayer } from "@/components/VideoPlayer";
import { ProfileDashboard } from "@/components/ProfileDashboard";
import { FullscreenLoader } from "@/components/FullscreenLoader";
import { AdSlot } from "@/components/AdSlot";

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
  number?: number | string | null;
};

type AnimePlaybackInfo = {
  animeId: string;
  title: string;
  image?: string | null;
  type?: string;
  language?: {
    sub?: string | null;
    dub?: string | null;
  };
};

const normalizeEpisodeNumber = (value?: number | string | null) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return 0;
};

export default function Landing() {
  const { isAuthenticated, isLoading: authLoading, user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const fetchTopAiring = useAction(api.hianime.topAiring);
  const fetchMostPopular = useAction(api.hianime.mostPopular);
  const fetchMovies = useAction(api.hianime.movies);
  const fetchTVShows = useAction(api.hianime.tvShows);
  const fetchEpisodes = useAction(api.hianime.episodes);
  const fetchServers = useAction(api.hianime.episodeServers);
  const fetchSources = useAction(api.hianime.episodeSources);
  const searchAnime = useAction(api.hianime.search);

  const [loading, setLoading] = useState(true);
  const [popularItems, setPopularItems] = useState<AnimeItem[]>([]);
  const [airingItems, setAiringItems] = useState<AnimeItem[]>([]);
  const [movieItems, setMovieItems] = useState<AnimeItem[]>([]);
  const [tvShowItems, setTVShowItems] = useState<AnimeItem[]>([]);
  const [heroAnime, setHeroAnime] = useState<AnimeItem | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AnimeItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [selected, setSelected] = useState<AnimeItem | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [videoSource, setVideoSource] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [videoTracks, setVideoTracks] = useState<Array<{ file: string; label: string; kind?: string }>>([]);
  const [videoIntro, setVideoIntro] = useState<{ start: number; end: number } | null>(null);
  const [videoOutro, setVideoOutro] = useState<{ start: number; end: number } | null>(null);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState<number | null>(null);
  const [currentEpisodeData, setCurrentEpisodeData] = useState<Episode | null>(null);
  const [lastSelectedAnime, setLastSelectedAnime] = useState<AnimeItem | null>(null);
  const [currentAnimeInfo, setCurrentAnimeInfo] = useState<AnimePlaybackInfo | null>(null);

  const renderAdSlot = (placement: "guestHero" | "continueWatching") => (
    <AdSlot placement={placement} />
  );

  // Watch progress and watchlist
  const continueWatching = useQuery(api.watchProgress.getContinueWatching);
  const watchlist = useQuery(api.watchlist.getWatchlist);
  const saveProgress = useMutation(api.watchProgress.saveProgress);
  const addToWatchlist = useMutation(api.watchlist.addToWatchlist);
  const removeFromWatchlist = useMutation(api.watchlist.removeFromWatchlist);
  const isInWatchlist = useQuery(
    api.watchlist.isInWatchlist,
    selected?.dataId ? { animeId: selected.dataId } : "skip"
  );

  // Get progress for selected anime
  const animeProgress = useQuery(
    api.watchProgress.getProgress,
    selected?.dataId ? { animeId: selected.dataId } : "skip"
  );

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

        // Combine popular and airing for hero rotation
        const heroPool = [
          ...(popularData.results || []).slice(0, 5),
          ...(airingData.results || []).slice(0, 5),
        ];
        
        // Set random hero from pool
        if (heroPool.length > 0) {
          const randomIndex = Math.floor(Math.random() * heroPool.length);
          setHeroAnime(heroPool[randomIndex]);
          setHeroIndex(randomIndex);
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

  // Auto-rotate hero banner every 4 seconds
  useEffect(() => {
    if (!heroAnime || popularItems.length === 0 || airingItems.length === 0) return;

    const heroPool = [
      ...popularItems.slice(0, 5),
      ...airingItems.slice(0, 5),
    ];

    if (heroPool.length === 0) return;

    const interval = setInterval(() => {
      setHeroIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % heroPool.length;
        setHeroAnime(heroPool[nextIndex]);
        return nextIndex;
      });
    }, 4000); // Rotate every 4 seconds

    return () => clearInterval(interval);
  }, [heroAnime, popularItems, airingItems]);

  // Search handler with debounce
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchAnime({ query: query.trim(), page: 1 });
        const searchData = results as { results: AnimeItem[] };
        setSearchResults(searchData.results || []);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Search failed";
        toast.error(msg);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, searchAnime]);

  const openAnime = async (anime: AnimeItem) => {
    setSelected(anime);
    setLastSelectedAnime(anime);
    if (!anime?.dataId) {
      toast("This title has no episodes available.");
      return;
    }
    setEpisodes([]);
    setEpisodesLoading(true);
    try {
      const eps = (await fetchEpisodes({ dataId: anime.dataId })) as Episode[];
      const normalizedEpisodes = eps.map((ep) => ({
        ...ep,
        number: normalizeEpisodeNumber(ep.number),
      }));
      setEpisodes(normalizedEpisodes);
      setCurrentEpisodeIndex(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load episodes.";
      toast.error(msg);
    } finally {
      setEpisodesLoading(false);
    }
  };

  const handleToggleWatchlist = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to use watchlist");
      navigate("/auth");
      return;
    }

    if (!selected?.dataId) return;

    try {
      if (isInWatchlist) {
        await removeFromWatchlist({ animeId: selected.dataId });
        toast.success("Removed from watchlist");
      } else {
        await addToWatchlist({
          animeId: selected.dataId,
          animeTitle: selected.title || "",
          animeImage: selected.image,
          animeType: selected.type,
          language: selected.language,
        });
        toast.success("Added to watchlist");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update watchlist";
      toast.error(msg);
    }
  };

  const playEpisode = async (episode: Episode) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to watch");
      navigate("/auth");
      return;
    }

    if (!selected?.dataId) {
      toast.error("Invalid anime selection");
      return;
    }

    const normalizedEpisodeNumber = normalizeEpisodeNumber(episode.number);
    const normalizedEpisode: Episode = { ...episode, number: normalizedEpisodeNumber };

    const animeInfo: AnimePlaybackInfo = {
      animeId: selected.dataId,
      title: selected.title || "",
      image: selected.image ?? null,
      type: selected.type,
      language: selected.language,
    };
    setCurrentAnimeInfo(animeInfo);

    // Store episode data FIRST (before any async operations)
    setCurrentEpisodeData(normalizedEpisode);

    // Reset video state to prevent old data from carrying over
    setVideoSource(null);
    setVideoIntro(null);
    setVideoOutro(null);

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
        intro?: { start: number; end: number };
        outro?: { start: number; end: number };
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
        setVideoTitle(`${selected?.title} - Episode ${normalizedEpisodeNumber}`);
        setVideoTracks(proxiedTracks);
        setVideoIntro(sourcesData.intro || null);
        setVideoOutro(sourcesData.outro || null);

        const idx = episodes.findIndex((e) => e.id === episode.id);
        if (idx !== -1) setCurrentEpisodeIndex(idx);

        toast.success(`Playing Episode ${normalizedEpisodeNumber}`);
      } else {
        toast.error("No video sources available");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load video";
      toast.error(msg);
    }
  };

  const handleProgressUpdate = useCallback(async (currentTime: number, duration: number) => {
    if (!isAuthenticated) return;

    if (!currentEpisodeData || !currentAnimeInfo) return;

    if (!duration || duration <= 0) return;

    const episodeNumberForProgress = normalizeEpisodeNumber(currentEpisodeData.number);

    try {
      await saveProgress({
        animeId: currentAnimeInfo.animeId,
        animeTitle: currentAnimeInfo.title,
        animeImage: currentAnimeInfo.image ?? null,
        episodeId: currentEpisodeData.id,
        episodeNumber: episodeNumberForProgress,
        currentTime: Math.floor(currentTime),
        duration: Math.floor(duration),
      });
    } catch (err) {
      console.error("❌ Failed to save progress:", err);
    }
  }, [isAuthenticated, currentEpisodeData, currentAnimeInfo, saveProgress]);

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

  const handleProfileCTA = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to view your profile");
      navigate("/auth");
      return;
    }
    setActiveSection("profile");
  };

  // Convert continue watching to AnimeItem format with progress
  const continueWatchingItems: AnimeItem[] = (continueWatching || []).map((item) => ({
    title: item.animeTitle,
    image: item.animeImage || undefined,
    dataId: item.animeId,
    id: item.animeId,
    episodeNumber: item.episodeNumber,
    currentTime: item.currentTime,
    duration: item.duration,
  }));

  // Convert watchlist to AnimeItem format
  const watchlistItems: AnimeItem[] = (watchlist || []).map((item) => ({
    title: item.animeTitle,
    image: item.animeImage,
    type: item.animeType,
    dataId: item.animeId,
    id: item.animeId,
    language: item.language,
  }));

  if (loading || authLoading) {
    return (
      <FullscreenLoader
        label="Loading anime..."
        subLabel="Summoning episodes from another world"
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white font-sans selection:bg-blue-500/30">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={(section) => {
          if (section === "history") {
            navigate("/history");
            return;
          }
          if (section === "profile" && !isAuthenticated) {
            toast.error("Please sign in to view your profile");
            navigate("/auth");
            return;
          }
          if (section === "search") {
            setQuery(""); // Reset search when entering search section
          }
          setActiveSection(section);
        }}
      />

      <main className="md:ml-20 transition-all duration-300">
        <div className="px-6 md:px-10 pb-10 pt-8 max-w-[2000px] mx-auto">
          {activeSection === "search" ? (
            <div className="mt-8">
              <h2 className="text-3xl font-bold mb-6 tracking-tight">Search Anime</h2>
              <div className="relative max-w-2xl mb-8">
                <input
                  type="text"
                  placeholder="Search for anime..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-6 py-4 text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
              {isSearching ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                  {searchResults.map((item, idx) => (
                    <AnimeCard 
                      key={item.id ?? idx} 
                      anime={item} 
                      onClick={() => openAnime(item)} 
                      index={idx}
                    />
                  ))}
                </div>
              ) : query ? (
                <div className="text-center py-20">
                  <p className="text-gray-400 text-lg">No results found for "{query}"</p>
                  <p className="text-gray-500 mt-2">Try a different search term</p>
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-400 text-lg">Start typing to search for anime</p>
                </div>
              )}
            </div>
          ) : activeSection === "profile" ? (
            <ProfileDashboard
              userName={user?.name}
              userEmail={user?.email}
              continueWatching={continueWatchingItems}
              watchlist={watchlistItems}
              onSelectAnime={openAnime}
              onLogout={async () => {
                await signOut();
                toast.success("Logged out successfully");
                setActiveSection("home");
              }}
            />
          ) : (
            <>
              {/* Hero Banner */}
              {activeSection === "home" && heroAnime && (
                <HeroBanner
                  anime={heroAnime}
                  onPlay={() => openAnime(heroAnime)}
                  onMoreInfo={() => openAnime(heroAnime)}
                />
              )}

              {!isAuthenticated && activeSection === "home" && renderAdSlot("guestHero")}

              {/* Section-specific content */}
              {sectionContent ? (
                /* Section-specific content */
                <div className="mt-8">
                  <h2 className="text-3xl font-bold mb-6 tracking-tight capitalize">
                    {activeSection === "tv" ? "TV Shows" : activeSection === "recent" ? "Recently Added" : activeSection}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                    {sectionContent.map((item, idx) => (
                      <AnimeCard 
                        key={item.id ?? idx} 
                        anime={item} 
                        onClick={() => openAnime(item)} 
                        index={idx}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                /* Home view with content rails */
                <div className="space-y-8">
                  {/* Continue Watching */}
                  {isAuthenticated && continueWatchingItems.length > 0 && (
                    <>
                      <ContentRail
                        title="Continue Watching"
                        items={continueWatchingItems}
                        onItemClick={openAnime}
                      />
                      {renderAdSlot("continueWatching")}
                    </>
                  )}

                  {/* My Watchlist */}
                  {isAuthenticated && watchlistItems.length > 0 && (
                    <ContentRail
                      title="My Watchlist"
                      items={watchlistItems}
                      onItemClick={openAnime}
                    />
                  )}

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
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Info Modal */}
      <InfoModal
        anime={selected}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        episodes={episodes.map(ep => {
          // Enrich episodes with progress data
          const normalizedEp = {
            id: ep.id,
            title: ep.title,
            number: typeof ep.number === 'number' ? ep.number : undefined,
          };
          if (animeProgress && animeProgress.episodeId === ep.id) {
            return {
              ...normalizedEp,
              currentTime: animeProgress.currentTime,
              duration: animeProgress.duration,
            };
          }
          return normalizedEp;
        })}
        episodesLoading={episodesLoading}
        onPlayEpisode={(ep) => {
          playEpisode(ep);
        }}
        isInWatchlist={isInWatchlist}
        onToggleWatchlist={handleToggleWatchlist}
      />

      {/* Video Player */}
      {videoSource && currentEpisodeData && (
        <VideoPlayer
          source={videoSource}
          title={videoTitle}
          tracks={videoTracks}
          intro={videoIntro}
          outro={videoOutro}
          info={{
            title: currentAnimeInfo?.title ?? selected?.title ?? "",
            image: (currentAnimeInfo?.image ?? selected?.image) ?? undefined,
            type: currentAnimeInfo?.type ?? selected?.type,
            language: currentAnimeInfo?.language ?? selected?.language,
          }}
          episodes={episodes.map(ep => ({
            id: ep.id,
            title: ep.title,
            number: typeof ep.number === 'number' ? ep.number : undefined,
          }))}
          currentEpisode={currentEpisodeIndex !== null && episodes[currentEpisodeIndex] ? (typeof episodes[currentEpisodeIndex].number === 'number' ? episodes[currentEpisodeIndex].number : undefined) : undefined}
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
          resumeFrom={
            animeProgress && 
            currentEpisodeData &&
            animeProgress.episodeId === currentEpisodeData.id && 
            animeProgress.currentTime > 0 && 
            animeProgress.duration > 0
              ? animeProgress.currentTime
              : 0
          }
          onProgressUpdate={handleProgressUpdate}
          onClose={() => {
            setVideoSource(null);
            setVideoTitle("");
            setVideoTracks([]);
            setVideoIntro(null);
            setVideoOutro(null);
            setCurrentEpisodeData(null);
            setCurrentAnimeInfo(null);
            // Reopen the modal with the last selected anime
            if (lastSelectedAnime) {
              setSelected(lastSelectedAnime);
            }
          }}
        />
      )}
    </div>
  );
}