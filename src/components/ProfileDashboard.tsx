import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut } from "lucide-react";

type ProfileAnime = {
  title?: string;
  image?: string;
  type?: string;
  dataId?: string;
  id?: string;
  episodeNumber?: number;
  currentTime?: number;
  duration?: number;
};

interface ProfileDashboardProps {
  userName?: string | null;
  userEmail?: string | null;
  continueWatching: ProfileAnime[];
  watchlist: ProfileAnime[];
  onSelectAnime: (anime: ProfileAnime) => void;
  onLogout?: () => void;
}

const shimmerHighlight =
  "relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition before:duration-[1200ms]";

const emptyIllustration = "/assets/7e7b9501-d78c-4eb0-b98c-b49fdb807c8d.png";

export function ProfileDashboard({
  userName,
  userEmail,
  continueWatching,
  watchlist,
  onSelectAnime,
  onLogout,
}: ProfileDashboardProps) {
  const displayName = userName?.trim() || userEmail || "Anime Fan";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase())
    .join("")
    .slice(0, 2) || "AF";

  const totalSeconds = continueWatching.reduce(
    (acc, item) => acc + (item.currentTime ?? 0),
    0,
  );
  const hoursWatched = Math.max(0, Math.round(totalSeconds / 3600));

  const completedEntries = continueWatching.filter((item) => {
    const duration = item.duration ?? 0;
    if (duration <= 0) return false;
    return (item.currentTime ?? 0) / duration >= 0.9;
  }).length;

  const completionRate = continueWatching.length
    ? Math.round((completedEntries / continueWatching.length) * 100)
    : 0;

  const statCards = [
    {
      label: "Hours Watched",
      value: `${hoursWatched}`,
      sublabel: "Tracked viewing time",
    },
    {
      label: "In Progress",
      value: `${continueWatching.length}`,
      sublabel: "Episodes to finish",
    },
    {
      label: "Completion",
      value: `${completionRate}%`,
      sublabel: "Almost finished shows",
    },
    {
      label: "Watchlist",
      value: `${watchlist.length}`,
      sublabel: "Saved for later",
    },
  ];

  const renderCollection = (
    title: string,
    collection: ProfileAnime[],
    emptyText: string,
  ) => {
    if (collection.length === 0) {
      return (
        <motion.section
          className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[#0f172a]/90 via-[#0b1324]/90 to-[#050a16] px-6 py-10 text-center shadow-[0_25px_80px_rgba(0,0,0,0.55)]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.8),_transparent_55%)] blur-2xl" />
          </div>
          <div className="relative flex flex-col items-center gap-4">
            <img
              src={emptyIllustration}
              alt="Empty state"
              className="h-24 w-24 rounded-2xl border border-white/10 bg-black/30 p-3 object-contain"
            />
            <p className="text-sm uppercase tracking-widest text-blue-200/80">{title}</p>
            <p className="text-2xl font-semibold text-white">{emptyText}</p>
            <p className="max-w-md text-sm text-gray-400">
              Discover fresh episodes curated for you. Build your watchlist and keep an eye on upcoming drops.
            </p>
            <Button
              size="lg"
              className="rounded-full bg-gradient-to-r from-[#38bdf8] via-[#6366f1] to-[#ec4899] px-6 text-white shadow-[0_10px_35px_rgba(99,102,241,0.45)]"
              onClick={() => (window.location.href = "/")}
            >
              Explore Anime
            </Button>
          </div>
        </motion.section>
      );
    }

    return (
      <motion.section
        className="space-y-4"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <span className="text-sm text-gray-400">
            {collection.length} title{collection.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {collection.map((item) => {
            const progress =
              item.duration && item.duration > 0
                ? Math.min(
                    100,
                    Math.round(((item.currentTime ?? 0) / item.duration) * 100),
                  )
                : 0;

            return (
              <button
                key={item.id ?? item.dataId ?? item.title}
                onClick={() => onSelectAnime(item)}
                className={`${shimmerHighlight} group flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#0E1425]/70 text-left transition hover:border-blue-500/60`}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title ?? "Anime poster"}
                    className="h-48 w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-48 w-full items-center justify-center bg-gradient-to-r from-blue-700 to-indigo-900 text-sm text-white/70">
                    No artwork
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-3 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <p className="line-clamp-2 text-base font-semibold text-white">
                      {item.title ?? "Untitled"}
                    </p>
                    {item.type && (
                      <Badge className="bg-white/10 text-[10px] uppercase tracking-wide text-white">
                        {item.type}
                      </Badge>
                    )}
                  </div>
                  {item.episodeNumber && (
                    <p className="text-sm text-gray-400">
                      Episode {item.episodeNumber}
                    </p>
                  )}
                  {progress > 0 && (
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{progress}% watched</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-white/10">
                        <span
                          className="block h-full rounded-full bg-gradient-to-r from-[#38bdf8] via-[#6366f1] to-[#ec4899] shadow-[0_0_12px_rgba(99,102,241,0.6)]"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <span className="mt-auto text-sm font-medium text-blue-400 transition group-hover:text-blue-300">
                    Continue •
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </motion.section>
    );
  };

  return (
    <div className="space-y-10">
      <motion.section
        className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[#16203a] via-[#11182b] to-[#0d1220] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.65)] md:p-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-2xl font-bold text-white">
              {initials}
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest text-blue-300/80">
                My Profile
              </p>
              <h2 className="text-3xl font-bold text-white">{displayName}</h2>
              {userEmail && (
                <p className="text-sm text-gray-400">{userEmail}</p>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="h-12 rounded-2xl border border-white/10 bg-white/5 text-white backdrop-blur"
            >
              Personalize Feed
            </Button>
            <Button
              variant="destructive"
              onClick={onLogout}
              className="h-12 rounded-2xl bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <motion.div
            key={stat.label}
            className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/8 via-white/2 to-transparent px-5 py-6 shadow-[0_20px_70px_rgba(0,0,0,0.45)]"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm uppercase tracking-wide text-gray-400">
              {stat.label}
            </p>
            <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-gray-400">{stat.sublabel}</p>
          </motion.div>
        ))}
      </section>

      {renderCollection(
        "Continue Watching",
        continueWatching,
        "You haven't started watching anything yet.",
      )}

      {renderCollection(
        "My Watchlist",
        watchlist,
        "Add shows to your watchlist to see them here.",
      )}
    </div>
  );
}