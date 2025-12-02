import { Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TopBarProps {
  onSearch?: () => void;
  onProfile?: () => void;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function TopBar({ 
  onSearch, 
  onProfile, 
  activeSection = "home", 
  onSectionChange,
  searchQuery,
  onSearchChange 
}: TopBarProps) {
  const navItems = [
    { id: "home", label: "HOME" },
    { id: "tv", label: "BROWSE" },
    { id: "movies", label: "MOVIES" },
    { id: "recent", label: "TV SHOWS" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-6">
      <div className="container mx-auto px-6 md:px-10">
        <div className="bg-white/80 backdrop-blur-lg rounded-full shadow-lg border border-gray-200 h-16 flex items-center justify-between px-8">
          {/* Logo */}
          <div className="flex items-center">
            <div className="font-display text-lg tracking-widest uppercase font-bold">
              Anime
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-12 font-display text-sm tracking-wider">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSectionChange?.(item.id)}
                className={cn(
                  "relative transition-colors",
                  activeSection === item.id
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                {item.label}
                {activeSection === item.id && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gray-900 rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-6">
            <button
              onClick={onSearch}
              className="text-gray-500 hover:text-gray-900 transition-colors relative"
            >
              <Search className="h-5 w-5" />
              <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#FF3333] rounded-full" />
            </button>
            <button
              onClick={onProfile}
              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center"
            >
              <User className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}