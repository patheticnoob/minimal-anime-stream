import { motion } from "framer-motion";
import { Search, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onProfileClick?: () => void;
  isAuthenticated?: boolean;
}

export function TopBar({
  searchQuery,
  onSearchChange,
  onProfileClick,
  isAuthenticated,
}: TopBarProps) {
  return (
    <motion.header
      className="top-bar fixed top-0 left-0 md:left-20 right-0 z-50 bg-gradient-to-b from-[#050814] to-transparent pt-2 pb-6 pointer-events-none"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="max-w-[2000px] mx-auto px-4 md:px-10 flex items-center gap-4 pointer-events-auto">
        {/* Mobile Logo */}
        <div className="md:hidden w-8 h-8 rounded-lg overflow-hidden shadow-lg shadow-blue-500/20">
          <img src="/assets/7e7b9501-d78c-4eb0-b98c-b49fdb807c8d.png" alt="Anime Logo" className="w-full h-full object-cover" />
        </div>

        {/* Search Bar - Pill Shaped & Frosted */}
        <div className="relative flex-1 max-w-md ml-auto md:ml-0">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-md rounded-full border border-white/10 shadow-lg" />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Movies, shows and more"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search anime"
            className="relative w-full bg-transparent border-none rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-0 transition-all"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-300 hover:text-white hover:bg-white/10 rounded-full"
          >
            <Bell className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onProfileClick?.()}
            className="text-gray-300 hover:text-white hover:bg-white/10 rounded-full"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </motion.header>
  );
}