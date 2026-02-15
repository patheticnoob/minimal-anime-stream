import { Home, Clock, Bookmark, User, Moon, Sun, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useGamepad, GAMEPAD_BUTTONS } from "@/hooks/use-gamepad";
import { GamepadSettings } from "@/components/GamepadSettings";

interface SidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export function Sidebar({ activeSection = "home", onSectionChange }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showGamepadSettings, setShowGamepadSettings] = useState(false);
  const { buttonPressed } = useGamepad();

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "search", label: "Search", icon: Search },
    { id: "tv", label: "TV", icon: Tv },
    { id: "movies", label: "Movies", icon: Film },
    { id: "popular", label: "Hot", icon: Sparkles },
    { id: "profile", label: "My Space", icon: User },
  ];

  const handleNavClick = (sectionId: string) => {
    onSectionChange?.(sectionId);
    setIsMobileMenuOpen(false);
  };

  // Open gamepad settings with START button
  useEffect(() => {
    if (buttonPressed === GAMEPAD_BUTTONS.START) {
      setShowGamepadSettings(true);
    }
  }, [buttonPressed]);

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

      {/* Mobile Top Navigation Bar */}
      <nav className="mobile-top-nav md:hidden">
        <button
          className="mobile-menu-button"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="mobile-nav-actions">
          <button
            className={`mobile-nav-icon-btn ${activeSection === "search" ? "active" : ""}`}
            onClick={() => handleNavClick("search")}
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            className={`mobile-nav-icon-btn ${activeSection === "profile" ? "active" : ""}`}
            onClick={() => handleNavClick("profile")}
            aria-label="My Space"
          >
            <User className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* Gamepad Settings Modal */}
      <GamepadSettings
        isOpen={showGamepadSettings}
        onClose={() => setShowGamepadSettings(false)}
      />

      {/* Mobile Side Panel Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-side-panel-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-side-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-side-panel-header">
              <div className="mobile-side-panel-logo">
                <img src="/assets/7e7b9501-d78c-4eb0-b98c-b49fdb807c8d.png" alt="Anime Logo" className="w-full h-full object-contain" />
              </div>
              <button
                className="mobile-side-panel-close"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="mobile-side-panel-nav">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <button
                    key={item.id}
                    className={`mobile-side-panel-item ${isActive ? "active" : ""}`}
                    onClick={() => handleNavClick(item.id)}
                  >
                    <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}