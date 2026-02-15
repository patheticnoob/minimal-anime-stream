import { Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopBarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  onProfileClick: () => void;
  onSearch?: () => void;
  onProfile?: () => void;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function TopBar({ 
  isDarkMode: _isDarkMode, 
  toggleTheme: _toggleTheme,
  onProfileClick,
  onSearch, 
  onProfile: _onProfile, 
  activeSection = "home", 
  onSectionChange,
  searchQuery: _searchQuery,
  onSearchChange: _onSearchChange 
}: TopBarProps) {
  const navItems = [
    { id: "home", label: "HOME" },
    { id: "tv", label: "BROWSE" },
    { id: "movies", label: "MOVIES" },
    { id: "recent", label: "TV SHOWS" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-6 md:px-10">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="font-display text-xl tracking-widest uppercase font-bold text-gray-900">
              Anime
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-10 font-display text-sm tracking-wider">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSectionChange?.(item.id)}
                className={cn(
                  "relative py-5 transition-colors font-medium",
                  activeSection === item.id
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                {item.label}
                {activeSection === item.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                )}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={onSearch}
              className="text-gray-500 hover:text-gray-900 transition-colors p-2"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              onClick={onProfileClick}
              className="w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center"
            >
              <User className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}