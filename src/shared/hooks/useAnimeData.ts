import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useAnimeData() {
  const continueWatching = useQuery(api.watchProgress.getContinueWatching);
  const watchlist = useQuery(api.watchlist.getWatchlist);

  return {
    continueWatching,
    watchlist,
  };
}
