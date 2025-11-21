import { motion } from "framer-motion";
import { Home, Tv, Film, Trophy, Sparkles, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export function Sidebar({ activeSection = "home", onSectionChange }: SidebarProps) {
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "tv", label: "TV Shows", icon: Tv },
    { id: "movies", label: "Movies", icon: Film },
    { id: "sports", label: "Sports", icon: Trophy },
    { id: "popular", label: "Popular", icon: Sparkles },
    { id: "recent", label: "Recently Added", icon: Clock },
  ];

  return (
    <motion.aside
      className="fixed left-0 top-0 h-screen w-20 md:w-64 bg-[#0B0F19] border-r border-gray-800 z-40 flex flex-col"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 md:p-6 border-b border-gray-800">
        <img src="/logo.svg" alt="Logo" className="w-8 h-8 md:w-10 md:h-10" />
        <span className="hidden md:block text-xl font-bold text-white">Anime Stream</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-2 md:px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onSectionChange?.(item.id)}
              className={`w-full justify-start gap-3 px-3 md:px-4 py-3 transition-all ${
                isActive
                  ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="hidden md:block">{item.label}</span>
            </Button>
          );
        })}
      </nav>

      {/* Search Button (Mobile) */}
      <div className="md:hidden p-4 border-t border-gray-800">
        <Button variant="ghost" className="w-full justify-center text-gray-400 hover:text-white">
          <Search className="h-5 w-5" />
        </Button>
      </div>
    </motion.aside>
  );
}
