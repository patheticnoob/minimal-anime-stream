import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/use-theme";
import { AnimeCard } from "@/components/AnimeCard";
import { ControllerStatus } from "@/components/ControllerStatus";
import { GamepadButtonMapping } from "@/components/GamepadButtonMapping";
import { useGamepad, GAMEPAD_BUTTONS } from "@/hooks/use-gamepad";
import { useEffect, useMemo, useRef, useState } from "react";

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

const themeOptions = [
  { value: "classic", label: "Classic", accentClass: "bg-blue-600 hover:bg-blue-700" },
  { value: "retro", label: "Retro", accentClass: "bg-purple-600 hover:bg-purple-700" },
  { value: "nothing", label: "NothingOS", accentClass: "bg-red-600 hover:bg-red-700" },
] as const;

type FocusSection = "continue" | "watchlist" | "theme" | "signout";

export function ProfileDashboard({
  userName,
  userEmail,
  continueWatching,
  watchlist,
  onSelectAnime,
  onLogout,
}: ProfileDashboardProps) {
  const { theme, setTheme } = useTheme();
  const safeContinueWatching = continueWatching ?? [];
  const safeWatchlist = watchlist ?? [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--nothing-fg,white)]">My Profile</h1>
          <p className="text-[var(--nothing-gray-4,#8a90a6)] mt-1">{userEmail}</p>
        </div>
        <Button
          variant="outline"
          onClick={onLogout}
          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      {/* Controller Status */}
      <ControllerStatus showDetails={true} />

      {/* Controller Button Mapping Section */}
      <GamepadButtonMapping />

      {/* Theme Switcher */}
      <div className="bg-[var(--nothing-elevated,white/5)] border border-[var(--nothing-border,white/10)] rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-[var(--nothing-fg,white)]">Theme Settings</h2>
        <div className="flex flex-wrap gap-3">
          {themeOptions.map((option) => (
            <Button
              key={option.value}
              variant={theme === option.value ? "default" : "outline"}
              onClick={() => setTheme(option.value)}
              className={theme === option.value ? option.accentClass : ""}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <p className="text-sm text-[var(--nothing-gray-4,gray-400)] mt-3">
          Current theme: <span className="font-semibold text-[var(--nothing-fg,white)] capitalize">{theme}</span>
        </p>
      </div>

      {/* Continue Watching Section */}
      {safeContinueWatching && safeContinueWatching.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-[var(--nothing-fg,white)]">Continue Watching</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {safeContinueWatching.map((anime, idx) => (
              <AnimeCard
                key={anime.id ?? idx}
                anime={anime}
                onClick={() => onSelectAnime(anime)}
                index={idx}
              />
            ))}
          </div>
        </div>
      )}

      {/* Watchlist Section */}
      {safeWatchlist && safeWatchlist.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-[var(--nothing-fg,white)]">My Watchlist</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {safeWatchlist.map((anime, idx) => (
              <AnimeCard
                key={anime.id ?? idx}
                anime={anime}
                onClick={() => onSelectAnime(anime)}
                index={idx}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty States */}
      {(!safeContinueWatching || safeContinueWatching.length === 0) &&
        (!safeWatchlist || safeWatchlist.length === 0) && (
          <div className="text-center py-16">
            <p className="text-[var(--nothing-gray-4,gray-400)] text-lg">No anime in your library yet.</p>
            <p className="text-[var(--nothing-gray-4,gray-500)] mt-2">Start watching to build your collection!</p>
          </div>
        )}
    </div>
  );
}