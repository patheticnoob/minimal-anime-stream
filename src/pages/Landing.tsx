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
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState<number | null>(null);
  const [currentEpisodeData, setCurrentEpisodeData] = useState<Episode | null>(null);
  const [lastSelectedAnime, setLastSelectedAnime] = useState<AnimeItem | null>(null);
  const [currentAnimeInfo, setCurrentAnimeInfo] = useState<AnimePlaybackInfo | null>(null);
  
  // Server preferences for playback
  const [serverPreferences, setServerPreferences] = useState<{
    category: "sub" | "dub";
    serverName: string;
  }>({
    category: "sub",
    serverName: "HD-1",
  });

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

  const playEpisode = async (episode: Episode, preferences = serverPreferences) => {
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

    // Only save initial progress if there's no existing progress for this episode
    // This prevents resetting the progress bar when clicking on a partially watched episode
    if (!animeProgress || animeProgress.episodeId !== episode.id) {
      try {
        console.log("Saving initial progress for:", selected.title, normalizedEpisodeNumber);
        await saveProgress({
          animeId: animeInfo.animeId,
          animeTitle: animeInfo.title,
          animeImage: animeInfo.image ?? null,
          episodeId: episode.id,
          episodeNumber: normalizedEpisodeNumber,
          currentTime: 0,
          duration: 0,
        });
      } catch (err) {
        console.error("Failed to save initial progress:", err);
        toast.error("Failed to save progress to history");
      }
    }

    toast("Loading video...");
    
    // Store episode data FIRST
    setCurrentEpisodeData(normalizedEpisode);
    
    try {
      const servers = await fetchServers({ episodeId: episode.id });
      const serverData = servers as { sub: Array<{ id: string; name: string }>; dub: Array<{ id: string; name: string }> };
      
      // Normalize server names for matching (case-insensitive, handle spaces/hyphens)
      const normalizeServerName = (name: string) => name.toLowerCase().replace(/[\s-]/g, "");
      
      // Get servers for the selected category (sub or dub)
      const categoryServers = serverData[preferences.category] || [];
      
      // Try to find the preferred server by name
      const preferredServer = categoryServers.find(
        s => normalizeServerName(s.name) === normalizeServerName(preferences.serverName)
      ) || categoryServers[0];
      
      if (!preferredServer) {
        toast.error(`${preferences.serverName} ${preferences.category.toUpperCase()} server not available`);
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
        setVideoTitle(`${selected?.title} - Episode ${normalizedEpisodeNumber}`);
        setVideoTracks(proxiedTracks);

        const idx = episodes.findIndex((e) => e.id === episode.id);
        if (idx !== -1) setCurrentEpisodeIndex(idx);

        toast.success(`Playing ${preferences.category.toUpperCase()} • ${preferredServer.name}`);
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
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="text-gray-400">Loading content...</p>
        </div>
      </div>
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
          setActiveSection(section);
        }}
      />

      <TopBar
        searchQuery={query}
        onSearchChange={setQuery}
        onProfileClick={handleProfileCTA}
        isAuthenticated={isAuthenticated}
      />

      <main className="md:ml-20 pt-16 md:pt-20 transition-all duration-300">
        <div className="px-6 md:px-10 pb-10 max-w-[2000px] mx-auto">
          {activeSection === "profile" ? (
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
                  <h2 className="text-2xl font-bold mb-6 tracking-tight">
                    {isSearching ? "Searching..." : `Search Results for "${query}"`}
                  </h2>
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
                  ) : (
                    <div className="text-center py-20">
                      <p className="text-gray-400 text-lg">No results found for "{query}"</p>
                      <p className="text-gray-500 mt-2">Try a different search term</p>
                    </div>
                  )}
                </div>
              ) : sectionContent ? (
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
                    <ContentRail
                      title="Continue Watching"
                      items={continueWatchingItems}
                      onItemClick={openAnime}
                    />
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
        serverPreferences={serverPreferences}
        onServerPreferencesChange={setServerPreferences}
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
            animeProgress && animeProgress.episodeId === currentEpisodeData.id
              ? animeProgress.currentTime
              : 0
          }
          onProgressUpdate={handleProgressUpdate}
          onClose={() => {
            setVideoSource(null);
            setVideoTitle("");
            setVideoTracks([]);
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