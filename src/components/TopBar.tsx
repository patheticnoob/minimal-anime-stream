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
    <motion.header
      className="fixed top-0 left-20 md:left-64 right-0 h-16 bg-[#0B0F19]/95 backdrop-blur border-b border-gray-800 z-30"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      <div className="h-full px-4 md:px-8 flex items-center justify-between gap-4">
        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search anime, movies, shows..."
              className="pl-10 bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-500"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white">
            <Bell className="h-5 w-5" />
          </Button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
        </div>
      </div>
    </motion.header>
  );
}
