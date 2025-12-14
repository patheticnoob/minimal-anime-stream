import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { ArrowLeft, Play, Plus, Check, Clock3, Image as ImageIcon, Film } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { NothingVideoPlayerV2 } from "../components/NothingVideoPlayerV2";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FullscreenLoader } from "@/components/FullscreenLoader";
import { type BroadcastInfo } from "@/types/broadcast";
import { DateTime } from "luxon";
import { animeCache } from "@/lib/anime-cache";

type Episode = {
  id: string;
  title?: string;
  number?: number;
  currentTime?: number;
  duration?: number;
};

type AnimeDetail = {
  title?: string;
  image?: string;
  type?: string;
  dataId?: string;
  language?: {
    sub?: string | null;
    dub?: string | null;
  };
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

export default function NothingWatch() {
  const { animeId } = useParams<{ animeId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Get dark mode state from localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("nothing-dark-mode");
    return saved === "true";
  });

  // Sync with localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("nothing-dark-mode");
      setIsDarkMode(saved === "true");
    };
    
    window.addEventListener("storage", handleStorageChange);
    // Also check on mount and periodically
    const interval = setInterval(handleStorageChange, 100);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Apply dark class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const fetchEpisodes = useAction(api.hianime.episodes);
  const fetchServers = useAction(api.hianime.episodeServers);
  const fetchSources = useAction(api.hianime.episodeSources);
  const fetchBroadcastInfo = useAction(api.jikan.searchBroadcast);

  const [anime, setAnime] = useState<AnimeDetail | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodesWithProgress, setEpisodesWithProgress] = useState<Episode[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(true);
  const [videoSource, setVideoSource] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [videoTracks, setVideoTracks] = useState<Array<{ file: string; label: string; kind?: string }>>([]);
  const [videoIntro, setVideoIntro] = useState<{ start: number; end: number } | null>(null);
  const [videoOutro, setVideoOutro] = useState<{ start: number; end: number } | null>(null);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState<number | null>(null);
  const [currentEpisodeData, setCurrentEpisodeData] = useState<Episode | null>(null);
  const [currentAnimeInfo, setCurrentAnimeInfo] = useState<AnimePlaybackInfo | null>(null);
  const [broadcastInfo, setBroadcastInfo] = useState<BroadcastInfo | null>(null);
  const [isBroadcastLoading, setIsBroadcastLoading] = useState(false);

  const saveProgress = useMutation(api.watchProgress.saveProgress);
  const addToWatchlist = useMutation(api.watchlist.addToWatchlist);
  const removeFromWatchlist = useMutation(api.watchlist.removeFromWatchlist);
  
  const isInWatchlist = useQuery(
    api.watchlist.isInWatchlist,
    animeId ? { animeId } : "skip"
  );

  const animeProgress = useQuery(
    api.watchProgress.getProgress,
    animeId ? { animeId } : "skip"
  );

  // Load anime data from URL params or localStorage
  useEffect(() => {
    if (!animeId) {
      navigate("/");
      return;
    }

    const storedAnime = localStorage.getItem(`anime_${animeId}`);
    if (storedAnime) {
      try {
        const animeData = JSON.parse(storedAnime);
        setAnime(animeData);
      } catch (err) {
        console.error("Failed to parse stored anime data:", err);
      }
    }

    // Check cache first - this eliminates redundant fetching
    const cacheKey = `episodes_${animeId}`;
    const cachedEpisodes = animeCache.get<Episode[]>(cacheKey);
    
    if (cachedEpisodes) {
      const normalizedEpisodes = cachedEpisodes.map((ep) => ({
        ...ep,
        number: normalizeEpisodeNumber(ep.number),
      }));
      setEpisodes(normalizedEpisodes);
      setEpisodesLoading(false);
      
      // Prefetch first or last watched episode immediately
      if (normalizedEpisodes.length > 0 && storedAnime) {
        const animeData = JSON.parse(storedAnime);
        prefetchEpisodeSources(normalizedEpisodes, animeData);
      }
      
      // Lazy load broadcast info after episodes are ready (non-critical)
      if (storedAnime) {
        const animeData = JSON.parse(storedAnime);
        if (animeData.title) {
          setTimeout(() => {
            loadBroadcastInfo(animeData.title);
          }, 500);
        }
      }
      
      return; // Exit early - no need to fetch
    }

    // Only fetch if not in cache
    setEpisodesLoading(true);
    fetchEpisodes({ dataId: animeId })
      .then((eps) => {
        const normalizedEpisodes = (eps as Episode[]).map((ep) => ({
          ...ep,
          number: normalizeEpisodeNumber(ep.number),
        }));
        setEpisodes(normalizedEpisodes);
        
        // Cache episodes for 10 minutes
        animeCache.set(cacheKey, eps, 10);
        
        // Prefetch first or last watched episode
        if (normalizedEpisodes.length > 0 && storedAnime) {
          const animeData = JSON.parse(storedAnime);
          prefetchEpisodeSources(normalizedEpisodes, animeData);
        }
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Failed to load episodes.";
        toast.error(msg);
      })
      .finally(() => setEpisodesLoading(false));

    // Lazy load broadcast info (non-critical data)
    if (storedAnime) {
      const animeData = JSON.parse(storedAnime);
      if (animeData.title) {
        setTimeout(() => {
          loadBroadcastInfo(animeData.title);
        }, 500);
      }
    }
  }, [animeId, fetchEpisodes, navigate]);

  // Helper function to prefetch episode sources
  const prefetchEpisodeSources = async (normalizedEpisodes: Episode[], animeData: any) => {
    // Determine which episode to prefetch (last watched or first)
    const targetEpisode = animeProgress?.episodeId 
      ? normalizedEpisodes.find(ep => ep.id === animeProgress.episodeId)
      : normalizedEpisodes[0];
    
    if (!targetEpisode) return;
    
    const cacheKey = `sources_${targetEpisode.id}`;
    if (animeCache.has(cacheKey)) return;

    try {
      const servers = await fetchServers({ episodeId: targetEpisode.id });
      const serverData = servers as { sub: Array<{ id: string; name: string }>; dub: Array<{ id: string; name: string }> };
      
      const subServers = serverData.sub || [];
      const hd2Server = subServers.find(s => s.name === "HD-2") || subServers[0];
      
      if (hd2Server) {
        const sources = await fetchSources({ serverId: hd2Server.id });
        animeCache.set(cacheKey, sources, 5);
        
        // Also prefetch next episode
        const targetIndex = normalizedEpisodes.findIndex(ep => ep.id === targetEpisode.id);
        if (targetIndex !== -1 && normalizedEpisodes[targetIndex + 1]) {
          const nextEpisode = normalizedEpisodes[targetIndex + 1];
          const nextCacheKey = `sources_${nextEpisode.id}`;
          
          if (!animeCache.has(nextCacheKey)) {
            const nextServers = await fetchServers({ episodeId: nextEpisode.id });
            const nextServerData = nextServers as { sub: Array<{ id: string; name: string }>; dub: Array<{ id: string; name: string }> };
            const nextHd2Server = nextServerData.sub?.find(s => s.name === "HD-2") || nextServerData.sub?.[0];
            
            if (nextHd2Server) {
              const nextSources = await fetchSources({ serverId: nextHd2Server.id });
              animeCache.set(nextCacheKey, nextSources, 5);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Prefetch failed:', err);
    }
  };

  // Helper function to load broadcast info
  const loadBroadcastInfo = (title: string) => {
    setIsBroadcastLoading(true);
    fetchBroadcastInfo({ title })
      .then((result) => {
        const status = result?.status ?? null;
        if (status !== "airing" && status !== "upcoming") {
          setBroadcastInfo(null);
          return;
        }

        const broadcast = result?.broadcast;
        if (!broadcast) return;

        const summaryParts: string[] = [];
        if (broadcast.string) {
          summaryParts.push(broadcast.string);
        } else {
          if (broadcast.day) summaryParts.push(broadcast.day);
          if (broadcast.time) summaryParts.push(broadcast.time);
        }

        let summary = summaryParts.join(" • ");
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

        if (info.summary || info.day || info.time || info.timezone) {
          setBroadcastInfo(info);
        }
      })
      .catch(() => {
        setBroadcastInfo(null);
      })
      .finally(() => setIsBroadcastLoading(false));
  };

  // Merge episodes with progress data
  useEffect(() => {
    if (!animeProgress || episodes.length === 0) {
      setEpisodesWithProgress(episodes);
      return;
    }

    const merged = episodes.map((ep) => {
      if (ep.id === animeProgress.episodeId) {
        return {
          ...ep,
          currentTime: animeProgress.currentTime,
          duration: animeProgress.duration,
        };
      }
      return ep;
    });
    setEpisodesWithProgress(merged);
  }, [episodes, animeProgress]);

  const handleToggleWatchlist = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to use watchlist");
      navigate("/auth");
      return;
    }

    if (!animeId) return;

    try {
      if (isInWatchlist) {
        await removeFromWatchlist({ animeId });
        toast.success("Removed from watchlist");
      } else {
        await addToWatchlist({
          animeId,
          animeTitle: anime?.title || "",
          animeImage: anime?.image,
          animeType: anime?.type,
          language: anime?.language,
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

    if (!animeId) {
      toast.error("Invalid anime selection");
      return;
    }

    const normalizedEpisodeNumber = normalizeEpisodeNumber(episode.number);
    const normalizedEpisode: Episode = { ...episode, number: normalizedEpisodeNumber };

    const animeInfo: AnimePlaybackInfo = {
      animeId,
      title: anime?.title || "",
      image: anime?.image ?? null,
      type: anime?.type,
      language: anime?.language,
    };
    setCurrentAnimeInfo(animeInfo);
    setCurrentEpisodeData(normalizedEpisode);

    setVideoSource(null);
    setVideoIntro(null);
    setVideoOutro(null);

    // Auto-scroll to video player after a short delay to allow rendering
    setTimeout(() => {
      const playerContainer = document.getElementById('video-player-container');
      if (playerContainer) {
        playerContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);

    // Check cache first
    const cacheKey = `sources_${episode.id}`;
    const cachedSources = animeCache.get<any>(cacheKey);
    
    if (cachedSources) {
      const sourcesData = cachedSources;
      
      if (sourcesData.sources && sourcesData.sources.length > 0) {
        const m3u8Source = sourcesData.sources.find((s: any) => s.file.includes(".m3u8"));
        const originalUrl = m3u8Source?.file || sourcesData.sources[0].file;

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

        const proxiedUrl = `${base}/proxy?url=${encodeURIComponent(originalUrl)}`;
        const proxiedTracks = (sourcesData.tracks || []).map((t: any) => ({
          ...t,
          kind: t.kind || "subtitles",
          file: `${base}/proxy?url=${encodeURIComponent(t.file)}`,
        }));

        setVideoSource(proxiedUrl);
        setVideoTitle(`${anime?.title} - Episode ${normalizedEpisodeNumber}`);
        setVideoTracks(proxiedTracks);
        setVideoIntro(sourcesData.intro || null);
        setVideoOutro(sourcesData.outro || null);

        const idx = episodes.findIndex((e) => e.id === episode.id);
        if (idx !== -1) setCurrentEpisodeIndex(idx);

        toast.success(`Playing Episode ${normalizedEpisodeNumber}`);
        
        // Prefetch next episode
        if (idx !== -1 && episodes[idx + 1]) {
          const nextEpisode = episodes[idx + 1];
          const nextCacheKey = `sources_${nextEpisode.id}`;
          
          if (!animeCache.has(nextCacheKey)) {
            fetchServers({ episodeId: nextEpisode.id })
              .then((servers) => {
                const serverData = servers as { sub: Array<{ id: string; name: string }>; dub: Array<{ id: string; name: string }> };
                const hd2Server = serverData.sub?.find(s => s.name === "HD-2") || serverData.sub?.[0];
                
                if (hd2Server) {
                  return fetchSources({ serverId: hd2Server.id });
                }
              })
              .then((sources) => {
                if (sources) {
                  animeCache.set(nextCacheKey, sources, 5);
                }
              })
              .catch(() => {
                // Silent fail for prefetch
              });
          }
        }
        
        return;
      }
    }

    try {
      const servers = await fetchServers({ episodeId: episode.id });
      const serverData = servers as { sub: Array<{ id: string; name: string }>; dub: Array<{ id: string; name: string }> };

      const subServers = serverData.sub || [];
      const hd2Server = subServers.find(s => s.name === "HD-2") || subServers[0];

      if (!hd2Server) {
        toast.error("No streaming servers available");
        return;
      }

      const sources = await fetchSources({ serverId: hd2Server.id });
      const sourcesData = sources as {
        sources: Array<{ file: string; type: string }>;
        tracks?: Array<{ file: string; label: string; kind?: string }>;
        intro?: { start: number; end: number };
        outro?: { start: number; end: number };
      };
      
      // Cache the sources
      animeCache.set(cacheKey, sourcesData, 5);

      if (sourcesData.sources && sourcesData.sources.length > 0) {
        const m3u8Source = sourcesData.sources.find(s => s.file.includes(".m3u8"));
        const originalUrl = m3u8Source?.file || sourcesData.sources[0].file;

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

        const proxiedUrl = `${base}/proxy?url=${encodeURIComponent(originalUrl)}`;
        const proxiedTracks = (sourcesData.tracks || []).map((t) => ({
          ...t,
          kind: t.kind || "subtitles",
          file: `${base}/proxy?url=${encodeURIComponent(t.file)}`,
        }));

        setVideoSource(proxiedUrl);
        setVideoTitle(`${anime?.title} - Episode ${normalizedEpisodeNumber}`);
        setVideoTracks(proxiedTracks);
        setVideoIntro(sourcesData.intro || null);
        setVideoOutro(sourcesData.outro || null);

        const idx = episodes.findIndex((e) => e.id === episode.id);
        if (idx !== -1) setCurrentEpisodeIndex(idx);

        toast.success(`Playing Episode ${normalizedEpisodeNumber}`);
        
        // Prefetch next episode
        if (idx !== -1 && episodes[idx + 1]) {
          const nextEpisode = episodes[idx + 1];
          const nextCacheKey = `sources_${nextEpisode.id}`;
          
          if (!animeCache.has(nextCacheKey)) {
            fetchServers({ episodeId: nextEpisode.id })
              .then((servers) => {
                const serverData = servers as { sub: Array<{ id: string; name: string }>; dub: Array<{ id: string; name: string }> };
                const hd2Server = serverData.sub?.find(s => s.name === "HD-2") || serverData.sub?.[0];
                
                if (hd2Server) {
                  return fetchSources({ serverId: hd2Server.id });
                }
              })
              .then((sources) => {
                if (sources) {
                  animeCache.set(nextCacheKey, sources, 5);
                }
              })
              .catch(() => {
                // Silent fail for prefetch
              });
          }
        }
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

  const broadcastDetails = (() => {
    if (!broadcastInfo?.day || !broadcastInfo?.time || !broadcastInfo?.timezone) {
      return null;
    }
    const normalizedDay = broadcastInfo.day.toLowerCase().replace(/s$/, "");
    const dayMap: Record<string, number> = {
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      sunday: 7,
    };
    const targetWeekday = dayMap[normalizedDay];
    if (!targetWeekday) return null;
    const [hourStr, minuteStr = "0"] = broadcastInfo.time.split(":");
    const hour = Number(hourStr);
    const minute = Number(minuteStr);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
    const zone = broadcastInfo.timezone || "UTC";
    const nowInZone = DateTime.now().setZone(zone);
    if (!nowInZone.isValid) return null;
    let next = nowInZone
      .startOf("day")
      .plus({ days: (targetWeekday - nowInZone.weekday + 7) % 7 })
      .set({ hour, minute, second: 0, millisecond: 0 });
    if (next <= nowInZone) {
      next = next.plus({ weeks: 1 });
    }
    const nextInIST = next.setZone("Asia/Kolkata");
    if (!nextInIST.isValid) return null;
    const nowInIST = DateTime.now().setZone("Asia/Kolkata");
    const diff = nextInIST.diff(nowInIST, ["days", "hours"]).shiftTo("days", "hours");
    const remainingDays = Math.max(0, Math.floor(diff.days ?? 0));
    const remainingHours = Math.max(0, Math.floor(diff.hours ?? 0));
    return {
      istLabel: `${nextInIST.weekdayLong} at ${nextInIST.toFormat("hh:mm a")} IST`,
      countdown: `${remainingDays} day${remainingDays === 1 ? "" : "s"} ${remainingHours} hour${remainingHours === 1 ? "" : "s"} remaining`,
    };
  })();

  const isBroadcastActive =
    broadcastInfo?.status === "airing" || broadcastInfo?.status === "upcoming";
  const shouldShowBroadcast = isBroadcastLoading || isBroadcastActive;

  // Removed fullscreen loader - show page immediately with inline loading states

  return (
    <div data-theme="nothing" className="min-h-screen bg-[#F5F7FB] dark:bg-[#0B0F19] text-[#050814] dark:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#1A1D24]/95 backdrop-blur-lg border-b border-black/5 dark:border-white/10">
        <div className="max-w-[2000px] mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors group"
          >
            <div className="p-2 rounded-full bg-black/5 group-hover:bg-black/10 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium tracking-widest uppercase">Back</span>
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold truncate tracking-wide text-[#050814] dark:text-white">{anime?.title || "Loading..."}</h1>
          </div>
          <Button
            onClick={handleToggleWatchlist}
            variant="outline"
            size="sm"
            className="gap-2 border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 text-[#050814] dark:text-white"
          >
            {isInWatchlist ? (
              <>
                <Check className="h-4 w-4 text-[#ff4d4f]" />
                <span className="tracking-wider">IN WATCHLIST</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span className="tracking-wider">ADD TO LIST</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-28 md:pt-24 px-4 md:px-6 pb-10 max-w-[2000px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          {/* Left: Anime Info and Video Player */}
          <div className="space-y-8 mt-8 md:mt-0">
            {/* Anime Info */}
            <div className="bg-white dark:bg-[#1A1D24] border border-black/5 dark:border-white/10 rounded-[24px] p-8 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                <h1 className="text-9xl font-bold tracking-tighter text-black dark:text-white">NOTHING</h1>
              </div>
              
              <div className="flex flex-col md:flex-row gap-8 relative z-10">
                {anime?.image && (
                  <div className="shrink-0">
                    <img
                      src={anime.image}
                      alt={anime.title}
                      className="w-40 h-60 object-cover rounded-2xl shadow-lg border border-black/5"
                    />
                  </div>
                )}
                <div className="flex-1 space-y-6">
                  <div>
                    <h2 className="text-4xl font-bold mb-3 tracking-tight leading-tight text-[#050814] dark:text-white">{anime?.title || "Unknown Title"}</h2>
                    <div className="flex items-center gap-3 flex-wrap">
                      {anime?.type && (
                        <span className="px-3 py-1 rounded-full border border-black/10 dark:border-white/20 text-xs font-medium tracking-wider uppercase text-black/60 dark:text-white/60">
                          {anime.type}
                        </span>
                      )}
                      {anime?.language?.sub && (
                        <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-xs font-medium tracking-wider uppercase text-black/80 dark:text-white/80">
                          SUB
                        </span>
                      )}
                      {anime?.language?.dub && (
                        <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-xs font-medium tracking-wider uppercase text-black/80 dark:text-white/80">
                          DUB
                        </span>
                      )}
                      {episodes.length > 0 && (
                        <span className="px-3 py-1 rounded-full border border-[#ff4d4f]/30 text-[#ff4d4f] text-xs font-medium tracking-wider uppercase">
                          {episodes.length} Episodes
                        </span>
                      )}
                    </div>
                  </div>

                  {episodes.length > 0 && (
                    <Button
                      onClick={() => playEpisode(episodes[0])}
                      className="nothing-play-cta h-14 px-8 rounded-full bg-[#ff4d4f] text-white hover:bg-[#ff4d4f]/90 transition-all text-base font-bold tracking-wide shadow-lg shadow-[#ff4d4f]/20"
                      disabled={episodes.length === 0}
                    >
                      <Play className="mr-2 h-5 w-5 fill-white" />
                      START WATCHING
                    </Button>
                  )}

                  {shouldShowBroadcast && (
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 max-w-md">
                      <div className="p-2 rounded-full bg-[#ff4d4f]/10 dark:bg-[#ff4d4f]/20 text-[#ff4d4f]">
                        <Clock3 className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        {isBroadcastLoading ? (
                          <span className="text-sm text-black/60 dark:text-white/60">Syncing broadcast data...</span>
                        ) : (
                          <div className="space-y-1">
                            <span className="block text-xs font-bold tracking-[0.2em] text-black/40 dark:text-white/40 uppercase">
                              Next Broadcast
                            </span>
                            <span className="block font-medium text-[#050814] dark:text-white">
                              {broadcastDetails?.istLabel ?? broadcastInfo?.summary ?? "TBA"}
                            </span>
                            {broadcastDetails?.countdown && (
                              <span className="block text-sm text-[#ff4d4f]">
                                {broadcastDetails.countdown}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Video Player - Only shown when episode is playing */}
            {videoSource && currentEpisodeData && (
              <div id="video-player-container">
                <NothingVideoPlayerV2
                  source={videoSource}
                  title={videoTitle}
                  tracks={videoTracks}
                  intro={videoIntro}
                  outro={videoOutro}
                  onClose={() => setVideoSource(null)}
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
                  onNext={() => {
                    if (currentEpisodeIndex === null) return;
                    const next = episodes[currentEpisodeIndex + 1];
                    if (next) playEpisode(next);
                  }}
                  nextTitle={
                    currentEpisodeIndex !== null && episodes[currentEpisodeIndex + 1]
                      ? `${anime?.title} • Ep ${episodes[currentEpisodeIndex + 1].number ?? "?"}`
                      : undefined
                  }
                />
              </div>
            )}
          </div>

          {/* Right: Episode List */}
          <div className="bg-white dark:bg-[#1A1D24] border border-black/5 dark:border-white/10 rounded-[24px] p-6 h-fit max-h-[calc(100vh-120px)] overflow-y-auto flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-white dark:bg-[#1A1D24] z-10 py-2">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/40">Episodes</h3>
              <span className="text-xs font-mono text-black/30 dark:text-white/30">{episodes.length} TOTAL</span>
            </div>
            
            {episodesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-[#ff4d4f]/20 border-t-[#ff4d4f] rounded-full animate-spin" />
                  <p className="text-sm text-black/40 dark:text-white/40 tracking-wider uppercase">Loading episodes...</p>
                </div>
              </div>
            ) : episodesWithProgress.length > 0 ? (
              <div className="space-y-3">
                {episodesWithProgress.map((ep) => {
                  const progressPercentage =
                    ep.currentTime && ep.duration ? (ep.currentTime / ep.duration) * 100 : 0;
                  const isCurrentEpisode = currentEpisodeData?.id === ep.id;

                  return (
                    <button
                      key={ep.id}
                      onClick={() => playEpisode(ep)}
                      className={`group relative w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                        isCurrentEpisode 
                          ? "bg-[#ff4d4f]/5 dark:bg-[#ff4d4f]/10 border-[#ff4d4f] shadow-[0_0_20px_rgba(255,77,79,0.1)]" 
                          : "bg-black/5 dark:bg-white/5 border-transparent hover:bg-black/10 dark:hover:bg-white/10 hover:border-black/10 dark:hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-4 relative z-10">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full font-mono text-sm font-bold ${
                          isCurrentEpisode ? "bg-[#ff4d4f] text-white" : "bg-white dark:bg-[#2A2F3A] text-black/40 dark:text-white/40 group-hover:text-black dark:group-hover:text-white shadow-sm"
                        }`}>
                          {ep.number ?? "#"}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate ${isCurrentEpisode ? "text-[#ff4d4f]" : "text-[#050814] dark:text-white group-hover:text-black dark:group-hover:text-white"}`}>
                            {ep.title || `Episode ${ep.number ?? "?"}`}
                          </p>
                          <p className="text-xs text-black/40 dark:text-white/40 font-mono mt-0.5">
                            EP {ep.number ?? "?"}
                          </p>
                        </div>

                        {isCurrentEpisode ? (
                          <div className="w-2 h-2 rounded-full bg-[#ff4d4f] animate-pulse" />
                        ) : (
                          <Play className="h-4 w-4 text-black/0 dark:text-white/0 group-hover:text-black/40 dark:group-hover:text-white/40 transition-all transform translate-x-2 group-hover:translate-x-0" />
                        )}
                      </div>

                      {progressPercentage > 0 && (
                        <div className="absolute inset-x-5 bottom-3 pointer-events-none">
                          <div className="h-1 rounded-full bg-[#ff4d4f]/15 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#ff4d4f] transition-all"
                              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-black/20 dark:text-white/20">
                <div className="w-12 h-12 rounded-full border border-dashed border-black/10 dark:border-white/10 flex items-center justify-center mb-4">
                  <Film className="h-6 w-6" />
                </div>
                <p className="text-sm tracking-widest uppercase">No episodes found</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}