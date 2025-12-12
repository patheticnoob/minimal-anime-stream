import { useEffect, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { HeroBanner } from "@/components/HeroBanner";
import { Sidebar } from "@/components/Sidebar";
import { AnimeCard } from "@/components/AnimeCard";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { InfoModal } from "@/components/InfoModal";
import { type BroadcastInfo } from "@/types/broadcast";
import { ProfileDashboard } from "@/components/ProfileDashboard";
import { FullscreenLoader } from "@/components/FullscreenLoader";
import { SearchSection } from "@/components/SearchSection";
import { useTheme } from "@/hooks/use-theme";
import { HomeSections } from "@/components/landing/HomeSections";
import { AnimeItem } from "@/shared/types";
import { useAnimeLists } from "@/hooks/use-anime-lists";
import { usePlayerLogic } from "@/hooks/use-player-logic";
import { VideoPlayer } from "@/components/VideoPlayer";
import { RetroVideoPlayer } from "@/components/RetroVideoPlayer";

// Track if this is the first load
const hasLoadedBefore = sessionStorage.getItem('hasLoadedBefore') === 'true';

interface LandingProps {
  NavBarComponent?: React.ComponentType<any>;
}

export default function Landing({ NavBarComponent }: LandingProps = {}) {
  const { isAuthenticated, isLoading: authLoading, user, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const fetchBroadcastInfo = useAction(api.jikan.searchBroadcast);

  const [activeSection, setActiveSection] = useState("home");
  const [broadcastInfo, setBroadcastInfo] = useState<BroadcastInfo | null>(null);
  const [isBroadcastLoading, setIsBroadcastLoading] = useState(false);
  const [showInitialLoader, setShowInitialLoader] = useState(!hasLoadedBefore);

  // Use custom hooks for data and player logic
  const {
    loading,
    popularItems,
    airingItems,
    movieItems,
    tvShowItems,
    heroAnime,
    popularLoading,
    airingLoading,
    moviesLoading,
    tvShowsLoading,
    query,
    setQuery,
    searchResults,
    isSearching,
    loadMoreItems,
    loadingMore,
    hasMore
  } = useAnimeLists();

  const {
    selected,
    setSelected,
    episodes,
    episodesLoading,
    videoSource,
    videoTitle,
    videoTracks,
    videoIntro,
    videoOutro,
    videoHeaders,
    currentEpisodeData,
    animeProgress,
    playEpisode,
    handleProgressUpdate,
    closePlayer,
    playNextEpisode,
    nextEpisodeTitle,
    setLastSelectedAnime,
    lastSelectedAnime
  } = usePlayerLogic(isAuthenticated);

  // Watch progress and watchlist
  const continueWatching = useQuery(api.watchProgress.getContinueWatching);
  const watchlist = useQuery(api.watchlist.getWatchlist);
  const addToWatchlist = useMutation(api.watchlist.addToWatchlist);
  const removeFromWatchlist = useMutation(api.watchlist.removeFromWatchlist);
  const isInWatchlist = useQuery(
    api.watchlist.isInWatchlist,
    selected?.dataId ? { animeId: selected.dataId } : "skip"
  );

  // Hide initial loader after first content loads
  useEffect(() => {
    if (!loading && !hasLoadedBefore) {
      sessionStorage.setItem('hasLoadedBefore', 'true');
      setShowInitialLoader(false);
    }
  }, [loading]);

  const openAnime = (anime: AnimeItem) => {
    if (!anime?.dataId) {
      toast("This title has no episodes available.");
      return;
    }

    if (theme === "nothing") {
      // Pass anime data through localStorage
      localStorage.setItem(`anime_${anime.dataId}`, JSON.stringify(anime));
      
      // Navigate immediately - Watch page will use cached data or fetch
      navigate(`/watch/${anime.dataId}`);
      return;
    }

    setSelected(anime);
    setLastSelectedAnime(anime);
  };

  // Lazy load broadcast info after episodes are ready
  useEffect(() => {
    if (!selected?.title || episodesLoading) {
      setBroadcastInfo(null);
      setIsBroadcastLoading(false);
      return;
    }

    let cancelled = false;
    setIsBroadcastLoading(true);

    // Delay broadcast fetch to prioritize episode loading
    const timeoutId = setTimeout(() => {
      fetchBroadcastInfo({ title: selected.title! })
        .then((result) => {
          if (cancelled) return;

          const status = result?.status ?? null;
          if (status !== "airing" && status !== "upcoming") {
            setBroadcastInfo(null);
            return;
          }

          const broadcast = result?.broadcast;
          if (!broadcast) {
            setBroadcastInfo(null);
            return;
          }

          const parts: string[] = [];
          if (broadcast.string) {
            parts.push(broadcast.string);
          } else {
            if (broadcast.day) parts.push(broadcast.day);
            if (broadcast.time) parts.push(broadcast.time);
          }

          let summary = parts.join(" • ");
          if (broadcast.timezone) {
            summary = summary ? `${summary} (${broadcast.timezone})` : broadcast.timezone;
          }

          const info: BroadcastInfo = {
            summary: summary || null,
            day: broadcast.day ?? null,
            time: broadcast.time ?? null,
            timezone: broadcast.timezone ?? null,
            status,
          };

          setBroadcastInfo(info.summary || info.day || info.time || info.timezone ? info : null);
        })
        .catch(() => {
          if (!cancelled) {
            setBroadcastInfo(null);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setIsBroadcastLoading(false);
          }
        });
    }, 500); // Delay by 500ms

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [selected?.title, episodesLoading, fetchBroadcastInfo]);

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

  const getSectionContent = () => {
    switch (activeSection) {
      case "tv": return tvShowItems;
      case "movies": return movieItems;
      case "popular": return popularItems;
      case "recent": return airingItems;
      default: return null;
    }
  };

  const sectionContent = getSectionContent();

  // Convert continue watching to AnimeItem format
  const continueWatchingItems: AnimeItem[] = (continueWatching || []).map((item) => ({
    title: item.animeTitle,
    image: item.animeImage || undefined,
    dataId: item.animeId,
    id: item.animeId,
    episodeNumber: item.episodeNumber,
    currentTime: item.currentTime,
    duration: item.duration,
    sourceCategory: "continueWatching" as const,
  }));

  // Convert watchlist to AnimeItem format
  const watchlistItems: AnimeItem[] = (watchlist || []).map((item) => ({
    title: item.animeTitle,
    image: item.animeImage,
    type: item.animeType,
    dataId: item.animeId,
    id: item.animeId,
    language: item.language,
    sourceCategory: "watchlist" as const,
  }));

  // Show initial loader only on first visit
  if (showInitialLoader && (loading || authLoading)) {
    return (
      <FullscreenLoader
        label="Loading anime..."
        subLabel="Summoning episodes from another world"
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white font-sans selection:bg-blue-500/30">
      {NavBarComponent ? (
        <NavBarComponent
          activeSection={activeSection}
          onSectionChange={(section: string) => {
            if (section === "history") {
              navigate("/history");
              return;
            }
            if (section === "profile" && !isAuthenticated) {
              toast.error("Please sign in to view your profile");
              navigate("/auth");
              return;
            }
            if (section === "search") setQuery("");
            setActiveSection(section);
          }}
          isAuthenticated={isAuthenticated}
          onLogout={async () => {
            await signOut();
            toast.success("Logged out successfully");
            setActiveSection("home");
          }}
        />
      ) : (
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
            if (section === "search") setQuery("");
            setActiveSection(section);
          }}
        />
      )}

      <main className={theme === "nothing" ? "pt-24 transition-all duration-300" : "md:ml-20 transition-all duration-300"}>
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
              <SearchSection query={query} onItemClick={openAnime} />
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
              {activeSection === "home" && heroAnime && (
                <HeroBanner
                  anime={heroAnime}
                  onPlay={() => openAnime(heroAnime)}
                  onMoreInfo={() => openAnime(heroAnime)}
                />
              )}

              {sectionContent ? (
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
                <HomeSections
                  isAuthenticated={isAuthenticated}
                  continueWatchingItems={continueWatchingItems}
                  watchlistItems={watchlistItems}
                  popularItems={popularItems}
                  airingItems={airingItems}
                  movieItems={movieItems}
                  tvShowItems={tvShowItems}
                  popularLoading={popularLoading}
                  airingLoading={airingLoading}
                  moviesLoading={moviesLoading}
                  tvShowsLoading={tvShowsLoading}
                  onOpenAnime={openAnime}
                  onLoadMore={loadMoreItems}
                  loadingMore={loadingMore}
                  hasMore={hasMore}
                />
              )}
            </>
          )}
        </div>
      </main>

      <InfoModal
        anime={selected}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        episodes={episodes.map(ep => {
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
        onPlayEpisode={(ep) => playEpisode(ep)}
        isInWatchlist={isInWatchlist}
        onToggleWatchlist={handleToggleWatchlist}
        broadcastInfo={broadcastInfo}
        broadcastLoading={isBroadcastLoading}
      />

      {videoSource && currentEpisodeData && (
        <>
          {theme === "retro" ? (
            <RetroVideoPlayer
              source={videoSource}
              title={videoTitle}
              tracks={videoTracks}
              intro={videoIntro}
              outro={videoOutro}
              onClose={closePlayer}
              onProgressUpdate={handleProgressUpdate}
              resumeFrom={
                animeProgress && 
                currentEpisodeData &&
                animeProgress.episodeId === currentEpisodeData.id && 
                animeProgress.currentTime > 0 && 
                animeProgress.duration > 0
                  ? animeProgress.currentTime
                  : 0
              }
              onNext={playNextEpisode}
              nextTitle={nextEpisodeTitle}
              animeImage={lastSelectedAnime?.image}
              animeDescription={lastSelectedAnime?.title}
            />
          ) : (
            <VideoPlayer
              source={videoSource}
              title={videoTitle}
              tracks={videoTracks}
              intro={videoIntro}
              outro={videoOutro}
              headers={videoHeaders || undefined}
              onClose={closePlayer}
              onProgressUpdate={handleProgressUpdate}
              resumeFrom={
                animeProgress && 
                currentEpisodeData &&
                animeProgress.episodeId === currentEpisodeData.id && 
                animeProgress.currentTime > 0 && 
                animeProgress.duration > 0
                  ? animeProgress.currentTime
                  : 0
              }
              onNext={playNextEpisode}
              nextTitle={nextEpisodeTitle}
            />
          )}
        </>
      )}
    </div>
  );
}