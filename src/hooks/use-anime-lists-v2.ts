import { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AnimeItem } from "@/shared/types";
import { logError, logWarn, logInfo } from "@/lib/error-logger";
import {
  fetchHianimeHome,
  fetchHianimeSpotlight,
  fetchHianimeCategory,
  searchHianime,
} from "@/lib/external-api-v2";

// Retry helper function with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        logWarn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`, 'API Retry');
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

export function useAnimeListsV2() {
  // Add dummy hook calls to match v1's hook structure (to avoid React Hooks Rules violation)
  // V1 has 5 useAction calls, so we add 5 matching useAction calls here (unused but necessary for hook order)
  const _dummyAction1 = useAction(api.hianime.topAiring);
  const _dummyAction2 = useAction(api.hianime.mostPopular);
  const _dummyAction3 = useAction(api.hianime.movies);
  const _dummyAction4 = useAction(api.hianime.tvShows);
  const _dummyAction5 = useAction(api.hianime.search);

  const [loading, setLoading] = useState(true);
  const [popularItems, setPopularItems] = useState<AnimeItem[]>([]);
  const [airingItems, setAiringItems] = useState<AnimeItem[]>([]);
  const [movieItems, setMovieItems] = useState<AnimeItem[]>([]);
  const [tvShowItems, setTVShowItems] = useState<AnimeItem[]>([]);
  const [heroAnime, setHeroAnime] = useState<AnimeItem | null>(null);

  const [popularLoading, setPopularLoading] = useState(true);
  const [airingLoading, setAiringLoading] = useState(true);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [tvShowsLoading, setTVShowsLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AnimeItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [popularPage] = useState(1);
  const [airingPage] = useState(1);
  const [moviePage] = useState(1);
  const [tvShowPage] = useState(1);

  const [popularHasMore] = useState(false); // V2 doesn't support pagination yet
  const [airingHasMore] = useState(false);
  const [movieHasMore] = useState(false);
  const [tvShowHasMore] = useState(false);

  const [loadingMore, setLoadingMore] = useState<string | null>(null);

  // Load content from Hianime API v2
  useEffect(() => {
    let mounted = true;

    // Load Spotlight (use as "popular")
    logInfo('Fetching spotlight from Hianime v2', 'Initial Load');
    console.log('[V2 Hook] ===== FETCHING SPOTLIGHT API =====');
    retryWithBackoff(() => fetchHianimeSpotlight())
      .then((data) => {
        if (!mounted) return;
        console.log('[V2 Hook] ===== SPOTLIGHT DATA RECEIVED =====');
        console.log('[V2 Hook] Number of items:', data.results.length);
        if (data.results[0]) {
          console.log('[V2 Hook] First item sample:', {
            title: data.results[0].title,
            synopsis: data.results[0].synopsis?.substring(0, 50),
            quality: data.results[0].quality,
            rank: data.results[0].rank,
            aired: data.results[0].aired
          });
        }
        setPopularItems(data.results);

        if (data.results && data.results.length > 0) {
          const randomIndex = Math.floor(Math.random() * Math.min(5, data.results.length));
          const heroItem = data.results[randomIndex];
          setHeroAnime(heroItem);
          console.log('[V2 Hook - Spotlight] Hero anime set from SPOTLIGHT API:', {
            title: heroItem.title,
            synopsis: heroItem.synopsis?.substring(0, 50) + '...',
            quality: heroItem.quality,
            rank: heroItem.rank,
            hasRichData: !!(heroItem.synopsis || heroItem.quality || heroItem.rank)
          });
        }

        setPopularLoading(false);
        setLoading(false);
        logInfo('Spotlight loaded from Hianime v2', 'Initial Load');
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load spotlight";
        console.error('[V2 Hook] Error loading spotlight:', err);
        logError(msg, 'Hianime Spotlight', err instanceof Error ? err : undefined);
        setPopularLoading(false);
        setLoading(false);
      });

    // Load Latest Episodes (use as "airing")
    logInfo('Fetching latest episodes from Hianime v2', 'Initial Load');
    retryWithBackoff(() => fetchHianimeCategory('latestEpisode'))
      .then((data) => {
        if (!mounted) return;
        setAiringItems(data.results);
        setAiringLoading(false);
        logInfo('Latest episodes loaded from Hianime v2', 'Initial Load');
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load latest episodes";
        logError(msg, 'Hianime Latest Episodes', err instanceof Error ? err : undefined);
        setAiringLoading(false);
      });

    // Load Most Popular (filter for movies)
    logInfo('Fetching most popular from Hianime v2', 'Initial Load');
    retryWithBackoff(() => fetchHianimeCategory('mostPopular'))
      .then((data) => {
        if (!mounted) return;
        // Filter for movies
        const movies = data.results.filter(item => item.type?.toLowerCase() === 'movie');
        setMovieItems(movies);
        setMoviesLoading(false);
        logInfo('Movies loaded from Hianime v2', 'Initial Load');
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load movies";
        logError(msg, 'Hianime Movies', err instanceof Error ? err : undefined);
        setMoviesLoading(false);
      });

    // Load Top Airing (filter for TV shows)
    logInfo('Fetching top airing from Hianime v2', 'Initial Load');
    retryWithBackoff(() => fetchHianimeCategory('topAiring'))
      .then((data) => {
        if (!mounted) return;
        // Filter for TV shows
        const tvShows = data.results.filter(item => item.type?.toLowerCase() === 'tv');
        setTVShowItems(tvShows);
        setTVShowsLoading(false);
        logInfo('TV shows loaded from Hianime v2', 'Initial Load');
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load TV shows";
        logError(msg, 'Hianime TV Shows', err instanceof Error ? err : undefined);
        setTVShowsLoading(false);
      });

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-rotate hero banner
  useEffect(() => {
    if (!heroAnime || popularItems.length === 0) return;

    const heroPool = popularItems.slice(0, 5);
    if (heroPool.length === 0) return;

    const interval = setInterval(() => {
      setHeroAnime((prev) => {
        const currentIndex = heroPool.findIndex(item => item.id === prev?.id);
        const nextIndex = (currentIndex + 1) % heroPool.length;
        return heroPool[nextIndex];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [heroAnime, popularItems]);

  // Search handler
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      logInfo(`Searching Hianime v2 for: ${query}`, 'Search');
      try {
        const results = await retryWithBackoff(() => searchHianime(query.trim(), 1));
        setSearchResults(results.results);
        logInfo(`Hianime v2 search completed: ${results.results.length} results`, 'Search');
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Search failed";
        logError(msg, 'Hianime Search', err instanceof Error ? err : undefined);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const loadMoreItems = async (category: 'popular' | 'airing' | 'movies' | 'tvShows') => {
    setLoadingMore(category);
    logInfo(`Load more not supported in v2 for: ${category}`, 'Pagination');
    setLoadingMore(null);
    // V2 API doesn't support pagination yet, so this is a no-op
  };

  return {
    loading,
    popularItems,
    airingItems,
    movieItems,
    tvShowItems,
    heroAnime,
    popularLoading,
    airingLoading,
    moviesLoading,
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
      movies: movieHasMore,
      tvShows: tvShowHasMore,
    }
  };
}
