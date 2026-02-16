import Landing from "@/pages/Landing";
import { NothingNavBar } from "../components/NothingNavBar";
import { useNothingTheme } from "../hooks/useNothingTheme";

export default function NothingLanding() {
  const { isDarkMode, toggleTheme } = useNothingTheme();

  // Memoize the component to prevent unnecessary re-renders of the navbar
  const NavBarWithDarkMode = (props: any) => (
    <NothingNavBar
      {...props}
      isDarkMode={isDarkMode}
      onToggleDarkMode={toggleTheme}
    />
  );

  return (
    <div data-theme="nothing" className={`w-full min-h-screen ${isDarkMode ? "dark" : ""}`}>
      <Landing 
        NavBarComponent={NavBarWithDarkMode}
      />
    </div>
  );
}