import { Home, Tv, Film, Trophy, Sparkles, Clock } from "lucide-react";

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
    <aside className="sidebar">
      <div className="sidebar-inner">
        {/* Logo */}
        <div className="sidebar-logo">
          <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain" />
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? "nav-item--active" : ""}`}
                onClick={() => onSectionChange?.(item.id)}
              >
                <span className="nav-icon">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}