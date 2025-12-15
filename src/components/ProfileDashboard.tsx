import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Palette, Gamepad2, Download, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/use-theme";
import { AnimeCard } from "@/components/AnimeCard";

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

      {/* Controller Extension Section */}
      <div className="bg-[var(--nothing-elevated,white/5)] border border-[var(--nothing-border,white/10)] rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-purple-500/10">
            <Gamepad2 className="h-6 w-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2 text-[var(--nothing-fg,white)]">Controller Support</h2>
            <p className="text-sm text-[var(--nothing-gray-4,gray-400)] mb-4">
              Use your Xbox, PlayStation, or any gamepad to control video playback and navigate the site. 
              Install our Chrome extension for the best experience.
            </p>
            
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  <Gamepad2 className="h-3 w-3 mr-1" />
                  Xbox Controllers
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Gamepad2 className="h-3 w-3 mr-1" />
                  PlayStation Controllers
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Gamepad2 className="h-3 w-3 mr-1" />
                  Generic Gamepads
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="default"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => {
                    // Download extension
                    const link = document.createElement('a');
                    link.href = '/extension.zip';
                    link.download = 'gojostream-controller-extension.zip';
                    link.click();
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Extension
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => window.open('https://github.com/yourusername/gojostream-controller-extension', '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on GitHub
                </Button>
              </div>

              <div className="mt-4 p-4 rounded-lg bg-[var(--nothing-bg,black/20)] border border-[var(--nothing-border,white/5)]">
                <h3 className="text-sm font-semibold mb-2 text-[var(--nothing-fg,white)]">Quick Setup:</h3>
                <ol className="text-xs text-[var(--nothing-gray-4,gray-400)] space-y-1 list-decimal list-inside">
                  <li>Download the extension ZIP file</li>
                  <li>Extract the ZIP to a folder</li>
                  <li>Open Chrome and go to <code className="bg-black/30 px-1 rounded">chrome://extensions/</code></li>
                  <li>Enable "Developer mode" (top right)</li>
                  <li>Click "Load unpacked" and select the extracted folder</li>
                  <li>Connect your controller and start playing!</li>
                </ol>
              </div>

              <div className="mt-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-300">
                  💡 <strong>Tip:</strong> Press the <strong>A button</strong> to play/pause, <strong>D-Pad</strong> to seek, 
                  and <strong>LB/RB</strong> to switch episodes!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Watching Section */}
      {continueWatching && continueWatching.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-[var(--nothing-fg,white)]">Continue Watching</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {continueWatching.map((anime, idx) => (
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
      {watchlist && watchlist.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-[var(--nothing-fg,white)]">My Watchlist</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {watchlist.map((anime, idx) => (
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