import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";
import { AnimeCard } from "@/components/AnimeCard";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { useState } from "react";
import { useNavigate } from "react-router";

type AnimeItem = {
  title?: string;
  image?: string;
  type?: string;
  id?: string;
  dataId?: string;
  episodeNumber?: number;
  currentTime?: number;
  duration?: number;
};

export default function WatchHistory() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const continueWatching = useQuery(api.watchProgress.getContinueWatching);

  const watchHistoryItems: AnimeItem[] = (continueWatching || []).map((item) => ({
    title: item.animeTitle,
    image: item.animeImage,
    dataId: item.animeId,
    id: item.animeId,
    episodeNumber: item.episodeNumber,
    currentTime: item.currentTime,
    duration: item.duration,
  }));

  const filteredItems = watchHistoryItems.filter(item =>
    query ? (item.title ?? "").toLowerCase().includes(query.toLowerCase()) : true
  );

  if (continueWatching === undefined) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="text-gray-400">Loading watch history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white font-sans selection:bg-blue-500/30">
      <Sidebar activeSection="history" onSectionChange={(section) => {
        if (section === "home") navigate("/");
        else if (section === "history") navigate("/history");
      }} />
      <TopBar searchQuery={query} onSearchChange={setQuery} />

      <main className="ml-20 pt-20 transition-all duration-300">
        <div className="px-6 md:px-10 pb-10 max-w-[2000px] mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Watch History</h1>
            <p className="text-gray-400">Continue watching from where you left off</p>
          </div>

          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {filteredItems.map((item, idx) => (
                <AnimeCard 
                  key={item.id ?? idx} 
                  anime={item} 
                  onClick={() => navigate("/")}
                  index={idx}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">
                {query ? "No results found" : "No watch history yet"}
              </p>
              <p className="text-gray-500 mt-2">
                {query ? "Try a different search term" : "Start watching anime to see your history here"}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
