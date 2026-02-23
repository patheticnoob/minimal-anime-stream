import { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AnimeItem } from "@/shared/types";
import { logError, logInfo } from "@/lib/error-logger";
import {
  fetchGojoSpotlight,
  fetchGojoCategory,
  searchGojo,
  fetchGojoTopTen,
} from "@/lib/gojo-api";

export function useAnimeListsGojo(isActive: boolean = true) {
  useAction(api.hianime.topAiring);
  useAction(api.hianime.mostPopular);
  useAction(api.hianime.movies);
  useAction(api.hianime.tvShows);
  useAction(api.hianime.search);

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

  const [popularHasMore] = useState(false);
  const [airingHasMore] = useState(false);
  const [recentEpisodesHasMore] = useState(false);
  const [tvShowHasMore] = useState(false);
  const [loadingMore] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive) return;

    let mounted = true;

    logInfo("Fetching spotlight from Gojo API", "Gojo Initial Load");
    fetchGojoSpotlight()
      .then(({ results }) => {
        if (!mounted) return;
        setSpotlightItems(results);
        if (results.length > 0) setHeroAnime(results[0]);
        setLoading(false);
        logInfo(`✅ Gojo Spotlight loaded - ${results.length} items`, "Gojo Initial Load");
      })
      .catch((err) => {
        if (!mounted) return;
        logError("Gojo spotlight failed", "Gojo API", err instanceof Error ? err : undefined);
        setLoading(false);
      });

    fetchGojoCategory("mostPopular")
      .then(({ results }) => {
        if (!mounted) return;
        setPopularItems(results);
        setPopularLoading(false);
      })
      .catch(() => { if (mounted) setPopularLoading(false); });

    fetchGojoCategory("topAiring")
      .then(({ results }) => {
        if (!mounted) return;
        setAiringItems(results);
        setAiringLoading(false);
      })
      .catch(() => { if (mounted) setAiringLoading(false); });

    fetchGojoCategory("latestEpisode")
      .then(({ results }) => {
        if (!mounted) return;
        setRecentEpisodeItems(results);
        setRecentEpisodesLoading(false);
      })
      .catch(() => { if (mounted) setRecentEpisodesLoading(false); });

    fetchGojoCategory("trending")
      .then(({ results }) => {
        if (!mounted) return;
        setTVShowItems(results);
        setTVShowsLoading(false);
      })
      .catch(() => { if (mounted) setTVShowsLoading(false); });

    // V5-only extra categories — fetch from home endpoint
    fetchGojoCategory("mostFavorite")
      .then(({ results }) => { if (mounted) setMostFavoriteItems(results); })
      .catch(() => {});

    fetchGojoCategory("latestCompleted")
      .then(({ results }) => { if (mounted) setLatestCompletedItems(results); })
      .catch(() => {});

    fetchGojoCategory("newAdded")
      .then(({ results }) => { if (mounted) setNewAddedItems(results); })
      .catch(() => {});

    fetchGojoCategory("topUpcoming")
      .then(({ results }) => { if (mounted) setTopUpcomingItems(results); })
      .catch(() => {});

    // Top Ten today
    fetchGojoTopTen("today")
      .then(({ results }) => { if (mounted) setTopTenItems(results); })
      .catch(() => {});

    // Genres from home
    import("@/lib/gojo-api").then(({ fetchGojoHome: _fetchGojoHome }) => {
      fetch("https://gojoback.zeabur.app/api/v1/home")
        .then(r => r.json())
        .then((data: any) => {
          if (mounted && data?.success && Array.isArray(data?.data?.genres)) {
            setGenres(data.data.genres);
          }
        })
        .catch(() => {});
    });

    return () => { mounted = false; };
  }, [isActive]);

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
      popular: popularHasMore,
      airing: airingHasMore,
      recentEpisodes: recentEpisodesHasMore,
      tvShows: tvShowHasMore,
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