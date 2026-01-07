import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { ArrowLeft, Play, Plus, Check, Clock3 } from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { RetroVideoPlayer } from "@/components/RetroVideoPlayer";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useDataFlow } from "@/hooks/use-data-flow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FullscreenLoader } from "@/components/FullscreenLoader";
import { type BroadcastInfo } from "@/types/broadcast";
import { DateTime } from "luxon";
import { useGamepad, GAMEPAD_BUTTONS } from "@/hooks/use-gamepad";

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

export default function Watch() {
  const { animeId } = useParams<{ animeId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const { dataFlow } = useDataFlow();
  const { buttonPressed } = useGamepad();

  const fetchEpisodes = useAction(api.hianime.episodes);
  const fetchServers = useAction(api.hianime.episodeServers);
  const fetchSources = useAction(api.hianime.episodeSources);
  
  // V3 Actions Removed

  const fetchBroadcastInfo = useAction(api.jikan.searchBroadcast);

  const [anime, setAnime] = useState<AnimeDetail | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
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
  const [focusedEpisodeIndex, setFocusedEpisodeIndex] = useState(0);
  const [isNavigatingEpisodes, setIsNavigatingEpisodes] = useState(false);

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

    // Try to get anime data from localStorage (passed from Landing page)
    const storedAnime = localStorage.getItem(`anime_${animeId}`);
    if (storedAnime) {
      try {
        const animeData = JSON.parse(storedAnime);
        setAnime(animeData);
      } catch (err) {
        console.error("Failed to parse stored anime data:", err);
      }
    }

    // Fetch episodes with retry logic
    setEpisodesLoading(true);

    const fetchWithRetry = async (retryCount = 0, maxRetries = 3) => {
      try {
        const eps = await fetchEpisodes({ dataId: animeId });
        const normalizedEpisodes = (eps as Episode[]).map((ep) => ({
          ...ep,
          number: normalizeEpisodeNumber(ep.number),
        }));
        setEpisodes(normalizedEpisodes);
      } catch (err) {
        // Log detailed error to console for debugging
        console.error('Failed to fetch episodes:', err);
        
        // Retry logic for connection errors
        if (retryCount < maxRetries) {
          console.log(`Retrying episode fetch (${retryCount + 1}/${maxRetries})...`);
          const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(retryCount + 1, maxRetries);
        }
        
        // Show user-friendly error after all retries exhausted
        toast.error("Unable to load episodes. Please try again.");
      } finally {
        setEpisodesLoading(false);
      }
    };

    fetchWithRetry();

    // Fetch broadcast info if anime title is available
    if (storedAnime) {
      const animeData = JSON.parse(storedAnime);
      if (animeData.title) {
        setIsBroadcastLoading(true);
        fetchBroadcastInfo({ title: animeData.title })
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
      }
    }
  }, [animeId, fetchEpisodes, fetchBroadcastInfo, dataFlow, navigate]);

  // Enhanced Gamepad navigation for Watch page
  useEffect(() => {
    if (buttonPressed === null) return;

    // If video is playing, let the video player handle controls
    if (videoSource) return;

    switch (buttonPressed) {
      case GAMEPAD_BUTTONS.DPAD_UP:
        if (isNavigatingEpisodes) {
          setFocusedEpisodeIndex(prev => Math.max(0, prev - 1));
        }
        break;

      case GAMEPAD_BUTTONS.DPAD_DOWN:
        if (isNavigatingEpisodes) {
          setFocusedEpisodeIndex(prev => Math.min(episodes.length - 1, prev + 1));
        }
        break;

      case GAMEPAD_BUTTONS.A:
        if (isNavigatingEpisodes && episodes[focusedEpisodeIndex]) {
          playEpisode(episodes[focusedEpisodeIndex]);
        }
        break;

      case GAMEPAD_BUTTONS.B:
        if (isNavigatingEpisodes) {
          setIsNavigatingEpisodes(false);
        } else {
          navigate("/");
        }
        break;

      case GAMEPAD_BUTTONS.X:
        setIsNavigatingEpisodes(!isNavigatingEpisodes);
        break;

      case GAMEPAD_BUTTONS.Y:
        handleToggleWatchlist();
        break;
    }
  }, [buttonPressed, videoSource, isNavigatingEpisodes, focusedEpisodeIndex, episodes, navigate]);

  // Auto-scroll focused episode into view
  useEffect(() => {
    if (isNavigatingEpisodes && focusedEpisodeIndex >= 0) {
      const episodeElement = document.querySelector(`[data-episode-index="${focusedEpisodeIndex}"]`);
      if (episodeElement) {
        episodeElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [focusedEpisodeIndex, isNavigatingEpisodes]);

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

    setVideoSource(null);
    setVideoIntro(null);
    setVideoOutro(null);

    const loadVideoWithRetry = async (retryCount = 0, maxRetries = 3) => {
      try {
        const servers = await fetchServers({ episodeId: episode.id });
        const serverData = servers as { sub: Array<{ id: string; name: string }>; dub: Array<{ id: string; name: string }> };

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
          return loadVideoWithRetry(retryCount + 1, maxRetries);
        }
        
        // Show user-friendly error after all retries exhausted
        toast.error("Unable to load video. Please try again.");
      }
    };

    toast("Loading video...");
    loadVideoWithRetry();
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

  if (episodesLoading) {
    return (
      <FullscreenLoader 
        label="Loading episodes..." 
        subLabel="Please wait"
        maxDuration={5000}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#050814]/95 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-[2000px] mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 py-1 flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{anime?.title || "Loading..."}</h1>
          </div>
          <Button
            onClick={handleToggleWatchlist}
            variant="outline"
            size="sm"
            className="gap-2 flex-shrink-0"
          >
            {isInWatchlist ? (
              <>
                <Check className="h-4 w-4" />
                <span className="hidden sm:inline">In Watchlist</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Watchlist</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 px-6 pb-10 max-w-[2000px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          {/* Left: Video Player */}
          <div className="space-y-6">
            {videoSource && currentEpisodeData ? (
              (() => {
                const PlayerComponent = theme === "retro" ? RetroVideoPlayer : VideoPlayer;

                return (
                  <PlayerComponent
                    key={currentEpisodeData.id}
                    source={videoSource}
                    title={videoTitle}
                    tracks={videoTracks}
                    intro={videoIntro}
                    outro={videoOutro}
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
                    onClose={() => {
                      setVideoSource(null);
                      setVideoTitle("");
                      setVideoTracks([]);
                      setVideoIntro(null);
                      setVideoOutro(null);
                      setCurrentEpisodeData(null);
                      setCurrentAnimeInfo(null);
                      setInitialResumeTime(0);
                    }}
                  />
                );
              })()
            ) : (
              <div className="aspect-video bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Play className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">Select an episode to start watching</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Press X to {isNavigatingEpisodes ? "disable" : "enable"} gamepad navigation
                  </p>
                  {isNavigatingEpisodes && (
                    <p className="text-xs text-blue-400 mt-1">
                      Use D-pad Up/Down to navigate • A to play • B to exit
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Anime Info */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex gap-4">
                {anime?.image && (
                  <img
                    src={anime.image}
                    alt={anime.title}
                    className="w-32 h-48 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{anime?.title || "Unknown Title"}</h2>
                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    {anime?.type && (
                      <Badge variant="outline" className="text-xs">
                        {anime.type}
                      </Badge>
                    )}
                    {anime?.language?.sub && (
                      <Badge variant="outline" className="text-xs">
                        SUB
                      </Badge>
                    )}
                    {anime?.language?.dub && (
                      <Badge variant="outline" className="text-xs">
                        DUB
                      </Badge>
                    )}
                    {episodes.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {episodes.length} Episodes
                      </Badge>
                    )}
                  </div>
                  {shouldShowBroadcast && (
                    <div className="flex items-start gap-2 text-sm text-blue-300">
                      <Clock3 className="h-4 w-4 mt-0.5" />
                      {isBroadcastLoading ? (
                        <span>Fetching upcoming schedule...</span>
                      ) : (
                        <div className="space-y-1">
                          <span className="block font-semibold text-white">
                            Next broadcast: {broadcastDetails?.istLabel ?? broadcastInfo?.summary ?? "TBA"}
                          </span>
                          {broadcastDetails?.countdown && (
                            <span className="block text-xs text-blue-200">
                              {broadcastDetails.countdown}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Episode List */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 h-fit max-h-[calc(100vh-120px)] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4 uppercase tracking-wider">
              Episodes
              {isNavigatingEpisodes && (
                <span className="text-xs text-blue-400 ml-2">(Gamepad Active)</span>
              )}
            </h3>
            {episodes.length > 0 ? (
              <div className="space-y-2">
                {episodes.map((ep, idx) => {
                  const progressPercentage = ep.currentTime && ep.duration
                    ? (ep.currentTime / ep.duration) * 100
                    : 0;
                  const isCurrentEpisode = currentEpisodeData?.id === ep.id;
                  const isFocused = isNavigatingEpisodes && focusedEpisodeIndex === idx;

                  return (
                    <button
                      key={ep.id}
                      data-episode-index={idx}
                      onClick={() => playEpisode(ep)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        isCurrentEpisode
                          ? "bg-blue-500/20 border-blue-500 ring-2 ring-blue-400/50"
                          : isFocused
                          ? "bg-blue-500/10 border-blue-400 ring-4 ring-blue-400 shadow-xl shadow-blue-500/60 scale-[1.02]"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">
                          {ep.title || `Episode ${ep.number ?? "?"}`}
                        </span>
                        <span className="text-xs text-gray-400">
                          EP {ep.number ?? "?"}
                        </span>
                      </div>
                      {progressPercentage > 0 && (
                        <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">No episodes available</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}