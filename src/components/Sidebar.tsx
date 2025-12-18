import { Home, Tv, Film, Sparkles, History, User, Search, Menu, X, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { useGamepad, GAMEPAD_BUTTONS } from "@/hooks/use-gamepad";
import { GamepadSettings } from "@/components/GamepadSettings";

interface SidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export function Sidebar({ activeSection = "home", onSectionChange }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [focusedNavIndex, setFocusedNavIndex] = useState(0);
  const [isSidebarFocused, setIsSidebarFocused] = useState(false);
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

  // Gamepad navigation for Sidebar
  useEffect(() => {
    if (buttonPressed === null || !isSidebarFocused) return;

    switch (buttonPressed) {
      case GAMEPAD_BUTTONS.DPAD_UP:
        setFocusedNavIndex(prev => Math.max(0, prev - 1));
        break;

      case GAMEPAD_BUTTONS.DPAD_DOWN:
        setFocusedNavIndex(prev => Math.min(navItems.length - 1, prev + 1));
        break;

      case GAMEPAD_BUTTONS.A:
        handleNavClick(navItems[focusedNavIndex].id);
        break;

      case GAMEPAD_BUTTONS.B:
        setIsSidebarFocused(false);
        break;

      case GAMEPAD_BUTTONS.START:
        setIsSidebarFocused(true);
        break;
    }
  }, [buttonPressed, isSidebarFocused, focusedNavIndex, navItems]);

  // Auto-scroll focused nav item into view
  useEffect(() => {
    if (isSidebarFocused && focusedNavIndex >= 0) {
      const navElement = document.querySelector(`[data-sidebar-nav-index="${focusedNavIndex}"]`);
      if (navElement) {
        navElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [focusedNavIndex, isSidebarFocused]);

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
            {isSidebarFocused && (
              <div className="text-xs text-blue-400 mb-2 px-4 flex items-center justify-between">
                <span>Gamepad Active - Press B to exit</span>
                <button
                  onClick={() => setShowGamepadSettings(true)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  title="Gamepad Settings"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            )}
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              const isFocused = isSidebarFocused && focusedNavIndex === idx;
              
              return (
                <button
                  key={item.id}
                  data-sidebar-nav-index={idx}
                  className={`nav-item ${isActive ? "nav-item--active" : ""} ${
                    isFocused ? "ring-4 ring-blue-400 bg-blue-500/20 shadow-lg shadow-blue-500/50 scale-105" : ""
                  }`}
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