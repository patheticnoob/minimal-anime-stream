import { cn } from "@/lib/utils";
import { LogOut, Search, User, Moon, Sun } from "lucide-react";

interface NothingNavBarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isAuthenticated: boolean;
  onLogout: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

const navItems = [
  { id: "home", label: "Home" },
  { id: "tv", label: "Browse" },
  { id: "movies", label: "Movies" },
  { id: "recent", label: "Recent" },
];

export function NothingNavBar({
  activeSection,
  onSectionChange,
  isAuthenticated,
  onLogout,
  isDarkMode = false,
  onToggleDarkMode,
}: NothingNavBarProps) {
  const iconButtonClasses =
    "w-10 h-10 rounded-full border border-black/5 dark:border-white/10 bg-white/90 dark:bg-white/10 text-[#4b5563] dark:text-white hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/20 transition-colors flex items-center justify-center";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 pt-4">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="rounded-full border border-black/5 dark:border-white/10 bg-white/95 dark:bg-[#1A1D24]/95 px-4 sm:px-6 shadow-[0_20px_80px_rgba(5,8,20,0.08)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.5)] backdrop-blur">
          <div className="flex items-center h-16 gap-4">
            <button
              onClick={() => onSectionChange("home")}
              className="flex items-center gap-2 text-[0.62rem] sm:text-[0.7rem] font-semibold tracking-[0.45em] uppercase text-[#030712] dark:text-white"
              aria-label="Go to home"
            >
              <span className="w-2 h-2 rounded-full bg-[#ff4d4f]" />
              GOJOSTREAM
            </button>

            <span className="hidden sm:block h-8 w-px bg-black/10 dark:bg-white/10" />

            <div className="flex-1 flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-hide">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    "relative px-2 text-[0.6rem] sm:text-[0.72rem] tracking-[0.35em] uppercase font-semibold text-[#a0a5b4] dark:text-[#9CA3AF] transition-colors py-2",
                    activeSection === item.id
                      ? "text-[#050814] dark:text-white"
                      : "hover:text-[#050814] dark:hover:text-white"
                  )}
                >
                  {item.label}
                  {activeSection === item.id && (
                    <span className="absolute -bottom-2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#ff4d4f]" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => onSectionChange("search")}
                className={iconButtonClasses}
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>

              <button
                onClick={onToggleDarkMode}
                className={iconButtonClasses}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              <button
                onClick={() => onSectionChange("profile")}
                className={cn(
                  "relative w-10 h-10 rounded-full border border-white/60 bg-gradient-to-br from-[#ffe3d6] via-[#ffd0c2] to-[#f8b4a6] text-[#2e2e2e] flex items-center justify-center shadow-inner transition-all",
                  activeSection === "profile" && "ring-2 ring-[#ff8a73]/70"
                )}
                aria-label="Profile"
              >
                <User className="h-4 w-4" />
                <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#ff4d4f]" />
              </button>

              {isAuthenticated && (
                <button
                  onClick={onLogout}
                  className={cn(iconButtonClasses, "hidden sm:flex")}
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}