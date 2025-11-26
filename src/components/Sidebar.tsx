import { Home, Tv, Film, Sparkles, History, User, Search } from "lucide-react";

interface SidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export function Sidebar({ activeSection = "home", onSectionChange }: SidebarProps) {
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "search", label: "Search", icon: Search },
    { id: "tv", label: "TV", icon: Tv },
    { id: "movies", label: "Movies", icon: Film },
    { id: "popular", label: "Hot", icon: Sparkles },
    { id: "profile", label: "My Space", icon: User },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar hidden md:flex">
        <div className="sidebar-inner">
          {/* Logo */}
          <div className="sidebar-logo">
            <img src="/assets/7e7b9501-d78c-4eb0-b98c-b49fdb807c8d.png" alt="Anime Logo" className="w-full h-full object-contain" />
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
                    <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                  </span>
                  <span className="nav-label">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              className={`mobile-nav-item ${isActive ? "mobile-nav-item--active" : ""}`}
              onClick={() => onSectionChange?.(item.id)}
            >
              <Icon strokeWidth={isActive ? 2.5 : 1.5} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}