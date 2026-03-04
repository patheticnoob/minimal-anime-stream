import { ArrowLeft, Moon, Sun, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router";

interface NothingWatchHeaderProps {
  title?: string;
  isDarkMode: boolean;
  toggleTheme: () => void;
  isInWatchlist?: boolean;
  onToggleWatchlist: () => void;
}

export function NothingWatchHeader({
  title,
  isDarkMode,
  toggleTheme,
  isInWatchlist,
  onToggleWatchlist
}: NothingWatchHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // If we have a previous location in state, navigate to it
    // This preserves search results and other navigation context
    const fromPath = (location.state as any)?.from;
    if (fromPath) {
      navigate(fromPath);
    } else {
      // Fallback to browser back
      navigate(-1);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#1A1D24]/95 backdrop-blur-lg border-b border-black/5 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-[2000px] mx-auto px-6 py-4 flex items-center gap-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors group"
        >
          <div className="p-2 rounded-full bg-black/5 dark:bg-white/10 group-hover:bg-black/10 dark:group-hover:bg-white/20 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium tracking-widest uppercase">Back</span>
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold truncate tracking-wide text-[#050814] dark:text-white">{title || "Loading..."}</h1>
        </div>
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full border transition-colors flex items-center justify-center border-black/5 bg-white/90 text-[#4b5563] hover:text-black hover:border-black/20 dark:border-white/10 dark:bg-[#2A2F3A] dark:text-white dark:hover:text-white dark:hover:border-white/20"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <Button
          onClick={onToggleWatchlist}
          variant="outline"
          size="sm"
          className="gap-2 border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 text-[#050814] dark:text-white bg-transparent"
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
  );
}
