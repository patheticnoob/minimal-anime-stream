import Landing from "@/pages/Landing";
import { useNavigate } from "react-router";

export default function NothingLanding() {
  const navigate = useNavigate();
  
  // Override the openAnime behavior for NothingOS theme
  const handleAnimeClick = (anime: any) => {
    if (!anime?.dataId) return;
    
    // Store anime data for Watch page
    localStorage.setItem(`anime_${anime.dataId}`, JSON.stringify(anime));
    
    // Navigate to Watch page
    navigate(`/watch/${anime.dataId}`);
  };

  return (
    <div data-theme="nothing">
      <Landing />
    </div>
  );
}