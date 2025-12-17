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
import { useGamepad, GAMEPAD_BUTTONS } from "@/hooks/use-gamepad";
import { useEffect, useRef, useState } from "react";

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
  { value: "classic", label: "Classic (Blue-Cyan)" },
  { value: "retro", label: "Retro Home Screen" },
] as const;

export function ProfileDashboard({
  userName,
  userEmail,
  continueWatching,
  watchlist,
  onSelectAnime,
  onLogout,
}: ProfileDashboardProps) {
  const { theme, setTheme } = useTheme();
  const { buttonPressed } = useGamepad();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedSection, setSelectedSection] = useState<'continue' | 'watchlist'>('continue');
  
  const allItems = selectedSection === 'continue' ? continueWatching : watchlist;
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Handle gamepad navigation
  useEffect(() => {
    if (buttonPressed === null) return;

    switch (buttonPressed) {
      case GAMEPAD_BUTTONS.DPAD_LEFT:
        setSelectedIndex((prev) => Math.max(0, prev - 1));
        break;
      case GAMEPAD_BUTTONS.DPAD_RIGHT:
        setSelectedIndex((prev) => Math.min(allItems.length - 1, prev + 1));
        break;
      case GAMEPAD_BUTTONS.DPAD_UP:
        if (selectedSection === 'watchlist' && continueWatching.length > 0) {
          setSelectedSection('continue');
          setSelectedIndex(0);
        }
        break;
      case GAMEPAD_BUTTONS.DPAD_DOWN:
        if (selectedSection === 'continue' && watchlist.length > 0) {
          setSelectedSection('watchlist');
          setSelectedIndex(0);
        }
        break;
      case GAMEPAD_BUTTONS.A:
        if (allItems[selectedIndex]) {
          onSelectAnime(allItems[selectedIndex]);
        }
        break;
      case GAMEPAD_BUTTONS.B:
        // Could add back navigation here
        break;
    }
  }, [buttonPressed, selectedIndex, selectedSection, allItems, continueWatching.length, watchlist.length, onSelectAnime]);

  // Scroll selected item into view
  useEffect(() => {
    if (itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [selectedIndex]);

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

      {/* Theme Switcher */}
      <div className="bg-[var(--nothing-elevated,white/5)] border border-[var(--nothing-border,white/10)] rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-[var(--nothing-fg,white)]">Theme Settings</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant={theme === "classic" ? "default" : "outline"}
            onClick={() => setTheme("classic")}
            className={theme === "classic" ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            Classic
          </Button>
          <Button
            variant={theme === "retro" ? "default" : "outline"}
            onClick={() => setTheme("retro")}
            className={theme === "retro" ? "bg-purple-600 hover:bg-purple-700" : ""}
          >
            Retro
          </Button>
          <Button
            variant={theme === "nothing" ? "default" : "outline"}
            onClick={() => setTheme("nothing")}
            className={theme === "nothing" ? "bg-red-600 hover:bg-red-700" : ""}
          >
            NothingOS
          </Button>
        </div>
        <p className="text-sm text-[var(--nothing-gray-4,gray-400)] mt-3">
          Current theme: <span className="font-semibold text-[var(--nothing-fg,white)] capitalize">{theme}</span>
        </p>
      </div>

      {/* Continue Watching Section */}
      {continueWatching && continueWatching.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-[var(--nothing-fg,white)]">Continue Watching</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {continueWatching.map((anime, idx) => (
              <div
                key={anime.id ?? idx}
                ref={(el) => {
                  if (selectedSection === 'continue') {
                    itemRefs.current[idx] = el;
                  }
                }}
                className={`transition-all duration-200 ${
                  selectedSection === 'continue' && selectedIndex === idx
                    ? 'ring-2 ring-[#ff4d4f] ring-offset-2 ring-offset-[#0B0F19] scale-105'
                    : ''
                }`}
              >
                <AnimeCard
                  anime={anime}
                  onClick={() => onSelectAnime(anime)}
                  index={idx}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Watchlist Section */}
      {watchlist && watchlist.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-[var(--nothing-fg,white)]">My Watchlist</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {watchlist.map((anime, idx) => (
              <div
                key={anime.id ?? idx}
                ref={(el) => {
                  if (selectedSection === 'watchlist') {
                    itemRefs.current[idx] = el;
                  }
                }}
                className={`transition-all duration-200 ${
                  selectedSection === 'watchlist' && selectedIndex === idx
                    ? 'ring-2 ring-[#ff4d4f] ring-offset-2 ring-offset-[#0B0F19] scale-105'
                    : ''
                }`}
              >
                <AnimeCard
                  anime={anime}
                  onClick={() => onSelectAnime(anime)}
                  index={idx}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty States */}
      {(!continueWatching || continueWatching.length === 0) &&
        (!watchlist || watchlist.length === 0) && (
          <div className="text-center py-16">
            <p className="text-[var(--nothing-gray-4,gray-400)] text-lg">No anime in your library yet.</p>
            <p className="text-[var(--nothing-gray-4,gray-500)] mt-2">Start watching to build your collection!</p>
          </div>
        )}
    </div>
  );
}