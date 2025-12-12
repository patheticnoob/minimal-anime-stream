import { useState, useEffect } from "react";
import Landing from "@/pages/Landing";
import { NothingNavBar } from "../components/NothingNavBar";

export default function NothingLanding() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("nothing-dark-mode");
    return saved === "true";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("nothing-dark-mode", String(isDarkMode));
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const NavBarWithDarkMode = (props: any) => (
    <NothingNavBar
      {...props}
      isDarkMode={isDarkMode}
      onToggleDarkMode={handleToggleDarkMode}
    />
  );

  return (
    <div data-theme="nothing" className="w-full min-h-screen">
      <Landing NavBarComponent={NavBarWithDarkMode} />
    </div>
  );
}