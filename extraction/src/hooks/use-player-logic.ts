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

  // Prefetch episode sources for faster playback
  const prefetchEpisodeSources = useCallback(async (episodeId: string) => {
    const cacheKey = `sources_${episodeId}_${audioPreference}`;
    if (animeCache.has(cacheKey)) return;

    try {
      const servers = await fetchServers({ episodeId });
      const serverData = servers as { sub: Array<{ id: string; name: string }>; dub: Array<{ id: string; name: string }> };
      
      const targetServers = audioPreference === "sub" ? serverData.sub : serverData.dub;
      const hd2Server = targetServers?.find(s => s.name === "HD-2") || targetServers?.[0];
      
      if (hd2Server) {
        const sources = await fetchSources({ serverId: hd2Server.id });
        animeCache.set(cacheKey, sources, 5);
      }
    } catch (err) {
      console.warn('Prefetch failed for episode:', episodeId, err);
    }
  }, [fetchServers, fetchSources, audioPreference]);

  useEffect(() => {
    if (!selected?.dataId) {
      setEpisodes([]);
      setEpisodesLoading(false);
      return;
    }

    // Check cache first
    const cacheKey = `episodes_${selected.dataId}_${dataFlow}`;
    const cachedEpisodes = animeCache.get<Episode[]>(cacheKey);
    
    if (cachedEpisodes) {
      const normalizedEpisodes = cachedEpisodes.map((ep) => ({
        ...ep,
        number: normalizeEpisodeNumber(ep.number),
      }));
      setEpisodes(normalizedEpisodes);
      setEpisodesLoading(false);
      
      // Prefetch first episode or last watched episode
      if (normalizedEpisodes.length > 0) {
        const targetEpisode = animeProgress?.episodeId 
          ? normalizedEpisodes.find(ep => ep.id === animeProgress.episodeId)
          : normalizedEpisodes[0];
        
        if (targetEpisode) {
          prefetchEpisodeSources(targetEpisode.id);
          
          // Also prefetch next episode
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
        const eps = await fetchEpisodes({ dataId: selected.dataId! });
        if (cancelled) return;
        
        const normalizedEpisodes = (eps as Episode[]).map((ep) => ({
          ...ep,
          number: normalizeEpisodeNumber(ep.number),
        }));
        setEpisodes(normalizedEpisodes);
        setCurrentEpisodeIndex(null);
        
        // Cache episodes
        animeCache.set(cacheKey, eps, 10);
        
        // Prefetch first episode or last watched episode
        if (normalizedEpisodes.length > 0) {
          const targetEpisode = animeProgress?.episodeId 
            ? normalizedEpisodes.find(ep => ep.id === animeProgress.episodeId)
            : normalizedEpisodes[0];
          
          if (targetEpisode) {
            prefetchEpisodeSources(targetEpisode.id);
            
            // Also prefetch next episode
            const targetIndex = normalizedEpisodes.findIndex(ep => ep.id === targetEpisode.id);
            if (targetIndex !== -1 && normalizedEpisodes[targetIndex + 1]) {
              prefetchEpisodeSources(normalizedEpisodes[targetIndex + 1].id);
            }
          }
        }
      } catch (err) {
        if (cancelled) return;
        
        // Log detailed error to console for debugging
        console.error('Failed to fetch episodes:', err);
        
        // Retry logic for connection errors
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying episode fetch (${retryCount}/${maxRetries})...`);
          const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry();
        }
        
        // Show user-friendly error after all retries exhausted
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
  }, [selected?.dataId, fetchEpisodes, animeProgress?.episodeId, prefetchEpisodeSources, dataFlow]);

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

    // DON'T set videoSource to null - keep player mounted for seamless transitions
    // Only clear intro/outro/headers to prepare for new episode
    setVideoIntro(null);
    setVideoOutro(null);
    setVideoHeaders(null);

    // Check cache first with audio preference
    const cacheKey = `sources_${episode.id}_${audioPreference}`;
    const cachedSources = animeCache.get<any>(cacheKey);
    
    if (cachedSources) {
      // Use cached sources immediately
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

        setVideoSource(proxiedUrl);
        setVideoTitle(`${selected?.title} - Episode ${normalizedEpisodeNumber} (${audioPreference.toUpperCase()})`);
        setVideoTracks(proxiedTracks);
        setVideoIntro(sourcesData.intro || null);
        setVideoOutro(sourcesData.outro || null);

        const idx = episodes.findIndex((e) => e.id === episode.id);
        if (idx !== -1) setCurrentEpisodeIndex(idx);

        toast.success(`Playing Episode ${normalizedEpisodeNumber} (${audioPreference.toUpperCase()})`);
        
        // Prefetch next episode
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
        tracks?: Array<{ file: string; label: string; kind?: string; default?: boolean }>;
        intro?: { start: number; end: number };
        outro?: { start: number; end: number };
        headers?: Record<string, string>;
      };
      
      // Cache the sources with audio preference
      animeCache.set(cacheKey, sourcesData, 5);
      
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

        const proxiedTracks = (sourcesData.tracks || []).map((t) => ({
          ...t,
          kind: t.kind || "subtitles",
          file: `${base}/proxy?url=${encodeURIComponent(t.file)}`,
          default: t.default || false,
        }));

        setVideoSource(proxiedUrl);
        setVideoTitle(`${selected?.title} - Episode ${normalizedEpisodeNumber} (${audioPreference.toUpperCase()})`);
        setVideoTracks(proxiedTracks);
        setVideoIntro(sourcesData.intro || null);
        setVideoOutro(sourcesData.outro || null);

        const idx = episodes.findIndex((e) => e.id === episode.id);
        if (idx !== -1) setCurrentEpisodeIndex(idx);

        toast.success(`Playing Episode ${normalizedEpisodeNumber} (${audioPreference.toUpperCase()})`);
        
        // Prefetch next episode
        if (idx !== -1 && episodes[idx + 1]) {
          prefetchEpisodeSources(episodes[idx + 1].id);
        }
      } else {
        toast.error("No video sources available");
      }
    } catch (err) {
      // Log detailed error to console for debugging
      console.error('Failed to load video sources:', err);
      
      // Retry logic for connection errors
      if (retryCount < maxRetries) {
        console.log(`Retrying video load (${retryCount + 1}/${maxRetries})...`);
        const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return playEpisode(episode, retryCount + 1);
      }
      
      // Show user-friendly error after all retries exhausted
      toast.error("Unable to load video. Please try again.");
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
    // Do not clear animeDetails here as we might want to keep showing info in modal
    // But if we close modal, selected becomes null, which triggers effect to clear episodes
    if (lastSelectedAnime) setSelected(lastSelectedAnime);
  };

  // Clear details when selected changes
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
  };
}