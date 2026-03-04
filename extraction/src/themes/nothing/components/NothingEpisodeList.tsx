import { Play, Film } from "lucide-react";

interface NothingEpisodeListProps {
  episodes: any[];
  episodesLoading: boolean;
  currentEpisodeId?: string;
  onPlayEpisode: (ep: any) => void;
}

export function NothingEpisodeList({
  episodes,
  episodesLoading,
  currentEpisodeId,
  onPlayEpisode
}: NothingEpisodeListProps) {
  return (
    <div id="episode-list-container" className="bg-white dark:bg-[#1A1D24] border border-black/5 dark:border-white/10 rounded-[24px] p-6 h-fit max-h-[calc(100vh-120px)] overflow-y-auto flex flex-col shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-white dark:bg-[#1A1D24] z-10 py-2 transition-colors duration-300">
        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/40">Episodes</h3>
        <span className="text-xs font-mono text-black/30 dark:text-white/30">{episodes.length} TOTAL</span>
      </div>
      
      {episodesLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#ff4d4f]/20 border-t-[#ff4d4f] rounded-full animate-spin" />
            <p className="text-sm text-black/40 dark:text-white/40 tracking-wider uppercase">Loading episodes...</p>
          </div>
        </div>
      ) : episodes.length > 0 ? (
        <div className="space-y-3">
          {episodes.map((ep) => {
            const progressPercentage =
              ep.currentTime && ep.duration ? (ep.currentTime / ep.duration) * 100 : 0;
            const isCurrentEpisode = currentEpisodeId === ep.id;

            return (
              <button
                key={ep.id}
                onClick={() => onPlayEpisode(ep)}
                className={`group relative w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                  isCurrentEpisode 
                    ? "bg-[#ff4d4f]/5 dark:bg-[#ff4d4f]/10 border-[#ff4d4f] shadow-[0_0_20px_rgba(255,77,79,0.1)]" 
                    : "bg-black/5 dark:bg-white/5 border-transparent hover:bg-black/10 dark:hover:bg-white/10 hover:border-black/10 dark:hover:border-white/10"
                }`}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-mono text-sm font-bold ${
                    isCurrentEpisode ? "bg-[#ff4d4f] text-white" : "bg-white dark:bg-[#2A2F3A] text-black/40 dark:text-white/40 group-hover:text-black dark:group-hover:text-white shadow-sm"
                  }`}>
                    {ep.number ?? "#"}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isCurrentEpisode ? "text-[#ff4d4f]" : "text-[#050814] dark:text-white group-hover:text-black dark:group-hover:text-white"}`}>
                      {ep.title || `Episode ${ep.number ?? "?"}`}
                    </p>
                    <p className="text-xs text-black/40 dark:text-white/40 font-mono mt-0.5">
                      EP {ep.number ?? "?"}
                    </p>
                  </div>

                  {isCurrentEpisode ? (
                    <div className="w-2 h-2 rounded-full bg-[#ff4d4f] animate-pulse" />
                  ) : (
                    <Play className="h-4 w-4 text-black/0 dark:text-white/0 group-hover:text-black/40 dark:group-hover:text-white/40 transition-all transform translate-x-2 group-hover:translate-x-0" />
                  )}
                </div>

                {progressPercentage > 0 && (
                  <div className="absolute inset-x-5 bottom-3 pointer-events-none">
                    <div className="h-1 rounded-full bg-[#ff4d4f]/15 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#ff4d4f] transition-all"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-black/20 dark:text-white/20">
          <div className="w-12 h-12 rounded-full border border-dashed border-black/10 dark:border-white/10 flex items-center justify-center mb-4">
            <Film className="h-6 w-6" />
          </div>
          <p className="text-sm tracking-widest uppercase">No episodes found</p>
        </div>
      )}
    </div>
  );
}
