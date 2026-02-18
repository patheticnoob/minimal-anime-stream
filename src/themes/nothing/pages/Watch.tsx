import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useDataFlow } from "@/hooks/use-data-flow";
import { NothingVideoPlayerV2 } from "../components/NothingVideoPlayerV2";
import { type BroadcastInfo } from "@/types/broadcast";
import { DateTime } from "luxon";
import { animeCache } from "@/lib/anime-cache";
import { useNothingTheme } from "../hooks/useNothingTheme";
import { useGamepad, GAMEPAD_BUTTONS } from "@/hooks/use-gamepad";
import { NothingWatchHeader } from "../components/NothingWatchHeader";
import { NothingAnimeInfo } from "../components/NothingAnimeInfo";
import { NothingEpisodeList } from "../components/NothingEpisodeList";
import { fetchHianimeAnimeDetails, fetchHianimeEpisodes } from "@/lib/external-api-v2";

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
  const { isDarkMode, toggleTheme } = useNothingTheme();
  const { dataFlow } = useDataFlow();
  const { buttonPressed } = useGamepad();

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
  const [initialResumeTime, setInitialResumeTime] = useState<number>(0);
  const [broadcastInfo, setBroadcastInfo] = useState<BroadcastInfo | null>(null);
  const [isBroadcastLoading, setIsBroadcastLoading] = useState(false);

  // Audio preference state (sub/dub)
  const [audioPreference, setAudioPreference] = useState<"sub" | "dub">(() => {
    const saved = localStorage.getItem("audioPreference");
    return (saved === "sub" || saved === "dub") ? saved : "sub";
  });

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

  // Save audio preference to localStorage
  const handleAudioPreferenceChange = (preference: "sub" | "dub") => {
    setAudioPreference(preference);
    localStorage.setItem("audioPreference", preference);
    toast.success(`Switched to ${preference.toUpperCase()}`);
  };

  // Load anime data from URL params or localStorage
  useEffect(() => {
    if (!animeId) {
      navigate("/");
      return;
    }

    const storedAnime = localStorage.getItem(`anime_${animeId}`);
    if (storedAnime) {
      try {
        const parsedAnime = JSON.parse(storedAnime);
        setAnime(parsedAnime);

        console.log('[Watch] Loaded anime data:', {
          id: parsedAnime.id,
          title: parsedAnime.title,
          hasV2Data: !!(parsedAnime.genres || parsedAnime.synopsis || parsedAnime.malScore),
          dataFlow
        });

        // If v2 is selected and we don't have rich data, fetch from Hianime API
        if (dataFlow === "v2" && !parsedAnime.genres && !parsedAnime.synopsis && animeId) {
          console.log('[Watch] Fetching rich v2 anime details from Hianime API');
          fetchHianimeAnimeDetails(animeId)
            .then((richData) => {
              if (richData) {
                const mergedData = { ...parsedAnime, ...richData };
                setAnime(mergedData);
                // Update localStorage with rich data
                localStorage.setItem(`anime_${animeId}`, JSON.stringify(mergedData));
                console.log('[Watch] Updated anime with v2 rich data:', {
                  genres: richData.genres,
                  synopsis: richData.synopsis?.substring(0, 50),
                  malScore: richData.malScore,
                  rating: richData.rating,
                  studios: richData.studios,
                  producers: richData.producers
                });
              }
            })
            .catch((err) => {
              console.warn('[Watch] Failed to fetch v2 anime details:', err);
            });
        }
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
        if (normalizedEpisodes.length > 0) {
          prefetchEpisodeSources(normalizedEpisodes);
      }
      
      // Lazy load broadcast info after episodes are ready (non-critical)
      if (storedAnime) {
        try {
          const parsedAnime = JSON.parse(storedAnime);
          if (parsedAnime?.title) {
            setTimeout(() => {
              loadBroadcastInfo(parsedAnime.title);
            }, 500);
          }
        } catch (err) {
          console.error("Failed to parse stored anime for broadcast info:", err);
        }
      }
      
      return; // Exit early - no need to fetch
    }

    // Only fetch if not in cache
    setEpisodesLoading(true);

    // Use v2 API if dataFlow is v2, otherwise use v1 Convex API
    const fetchPromise = dataFlow === "v2"
      ? fetchHianimeEpisodes(animeId).then((hianimeEps) => {
          // Convert Hianime episodes to our Episode format
          return hianimeEps.map((ep) => ({
            id: ep.id,
            title: ep.title,
            number: ep.episodeNumber,
          }));
        })
      : fetchEpisodes({ dataId: animeId }).then((eps) => eps as Episode[]);

    fetchPromise
      .then((eps) => {
        const normalizedEpisodes = eps.map((ep) => ({
          ...ep,
          number: normalizeEpisodeNumber(ep.number),
        }));
        setEpisodes(normalizedEpisodes);

        // Cache episodes for 10 minutes
        animeCache.set(cacheKey, eps, 10);

        // Prefetch first or last watched episode
        if (normalizedEpisodes.length > 0) {
          prefetchEpisodeSources(normalizedEpisodes);
        }
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Failed to load episodes.";
        toast.error(msg);
        console.error('[Watch] Error loading episodes:', err);
      })
      .finally(() => setEpisodesLoading(false));

    // Lazy load broadcast info (non-critical data)
    if (storedAnime) {
      try {
        const parsedAnime = JSON.parse(storedAnime);
        if (parsedAnime?.title) {
          setTimeout(() => {
            loadBroadcastInfo(parsedAnime.title);
          }, 500);
        }
      } catch (err) {
        console.error("Failed to parse stored anime for broadcast info:", err);
      }
    }
  }, [animeId, fetchEpisodes, navigate, dataFlow]);

  // Helper function to prefetch episode sources
  const prefetchEpisodeSources = async (normalizedEpisodes: Episode[]) => {
    // Determine which episode to prefetch (last watched or first)
    const targetEpisode = animeProgress?.episodeId
      ? normalizedEpisodes.find(ep => ep.id === animeProgress.episodeId)
      : normalizedEpisodes[0];

    if (!targetEpisode) return;

    const cacheKey = `sources_${targetEpisode.id}_${audioPreference}`;
    if (animeCache.has(cacheKey)) return;

    try {
      const servers = await fetchServers({ episodeId: targetEpisode.id });
      const serverData = servers as { sub: Array<{ id: string; name: string }>; dub: Array<{ id: string; name: string }> };

      const targetServers = audioPreference === "sub" ? serverData.sub : serverData.dub;
      const hd2Server = targetServers?.find(s => s.name === "HD-2") || targetServers?.[0];

      if (hd2Server) {
        const sources = await fetchSources({ serverId: hd2Server.id });
        const sourcesData = sources as {
          sources: Array<{ file: string; type: string }>;
          tracks?: Array<{ file: string; label: string; kind?: string }>;
          intro?: { start: number; end: number };
          outro?: { start: number; end: number };
        };

        // If dub is selected, also fetch subtitles from sub server
        let finalTracks = sourcesData.tracks || [];
        if (audioPreference === "dub") {
          try {
            const subServers = serverData.sub;
            if (subServers && subServers.length > 0) {
              const subHd2Server = subServers.find(s => s.name === "HD-2") || subServers[0];
              if (subHd2Server) {
                const subSources = await fetchSources({ serverId: subHd2Server.id });
                const subSourcesData = subSources as {
                  tracks?: Array<{ file: string; label: string; kind?: string }>;
                };
                if (subSourcesData.tracks && subSourcesData.tracks.length > 0) {
                  finalTracks = subSourcesData.tracks;
                }
              }
            }
          } catch (err) {
            console.warn('Failed to fetch subtitles from sub server during prefetch:', err);
          }
        }

        // Cache with merged subtitles if dub
        const cacheData = { ...sourcesData, tracks: finalTracks };
        animeCache.set(cacheKey, cacheData, 5);

        // Also prefetch next episode
        const targetIndex = normalizedEpisodes.findIndex(ep => ep.id === targetEpisode.id);
        if (targetIndex !== -1 && normalizedEpisodes[targetIndex + 1]) {
          const nextEpisode = normalizedEpisodes[targetIndex + 1];
          const nextCacheKey = `sources_${nextEpisode.id}_${audioPreference}`;

          if (!animeCache.has(nextCacheKey)) {
            const nextServers = await fetchServers({ episodeId: nextEpisode.id });
            const nextServerData = nextServers as { sub: Array<{ id: string; name: string }>; dub: Array<{ id: string; name: string }> };
            const nextTargetServers = audioPreference === "sub" ? nextServerData.sub : nextServerData.dub;
            const nextHd2Server = nextTargetServers?.find(s => s.name === "HD-2") || nextTargetServers?.[0];

            if (nextHd2Server) {
              const nextSources = await fetchSources({ serverId: nextHd2Server.id });
              const nextSourcesData = nextSources as {
                sources: Array<{ file: string; type: string }>;
                tracks?: Array<{ file: string; label: string; kind?: string }>;
                intro?: { start: number; end: number };
                outro?: { start: number; end: number };
              };

              // If dub is selected, also fetch subtitles from sub server for next episode
              let nextFinalTracks = nextSourcesData.tracks || [];
              if (audioPreference === "dub") {
                try {
                  const nextSubServers = nextServerData.sub;
                  if (nextSubServers && nextSubServers.length > 0) {
                    const nextSubHd2Server = nextSubServers.find(s => s.name === "HD-2") || nextSubServers[0];
                    if (nextSubHd2Server) {
                      const nextSubSources = await fetchSources({ serverId: nextSubHd2Server.id });
                      const nextSubSourcesData = nextSubSources as {
                        tracks?: Array<{ file: string; label: string; kind?: string }>;
                      };
                      if (nextSubSourcesData.tracks && nextSubSourcesData.tracks.length > 0) {
                        nextFinalTracks = nextSubSourcesData.tracks;
                      }
                    }
                  }
                } catch (err) {
                  console.warn('Failed to fetch subtitles from sub server during next episode prefetch:', err);
                }
              }

              const nextCacheData = { ...nextSourcesData, tracks: nextFinalTracks };
              animeCache.set(nextCacheKey, nextCacheData, 5);
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

    // Calculate and store the initial resume time for this episode ONCE
    const shouldResume =
      animeProgress &&
      animeProgress.episodeId === episode.id &&
      animeProgress.currentTime > 0 &&
      animeProgress.duration > 0;

    const resumeTime = shouldResume ? animeProgress.currentTime : 0;
    setInitialResumeTime(resumeTime);

    console.log('🎬 Loading episode:', {
      episodeId: episode.id,
      savedEpisodeId: animeProgress?.episodeId,
      shouldResume,
      resumeTime
    });

    // DON'T set videoSource to null - keep player mounted for seamless transitions
    // Only clear intro/outro to prepare for new episode
    setVideoIntro(null);
    setVideoOutro(null);

    // Auto-scroll to video player on first play only
    if (!videoSource) {
      setTimeout(() => {
        const playerContainer = document.getElementById('video-player-container');
        if (playerContainer) {
          playerContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }

    // Check cache first
    const cacheKey = `sources_${episode.id}_${audioPreference}`;
    const cachedSources = animeCache.get<any>(cacheKey);

    if (cachedSources) {
      // Use cached sources immediately (already has merged subtitles if dub)
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
        setVideoTitle(`${anime?.title} - Episode ${normalizedEpisodeNumber} (${audioPreference.toUpperCase()})`);
        setVideoTracks(proxiedTracks);
        setVideoIntro(sourcesData.intro || null);
        setVideoOutro(sourcesData.outro || null);

        const idx = episodes.findIndex((e) => e.id === episode.id);
        if (idx !== -1) setCurrentEpisodeIndex(idx);

        toast.success(`Playing Episode ${normalizedEpisodeNumber} (${audioPreference.toUpperCase()})`);

        // Prefetch next episode
        if (idx !== -1 && episodes[idx + 1]) {
          const nextEpisode = episodes[idx + 1];
          const nextCacheKey = `sources_${nextEpisode.id}_${audioPreference}`;

          if (!animeCache.has(nextCacheKey)) {
            fetchServers({ episodeId: nextEpisode.id })
              .then((servers) => {
                const serverData = servers as { sub: Array<{ id: string; name: string }>; dub: Array<{ id: string; name: string }> };
                const targetServers = audioPreference === "sub" ? serverData.sub : serverData.dub;
                const hd2Server = targetServers?.find(s => s.name === "HD-2") || targetServers?.[0];

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

      // Select servers based on audio preference
      const targetServers = audioPreference === "sub" ? serverData.sub : serverData.dub;

      if (!targetServers || targetServers.length === 0) {
        toast.error(`No ${audioPreference.toUpperCase()} servers available for this episode`);
        return;
      }

      const hd2Server = targetServers.find(s => s.name === "HD-2") || targetServers[0];

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

      // If dub is selected, always fetch subtitles from sub server (dub never has subtitles)
      let finalTracks = sourcesData.tracks || [];
      if (audioPreference === "dub") {
        try {
          const subServers = serverData.sub;
          if (subServers && subServers.length > 0) {
            const subHd2Server = subServers.find(s => s.name === "HD-2") || subServers[0];
            if (subHd2Server) {
              const subSources = await fetchSources({ serverId: subHd2Server.id });
              const subSourcesData = subSources as {
                tracks?: Array<{ file: string; label: string; kind?: string }>;
              };
              if (subSourcesData.tracks && subSourcesData.tracks.length > 0) {
                finalTracks = subSourcesData.tracks;
              }
            }
          }
        } catch (err) {
          console.warn('Failed to fetch subtitles from sub server:', err);
        }
      }

      // Cache the sources with audio preference (with merged subtitles if dub)
      const cacheData = { ...sourcesData, tracks: finalTracks };
      animeCache.set(cacheKey, cacheData, 5);

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
        const proxiedTracks = finalTracks.map((t) => ({
          ...t,
          kind: t.kind || "subtitles",
          file: `${base}/proxy?url=${encodeURIComponent(t.file)}`,
        }));

        setVideoSource(proxiedUrl);
        setVideoTitle(`${anime?.title} - Episode ${normalizedEpisodeNumber} (${audioPreference.toUpperCase()})`);
        setVideoTracks(proxiedTracks);
        setVideoIntro(sourcesData.intro || null);
        setVideoOutro(sourcesData.outro || null);

        const idx = episodes.findIndex((e) => e.id === episode.id);
        if (idx !== -1) setCurrentEpisodeIndex(idx);

        toast.success(`Playing Episode ${normalizedEpisodeNumber} (${audioPreference.toUpperCase()})`);

        // Prefetch next episode
        if (idx !== -1 && episodes[idx + 1]) {
          const nextEpisode = episodes[idx + 1];
          const nextCacheKey = `sources_${nextEpisode.id}_${audioPreference}`;

          if (!animeCache.has(nextCacheKey)) {
            fetchServers({ episodeId: nextEpisode.id })
              .then((servers) => {
                const serverData = servers as { sub: Array<{ id: string; name: string }>; dub: Array<{ id: string; name: string }> };
                const targetServers = audioPreference === "sub" ? serverData.sub : serverData.dub;
                const hd2Server = targetServers?.find(s => s.name === "HD-2") || targetServers?.[0];

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
        language: currentAnimeInfo.language,
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

  // D-pad scrolling for episode list
  useEffect(() => {
    if (buttonPressed === null || videoSource) return; // Don't scroll when video is playing

    const episodeListContainer = document.getElementById('episode-list-container');
    if (!episodeListContainer) return;

    switch (buttonPressed) {
      case GAMEPAD_BUTTONS.DPAD_UP:
        episodeListContainer.scrollBy({ top: -200, behavior: 'smooth' });
        break;
      case GAMEPAD_BUTTONS.DPAD_DOWN:
        episodeListContainer.scrollBy({ top: 200, behavior: 'smooth' });
        break;
    }
  }, [buttonPressed, videoSource]);

  return (
    <div data-theme="nothing" className="min-h-screen bg-[#F5F7FB] dark:bg-[#0B0F19] text-[#050814] dark:text-white transition-colors duration-300">
      <NothingWatchHeader 
        title={anime?.title}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isInWatchlist={!!isInWatchlist}
        onToggleWatchlist={handleToggleWatchlist}
      />

      {/* Main Content */}
      <main className="pt-28 md:pt-24 px-4 md:px-6 pb-10 max-w-[2000px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          {/* Left: Anime Info and Video Player */}
          <div className="space-y-8 mt-8 md:mt-0">
            <NothingAnimeInfo 
              anime={anime}
              episodeCount={episodes.length}
              onPlayFirst={() => episodes.length > 0 && playEpisode(episodes[0])}
              broadcastInfo={broadcastInfo}
              broadcastDetails={broadcastDetails}
              isBroadcastLoading={isBroadcastLoading}
              shouldShowBroadcast={shouldShowBroadcast}
              audioPreference={audioPreference}
              onAudioPreferenceChange={handleAudioPreferenceChange}
            />

            {/* Video Player - Only shown when episode is playing */}
            {videoSource && currentEpisodeData && (
              <div id="video-player-container">
                <NothingVideoPlayerV2
                  key={currentEpisodeData.id}
                  source={videoSource}
                  title={videoTitle}
                  tracks={videoTracks}
                  intro={videoIntro}
                  outro={videoOutro}
                  onClose={() => {
                    setVideoSource(null);
                    setInitialResumeTime(0);
                  }}
                  resumeFrom={initialResumeTime}
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
          <div className="space-y-6">
            <NothingEpisodeList 
              episodes={episodesWithProgress}
              episodesLoading={episodesLoading}
              currentEpisodeId={currentEpisodeData?.id}
              onPlayEpisode={playEpisode}
            />
          </div>
        </div>
      </main>
    </div>
  );
}