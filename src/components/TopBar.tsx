import { motion } from "framer-motion";
import { Search } from "lucide-react";
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
      className="top-bar fixed top-0 left-0 md:left-20 right-0 z-50 bg-[#0B0F19]/95 backdrop-blur-xl border-b border-white/5"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="max-w-[2000px] mx-auto px-4 md:px-10 py-4 flex items-center gap-4">
        <div className="md:hidden w-8 h-8">
          <img src="/assets/7e7b9501-d78c-4eb0-b98c-b49fdb807c8d.png" alt="Anime Logo" className="w-full h-full object-contain" />
        </div>

        <div className="relative flex-1 max-w-xl">
          <Search className="search-icon absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search anime..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search anime"
            className="w-full bg-white/5 border border-white/10 rounded-full pl-12 pr-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
        </div>

        {!isAuthenticated && (
          <Button
            variant="secondary"
            onClick={() => onProfileClick?.()}
            className="hidden sm:inline-flex h-10 rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            Sign In
          </Button>
        )}
      </div>
    </motion.header>
  );
}