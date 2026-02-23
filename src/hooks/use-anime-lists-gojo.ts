import { useState, useEffect } from "react";
import { AnimeItem } from "@/shared/types";
import { logError, logInfo } from "@/lib/error-logger";
import { fetchGojoHomeAll, searchGojo } from "@/lib/gojo-api";

export function useAnimeListsGojo(isActive: boolean = true) {
  const [loading, setLoading] = useState(true);
  const [popularItems, setPopularItems] = useState<AnimeItem[]>([]);
  const [airingItems, setAiringItems] = useState<AnimeItem[]>([]);
  const [recentEpisodeItems, setRecentEpisodeItems] = useState<AnimeItem[]>([]);
  const [tvShowItems, setTVShowItems] = useState<AnimeItem[]>([]);
  const [spotlightItems, setSpotlightItems] = useState<AnimeItem[]>([]);
  const [heroAnime, setHeroAnime] = useState<AnimeItem | null>(null);

  // V5-only extra categories
  const [mostFavoriteItems, setMostFavoriteItems] = useState<AnimeItem[]>([]);
  const [latestCompletedItems, setLatestCompletedItems] = useState<AnimeItem[]>([]);
  const [newAddedItems, setNewAddedItems] = useState<AnimeItem[]>([]);
  const [topUpcomingItems, setTopUpcomingItems] = useState<AnimeItem[]>([]);
  const [topTenItems, setTopTenItems] = useState<AnimeItem[]>([]);
  const [genres, setGenres] = useState<string[]>([]);

  const [popularLoading, setPopularLoading] = useState(true);
  const [airingLoading, setAiringLoading] = useState(true);
  const [recentEpisodesLoading, setRecentEpisodesLoading] = useState(true);
  const [tvShowsLoading, setTVShowsLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AnimeItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [loadingMore] = useState<string | null>(null);

  // Always fetch data (not gated by isActive) so data is ready when needed
  useEffect(() => {
    let mounted = true;

    logInfo("Fetching all home data from Gojo API (single request)", "Gojo Initial Load");

    fetchGojoHomeAll()
      .then((data) => {
        if (!mounted) return;

        setSpotlightItems(data.spotlight);
        if (data.spotlight.length > 0) setHeroAnime(data.spotlight[0]);

        setPopularItems(data.popular);
        setAiringItems(data.airing);
        setRecentEpisodeItems(data.latestEpisode);
        setTVShowItems(data.trending);
        setMostFavoriteItems(data.mostFavorite);
        setLatestCompletedItems(data.latestCompleted);
        setNewAddedItems(data.newAdded);
        setTopUpcomingItems(data.topUpcoming);
        setTopTenItems(data.topTenToday);
        setGenres(data.genres);

        setLoading(false);
        setPopularLoading(false);
        setAiringLoading(false);
        setRecentEpisodesLoading(false);
        setTVShowsLoading(false);

        logInfo(`✅ Gojo HomeAll loaded - spotlight:${data.spotlight.length} popular:${data.popular.length}`, "Gojo Initial Load");
      })
      .catch((err) => {
        if (!mounted) return;
        logError("Gojo homeAll failed", "Gojo API", err instanceof Error ? err : undefined);
        setLoading(false);
        setPopularLoading(false);
        setAiringLoading(false);
        setRecentEpisodesLoading(false);
        setTVShowsLoading(false);
      });

    return () => { mounted = false; };
  }, []); // Run once on mount, always

  // Auto-rotate hero banner
  useEffect(() => {
    if (!heroAnime || spotlightItems.length === 0) return;
    const interval = setInterval(() => {
      setHeroAnime((prev) => {
        const currentIndex = spotlightItems.findIndex(item => item.id === prev?.id);
        const nextIndex = (currentIndex + 1) % spotlightItems.length;
        return spotlightItems[nextIndex];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [heroAnime, spotlightItems]);

  // Search handler
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const { results } = await searchGojo(query.trim());
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const loadMoreItems = async (_category: 'popular' | 'airing' | 'recentEpisodes' | 'tvShows') => {};

  // If not active, return empty/loading state so other hooks can be used
  if (!isActive) {
    return {
      loading: true,
      popularItems: [] as AnimeItem[],
      airingItems: [] as AnimeItem[],
      recentEpisodeItems: [] as AnimeItem[],
      tvShowItems: [] as AnimeItem[],
      heroAnime: null,
      popularLoading: true,
      airingLoading: true,
      recentEpisodesLoading: true,
      tvShowsLoading: true,
      query,
      setQuery,
      searchResults,
      isSearching,
      loadMoreItems,
      loadingMore,
      hasMore: { popular: false, airing: false, recentEpisodes: false, tvShows: false },
      mostFavoriteItems: [] as AnimeItem[],
      latestCompletedItems: [] as AnimeItem[],
      newAddedItems: [] as AnimeItem[],
      topUpcomingItems: [] as AnimeItem[],
      topTenItems: [] as AnimeItem[],
      genres: [] as string[],
    };
  }

  return {
    loading,
    popularItems,
    airingItems,
    recentEpisodeItems,
    tvShowItems,
    heroAnime,
    popularLoading,
    airingLoading,
    recentEpisodesLoading,
    tvShowsLoading,
    query,
    setQuery,
    searchResults,
    isSearching,
    loadMoreItems,
    loadingMore,
    hasMore: {
      popular: false,
      airing: false,
      recentEpisodes: false,
      tvShows: false,
    },
    // V5-only extras
    mostFavoriteItems,
    latestCompletedItems,
    newAddedItems,
    topUpcomingItems,
    topTenItems,
    genres,
  };
}