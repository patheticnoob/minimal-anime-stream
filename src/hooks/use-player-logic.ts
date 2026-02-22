import { useState, useCallback, useEffect } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { AnimeItem, Episode, AnimePlaybackInfo } from "@/shared/types";
import { animeCache } from "@/lib/anime-cache";

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

export function usePlayerLogic(isAuthenticated: boolean, dataFlow: string = "v1") {
  const fetchEpisodes = useAction(api.hianime.episodes);
  const fetchServers = useAction(api.hianime.episodeServers);
  const fetchSources = useAction(api.hianime.episodeSources);
  const fetchGojoEpisodes = useAction(api.gojoApi.getEpisodes);
  const fetchGojoStream = useAction(api.gojoApi.getStream);
  
  const saveProgress = useMutation(api.watchProgress.saveProgress);

  const [selected, setSelected] = useState<AnimeItem | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [videoSource, setVideoSource] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [videoTracks, setVideoTracks] = useState<Array<{ file: string; label: string; kind?: string }>>([]);
  const [videoIntro, setVideoIntro] = useState<{ start: number; end: number } | null>(null);
  const [videoOutro, setVideoOutro] = useState<{ start: number; end: number } | null>(null);
  const [videoHeaders, setVideoHeaders] = useState<Record<string, string> | null>(null);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState<number | null>(null);
  const [currentEpisodeData, setCurrentEpisodeData] = useState<Episode | null>(null);
  const [lastSelectedAnime, setLastSelectedAnime] = useState<AnimeItem | null>(null);
  const [currentAnimeInfo, setCurrentAnimeInfo] = useState<AnimePlaybackInfo | null>(null);
  const [animeDetails, setAnimeDetails] = useState<Partial<AnimeItem> | null>(null);
  const [subtitlesLoading, setSubtitlesLoading] = useState(false);
  const [subtitlesError, setSubtitlesError] = useState<string | null>(null);
  
  // Audio preference state (sub/dub)
  const [audioPreference, setAudioPreference] = useState<"sub" | "dub">(() => {
    const saved = localStorage.getItem("audioPreference");
    return (saved === "sub" || saved === "dub") ? saved : "sub";
  });

  const animeProgress = useQuery(
    api.watchProgress.getProgress,
    selected?.dataId ? { animeId: selected.dataId } : "skip"
  );

  // Save audio preference to localStorage
  const handleAudioPreferenceChange = (preference: "sub" | "dub") => {
    setAudioPreference(preference);
    localStorage.setItem("audioPreference", preference);
    toast.success(`Switched to ${preference.toUpperCase()}`);
  };

  // Validate subtitle tracks by attempting to fetch and parse them
  const validateSubtitleTracks = async (tracks: Array<{ file: string; label: string; kind?: string }>, retryCount = 0): Promise<boolean> => {
    if (!tracks || tracks.length === 0) {
      return true;
    }

    const maxRetries = 2;
    
    try {
      const testTrack = tracks[0];
      const response = await fetch(testTrack.file, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(3000)
      });
      
      if (!response.ok) {
        throw new Error(`Subtitle fetch failed: ${response.status}`);
      }
      
      return true;
    } catch (err) {
      console.warn(`Subtitle validation failed (attempt ${retryCount + 1}/${maxRetries + 1}):`, err);
      
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retryCount)));
        return validateSubtitleTracks(tracks, retryCount + 1);
      }
      
      return false;
    }
  };

  // Prefetch episode sources for faster playback
  const prefetchEpisodeSources = useCallback(async (episodeId: string) => {
    const cacheKey = `sources_${episodeId}_${audioPreference}`;
    if (animeCache.has(cacheKey)) return;

    if (dataFlow === "v5") {
      // Gojo stream prefetch
      try {
        const result = await fetchGojoStream({ episodeId, server: "hd-2", type: audioPreference });
        if (result?.success && result?.data) {
          animeCache.set(cacheKey, result.data, 5);
        }
      } catch (err) {
        console.warn('Gojo prefetch failed for episode:', episodeId, err);
      }
      return;
    }

    try {
      const servers = await fetchServers({ episodeId });
      const serverData = servers as { sub: Array<{ id: string; name: string }>; dub: Array<{ id: string; name: string }> };

      const targetServers = audioPreference === "sub" ? serverData.sub : serverData.dub;
      const hd2Server = targetServers?.find(s => s.name === "HD-2") || targetServers?.[0];

      if (hd2Server) {
        const sources = await fetchSources({ serverId: hd2Server.id });
        const sourcesData = sources as {
          sources: Array<{ file: string; type: string }>;
          tracks?: Array<{ file: string; label: string; kind?: string; default?: boolean }>;
          intro?: { start: number; end: number };
          outro?: { start: number; end: number };
          headers?: Record<string, string>;
        };

        let finalTracks = sourcesData.tracks || [];
        if (audioPreference === "dub") {
          try {
            const subServers = serverData.sub;
            if (subServers && subServers.length > 0) {
              const subHd2Server = subServers.find(s => s.name === "HD-2") || subServers[0];
              if (subHd2Server) {
                const subSources = await fetchSources({ serverId: subHd2Server.id });
                const subSourcesData = subSources as {
                  tracks?: Array<{ file: string; label: string; kind?: string; default?: boolean }>;
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

        const cacheData = { ...sourcesData, tracks: finalTracks };
        animeCache.set(cacheKey, cacheData, 5);
      }
    } catch (err) {
      console.warn('Prefetch failed for episode:', episodeId, err);
    }
  }, [fetchServers, fetchSources, fetchGojoStream, audioPreference, dataFlow]);

  useEffect(() => {
    if (!selected?.dataId) {
      setEpisodes([]);
      setEpisodesLoading(false);
      return;
    }

    const cacheKey = `episodes_${selected.dataId}_${dataFlow}`;
    const cachedEpisodes = animeCache.get<Episode[]>(cacheKey);
    
    if (cachedEpisodes) {
      const normalizedEpisodes = cachedEpisodes.map((ep) => ({
        ...ep,
        number: normalizeEpisodeNumber(ep.number),
      }));
      setEpisodes(normalizedEpisodes);
      setEpisodesLoading(false);
      
      if (normalizedEpisodes.length > 0) {
        const targetEpisode = animeProgress?.episodeId 
          ? normalizedEpisodes.find(ep => ep.id === animeProgress.episodeId)
          : normalizedEpisodes[0];
        
        if (targetEpisode) {
          prefetchEpisodeSources(targetEpisode.id);
          
          const targetIndex = normalizedEpisodes.findIndex(ep => ep.id === targetEpisode.id);
          if (targetIndex !== -1 && normalizedEpisodes[targetIndex + 1]) {
            prefetchEpisodeSources(normalizedEpisodes[targetIndex + 1].id);
          }
        }
      }
      
      return;
    }

    let cancelled = false;
    let retryCount = 0;
    const maxRetries = 3;
    setEpisodesLoading(true);

    const fetchWithRetry = async () => {
      try {
        let eps: Episode[];

        if (dataFlow === "v5") {
          // Gojo episodes: returns { success, data: GojoEpisode[] }
          const result = await fetchGojoEpisodes({ animeId: selected.dataId! });
          const gojoData = result as { success: boolean; data: Array<{ id: string; title: string; episodeNumber: number; isFiller: boolean }> };
          if (!gojoData.success || !gojoData.data) {
            throw new Error("Gojo episodes returned no data");
          }
          eps = gojoData.data.map((ep) => ({
            id: ep.id,
            title: ep.title,
            number: ep.episodeNumber,
            isFiller: ep.isFiller,
          }));
        } else {
          eps = await fetchEpisodes({ dataId: selected.dataId! }) as Episode[];
        }

        if (cancelled) return;
        
        const normalizedEpisodes = eps.map((ep) => ({
          ...ep,
          number: normalizeEpisodeNumber(ep.number),
        }));
        setEpisodes(normalizedEpisodes);
        setCurrentEpisodeIndex(null);
        
        animeCache.set(cacheKey, normalizedEpisodes, 10);
        
        if (normalizedEpisodes.length > 0) {
          const targetEpisode = animeProgress?.episodeId 
            ? normalizedEpisodes.find(ep => ep.id === animeProgress.episodeId)
            : normalizedEpisodes[0];
          
          if (targetEpisode) {
            prefetchEpisodeSources(targetEpisode.id);
            
            const targetIndex = normalizedEpisodes.findIndex(ep => ep.id === targetEpisode.id);
            if (targetIndex !== -1 && normalizedEpisodes[targetIndex + 1]) {
              prefetchEpisodeSources(normalizedEpisodes[targetIndex + 1].id);
            }
          }
        }
      } catch (err) {
        if (cancelled) return;
        
        console.error('Failed to fetch episodes:', err);
        
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying episode fetch (${retryCount}/${maxRetries})...`);
          const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry();
        }
        
        toast.error("Unable to load episodes. Please try again.");
        setEpisodes([]);
      } finally {
        if (!cancelled) {
          setEpisodesLoading(false);
        }
      }
    };

    fetchWithRetry();

    return () => {
      cancelled = true;
    };
  }, [selected?.dataId, fetchEpisodes, fetchGojoEpisodes, animeProgress?.episodeId, prefetchEpisodeSources, dataFlow]);

  const playEpisodeV5 = async (episode: Episode, normalizedEpisodeNumber: number, retryCount = 0) => {
    const maxRetries = 3;
    const cacheKey = `sources_${episode.id}_${audioPreference}`;
    const cachedData = animeCache.get<any>(cacheKey);

    const processGojoStreamData = async (streamData: any) => {
      const hlsUrl = streamData.link?.file;
      if (!hlsUrl) {
        toast.error("No video source available");
        setSubtitlesLoading(false);
        return;
      }

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

      const proxiedUrl = `${base}/proxy?url=${encodeURIComponent(hlsUrl)}`;

      const rawTracks = (streamData.tracks || []) as Array<{ file: string; label?: string; kind?: string; default?: boolean }>;
      const subtitleTracks = rawTracks.filter(t => t.kind !== "thumbnails");
      const proxiedTracks = subtitleTracks.map((t) => ({
        ...t,
        label: t.label || "Unknown",
        kind: t.kind || "subtitles",
        file: `${base}/proxy?url=${encodeURIComponent(t.file)}`,
        default: t.default || false,
      }));

      const subtitlesValid = await validateSubtitleTracks(proxiedTracks);
      if (!subtitlesValid && proxiedTracks.length > 0) {
        setSubtitlesError("Subtitles failed to load");
        toast.warning("Subtitles may not be available for this episode");
      }

      setVideoSource(proxiedUrl);
      setVideoTitle(`${selected?.title} - Episode ${normalizedEpisodeNumber} (${audioPreference.toUpperCase()})`);
      setVideoTracks(proxiedTracks);
      setVideoIntro(streamData.intro || null);
      setVideoOutro(streamData.outro || null);
      setVideoHeaders(null);
      setSubtitlesLoading(false);

      const idx = episodes.findIndex((e) => e.id === episode.id);
      if (idx !== -1) setCurrentEpisodeIndex(idx);

      toast.success(`Playing Episode ${normalizedEpisodeNumber} (${audioPreference.toUpperCase()})`);

      if (idx !== -1 && episodes[idx + 1]) {
        prefetchEpisodeSources(episodes[idx + 1].id);
      }
    };

    if (cachedData) {
      await processGojoStreamData(cachedData);
      return;
    }

    try {
      const result = await fetchGojoStream({ episodeId: episode.id, server: "hd-2", type: audioPreference });
      const streamResult = result as { success: boolean; data: any };

      if (!streamResult.success || !streamResult.data) {
        // If dub not available, fallback to sub
        if (audioPreference === "dub") {
          toast.warning("DUB not available, falling back to SUB");
          const subResult = await fetchGojoStream({ episodeId: episode.id, server: "hd-2", type: "sub" });
          const subStreamResult = subResult as { success: boolean; data: any };
          if (subStreamResult.success && subStreamResult.data) {
            animeCache.set(cacheKey, subStreamResult.data, 5);
            await processGojoStreamData(subStreamResult.data);
            return;
          }
        }
        toast.error("No video sources available");
        setSubtitlesLoading(false);
        return;
      }

      animeCache.set(cacheKey, streamResult.data, 5);
      await processGojoStreamData(streamResult.data);
    } catch (err) {
      console.error('Failed to load Gojo stream:', err);
      
      if (retryCount < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return playEpisodeV5(episode, normalizedEpisodeNumber, retryCount + 1);
      }
      
      toast.error("Unable to load video. Please try again.");
      setSubtitlesLoading(false);
    }
  };

  const playEpisode = async (episode: Episode, retryCount = 0) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to watch");
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
    setCurrentEpisodeData(normalizedEpisode);
    setSubtitlesLoading(true);
    setSubtitlesError(null);

    setVideoIntro(null);
    setVideoOutro(null);
    setVideoHeaders(null);

    // V5 (Gojo) streaming path
    if (dataFlow === "v5") {
      await playEpisodeV5(episode, normalizedEpisodeNumber, retryCount);
      return;
    }

    // Original HiAnime streaming path (v1-v4)
    const cacheKey = `sources_${episode.id}_${audioPreference}`;
    const cachedSources = animeCache.get<any>(cacheKey);

    if (cachedSources) {
      const sourcesData = cachedSources;

      if (sourcesData.sources && sourcesData.sources.length > 0) {
        setVideoHeaders(sourcesData.headers || null);
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
          default: t.default || false,
        }));

        const subtitlesValid = await validateSubtitleTracks(proxiedTracks);
        
        if (!subtitlesValid && proxiedTracks.length > 0) {
          setSubtitlesError("Subtitles failed to load");
          toast.warning("Subtitles may not be available for this episode");
        }

        setVideoSource(proxiedUrl);
        setVideoTitle(`${selected?.title} - Episode ${normalizedEpisodeNumber} (${audioPreference.toUpperCase()})`);
        setVideoTracks(proxiedTracks);
        setVideoIntro(sourcesData.intro || null);
        setVideoOutro(sourcesData.outro || null);
        setSubtitlesLoading(false);

        const idx = episodes.findIndex((e) => e.id === episode.id);
        if (idx !== -1) setCurrentEpisodeIndex(idx);

        toast.success(`Playing Episode ${normalizedEpisodeNumber} (${audioPreference.toUpperCase()})`);

        if (idx !== -1 && episodes[idx + 1]) {
          prefetchEpisodeSources(episodes[idx + 1].id);
        }

        return;
      }
    }
    
    const maxRetries = 3;
    
    try {
      const servers = await fetchServers({ episodeId: episode.id });
      const serverData = servers as { sub: Array<{ id: string; name: string }>; dub: Array<{ id: string; name: string }> };

      const targetServers = audioPreference === "sub" ? serverData.sub : serverData.dub;

      if (!targetServers || targetServers.length === 0) {
        toast.error(`No ${audioPreference.toUpperCase()} servers available for this episode`);
        setSubtitlesLoading(false);
        return;
      }

      const hd2Server = targetServers.find(s => s.name === "HD-2") || targetServers[0];

      if (!hd2Server) {
        toast.error("No streaming servers available");
        setSubtitlesLoading(false);
        return;
      }

      const sources = await fetchSources({ serverId: hd2Server.id });
      const sourcesData = sources as {
        sources: Array<{ file: string; type: string }>;
        tracks?: Array<{ file: string; label: string; kind?: string; default?: boolean }>;
        intro?: { start: number; end: number };
        outro?: { start: number; end: number };
        headers?: Record<string, string>;
      };

      let finalTracks = sourcesData.tracks || [];
      if (audioPreference === "dub") {
        try {
          const subServers = serverData.sub;
          if (subServers && subServers.length > 0) {
            const subHd2Server = subServers.find(s => s.name === "HD-2") || subServers[0];
            if (subHd2Server) {
              const subSources = await fetchSources({ serverId: subHd2Server.id });
              const subSourcesData = subSources as {
                tracks?: Array<{ file: string; label: string; kind?: string; default?: boolean }>;
              };
              if (subSourcesData.tracks && subSourcesData.tracks.length > 0) {
                finalTracks = subSourcesData.tracks;
              }
            }
          }
        } catch (err) {
          console.warn('Failed to fetch subtitles from sub server:', err);
          setSubtitlesError("Failed to load subtitles from sub server");
        }
      }

      const cacheData = { ...sourcesData, tracks: finalTracks };
      animeCache.set(cacheKey, cacheData, 5);

      if (sourcesData.sources && sourcesData.sources.length > 0) {
        setVideoHeaders(sourcesData.headers || null);
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
          default: t.default || false,
        }));

        const subtitlesValid = await validateSubtitleTracks(proxiedTracks);
        
        if (!subtitlesValid && proxiedTracks.length > 0) {
          setSubtitlesError("Subtitles failed to load");
          toast.warning("Subtitles may not be available for this episode");
        }

        setVideoSource(proxiedUrl);
        setVideoTitle(`${selected?.title} - Episode ${normalizedEpisodeNumber} (${audioPreference.toUpperCase()})`);
        setVideoTracks(proxiedTracks);
        setVideoIntro(sourcesData.intro || null);
        setVideoOutro(sourcesData.outro || null);
        setSubtitlesLoading(false);

        const idx = episodes.findIndex((e) => e.id === episode.id);
        if (idx !== -1) setCurrentEpisodeIndex(idx);

        toast.success(`Playing Episode ${normalizedEpisodeNumber} (${audioPreference.toUpperCase()})`);

        if (idx !== -1 && episodes[idx + 1]) {
          prefetchEpisodeSources(episodes[idx + 1].id);
        }
      } else {
        toast.error("No video sources available");
        setSubtitlesLoading(false);
      }
    } catch (err) {
      console.error('Failed to load video sources:', err);
      
      if (retryCount < maxRetries) {
        console.log(`Retrying video load (${retryCount + 1}/${maxRetries})...`);
        const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return playEpisode(episode, retryCount + 1);
      }
      
      toast.error("Unable to load video. Please try again.");
      setSubtitlesLoading(false);
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

  const closePlayer = () => {
    setVideoSource(null);
    setVideoTitle("");
    setVideoTracks([]);
    setVideoIntro(null);
    setVideoOutro(null);
    setVideoHeaders(null);
    setCurrentEpisodeData(null);
    setCurrentAnimeInfo(null);
    setSubtitlesLoading(false);
    setSubtitlesError(null);
    if (lastSelectedAnime) setSelected(lastSelectedAnime);
  };

  useEffect(() => {
    if (!selected) {
      setAnimeDetails(null);
    }
  }, [selected]);

  const playNextEpisode = () => {
    if (currentEpisodeIndex === null) return;
    const next = episodes[currentEpisodeIndex + 1];
    if (next) playEpisode(next);
  };

  const nextEpisodeTitle = currentEpisodeIndex !== null && episodes[currentEpisodeIndex + 1]
    ? `${selected?.title} • Ep ${episodes[currentEpisodeIndex + 1].number ?? "?"}`
    : undefined;

  return {
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
    currentAnimeInfo,
    animeProgress,
    playEpisode,
    handleProgressUpdate,
    closePlayer,
    playNextEpisode,
    nextEpisodeTitle,
    setLastSelectedAnime,
    lastSelectedAnime,
    animeDetails,
    audioPreference,
    handleAudioPreferenceChange,
    subtitlesLoading,
    subtitlesError,
  };
}