import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function TopBar({ searchQuery, onSearchChange }: TopBarProps) {
  return (
    <header className="top-bar fixed top-0 left-0 md:left-20 right-0 z-50 bg-[#0B0F19]/95 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-[2000px] mx-auto px-4 md:px-10 py-4 flex items-center gap-4">
        {/* Mobile Logo */}
        <div className="md:hidden w-8 h-8">
          <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain" />
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xl">
          <Search className="search-icon absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search anime..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full pl-12 pr-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
        </div>
      </div>
    </header>
  );
}