import { Home, Search, MonitorPlay, Film, Clock, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NothingNavBarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isAuthenticated: boolean;
  onLogout: () => void;
}

export function NothingNavBar({ activeSection, onSectionChange, isAuthenticated, onLogout }: NothingNavBarProps) {
  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "search", icon: Search, label: "Search" },
    { id: "tv", icon: MonitorPlay, label: "TV Shows" },
    { id: "movies", icon: Film, label: "Movies" },
    { id: "recent", icon: Clock, label: "Recent" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050814]/90 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-[2000px] mx-auto px-6 h-20 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => onSectionChange("home")}
        >
          <div className="w-2.5 h-2.5 bg-[#ff4d4f] rounded-full group-hover:scale-125 transition-transform" />
          <span className="font-bold tracking-[0.25em] text-xl text-white">NOTHING</span>
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-full border border-white/5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2.5",
                activeSection === item.id
                  ? "bg-white text-black shadow-lg scale-105"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <item.icon className="w-4 h-4" />
              <span className="hidden sm:inline tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onSectionChange("profile")}
            className={cn(
              "p-3 rounded-full transition-all duration-300 border border-transparent hover:border-white/20 hover:bg-white/5",
              activeSection === "profile" ? "text-[#ff4d4f] bg-white/10 border-white/10" : "text-white/80"
            )}
            aria-label="Profile"
          >
            <User className="w-5 h-5" />
          </button>
          {isAuthenticated && (
            <button
              onClick={onLogout}
              className="p-3 rounded-full text-white/60 hover:text-[#ff4d4f] hover:bg-white/5 transition-all"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}