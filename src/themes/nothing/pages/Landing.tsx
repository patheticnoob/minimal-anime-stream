import Landing from "@/pages/Landing";
import { NothingNavBar } from "../components/NothingNavBar";
import { useNothingTheme } from "../hooks/useNothingTheme";

export default function NothingLanding() {
  const { isDarkMode, toggleTheme } = useNothingTheme();

  const NavBarWithDarkMode = (props: any) => (
    <NothingNavBar
      {...props}
      isDarkMode={isDarkMode}
      onToggleDarkMode={toggleTheme}
    />
  );

  return (
    <Landing 
      NavBarComponent={NavBarWithDarkMode}
    />
  );
}