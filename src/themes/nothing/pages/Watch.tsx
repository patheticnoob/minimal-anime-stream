import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { ArrowLeft, Play, Plus, Check, Clock3, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { NothingVideoPlayer } from "../components/NothingVideoPlayer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FullscreenLoader } from "@/components/FullscreenLoader";
import { type BroadcastInfo } from "@/types/broadcast";
import { DateTime } from "luxon";

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

  const fetchEpisodes = useAction(api.hianime.episodes);
  const fetchServers = useAction(api.hianime.episodeServers);
  const fetchSources = useAction(api.hianime.episodeSources);
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

    setEpisodesLoading(true);
    fetchEpisodes({ dataId: animeId })
      .then((eps) => {
        const normalizedEpisodes = (eps as Episode[]).map((ep) => ({
          ...ep,
          number: normalizeEpisodeNumber(ep.number),
        }));
        setEpisodes(normalizedEpisodes);
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Failed to load episodes.";
        toast.error(msg);
      })
      .finally(() => setEpisodesLoading(false));

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
  }, [animeId, fetchEpisodes, fetchBroadcastInfo, navigate]);

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

    toast("Loading video...");

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

  if (episodesLoading) {
    return <FullscreenLoader label="Loading anime..." subLabel="Fetching episodes" />;
  }

  return (
    <div data-theme="nothing" className="min-h-screen bg-[#0B0F19] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#050814]/95 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-[2000px] mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold truncate">{anime?.title || "Loading..."}</h1>
          </div>
          <Button
            onClick={handleToggleWatchlist}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {isInWatchlist ? (
              <>
                <Check className="h-4 w-4" />
                In Watchlist
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Watchlist
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
              <NothingVideoPlayer
                source={videoSource}
                title={anime?.title || "Now Playing"}
                episodeLabel={`Episode ${currentEpisodeData.number ?? "?"}`}
                tracks={videoTracks}
                intro={videoIntro}
                outro={videoOutro}
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
            ) : (
              <div className="nothing-player-shell">
                <div className="nothing-player-empty">
                  <div className="nothing-player-icon">
                    <ImageIcon className="h-10 w-10" />
                  </div>
                  <p className="text-white/60 text-sm tracking-[0.3em] uppercase">Select an episode</p>
                  <p className="text-white text-lg font-semibold">Choose an episode to start playback</p>
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
                  {episodes.length > 0 && (
                    <Button
                      onClick={() => playEpisode(episodes[0])}
                      className="nothing-play-cta mt-4 w-full md:w-auto"
                      disabled={episodes.length === 0}
                    >
                      <span className="nothing-play-dots" />
                      Play Episode {episodes[0].number ?? 1}
                    </Button>
                  )}
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
            <h3 className="text-lg font-bold mb-4 uppercase tracking-wider">Episodes</h3>
            {episodes.length > 0 ? (
              <div className="space-y-2">
                {episodes.map((ep) => {
                  const progressPercentage =
                    ep.currentTime && ep.duration ? (ep.currentTime / ep.duration) * 100 : 0;
                  const isCurrentEpisode = currentEpisodeData?.id === ep.id;

                  return (
                    <button
                      key={ep.id}
                      onClick={() => playEpisode(ep)}
                      className={`nothing-episode-card ${
                        isCurrentEpisode ? "nothing-episode-card--active" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="nothing-episode-pill">
                          <span>EP</span>
                          <strong>{ep.number ?? "?"}</strong>
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-white">{ep.title || `Episode ${ep.number ?? "?"}`}</p>
                          <p className="text-xs text-white/50">Episode {ep.number ?? "?"}</p>
                        </div>
                        <Play className="h-4 w-4 text-white/70" />
                      </div>
                      {progressPercentage > 0 && (
                        <div className="nothing-episode-progress">
                          <div style={{ width: `${progressPercentage}%` }} />
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