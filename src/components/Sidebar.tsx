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
      className="fixed left-0 top-0 h-screen w-20 md:w-24 bg-gradient-to-b from-[#1a1f2e] to-[#0B0F19] border-r border-white/5 shadow-[inset_-10px_0_20px_-10px_rgba(0,0,0,0.5)] z-40 flex flex-col items-center py-6"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo */}
      <div className="mb-8">
        <img src="/logo.svg" alt="Logo" className="w-10 h-10 md:w-12 md:h-12 drop-shadow-lg" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 w-full flex flex-col gap-4 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <div key={item.id} className="flex flex-col items-center gap-1 group cursor-pointer" onClick={() => onSectionChange?.(item.id)}>
              <div
                className={`p-3 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] scale-110"
                    : "text-gray-400 group-hover:text-white group-hover:bg-white/10"
                }`}
              >
                <Icon className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <span className={`text-[10px] md:text-xs font-medium transition-colors ${isActive ? "text-white" : "text-gray-500 group-hover:text-gray-300"}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </nav>

      {/* Search Button (Mobile) */}
      <div className="md:hidden mt-auto">
        <Button variant="ghost" className="text-gray-400 hover:text-white">
          <Search className="h-6 w-6" />
        </Button>
      </div>
    </motion.aside>
  );
}