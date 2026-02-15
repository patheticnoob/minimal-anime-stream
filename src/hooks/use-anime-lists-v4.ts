import { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AnimeItem } from "@/shared/types";
import { logError, logWarn, logInfo } from "@/lib/error-logger";

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

// Helper function to extract numeric dataId from Yuma's full ID
// Yuma returns: "one-piece-100" → Extract: "100"
// This is needed because Hianime package expects just the numeric ID
function extractDataId(yumaId: string): string {
  const parts = yumaId.split('-');
  const lastPart = parts[parts.length - 1];

  // If last part is numeric, use it as dataId
  if (/^\d+$/.test(lastPart)) {
    return lastPart;
  }

  // Fallback: return full ID (will likely fail but at least we tried)
  logWarn(`Could not extract numeric dataId from: ${yumaId}, using full ID`, 'V4 DataId Extraction');
  return yumaId;
}

// Fetch from Yuma API
async function fetchYumaEndpoint(endpoint: string, page: number = 1): Promise<{ results: AnimeItem[]; hasNextPage: boolean }> {
  try {
    const response = await fetch(`https://yumaapi.vercel.app/${endpoint}?page=${page}`);
    if (!response.ok) {
      logWarn(`Yuma API returned ${response.status} for ${endpoint}`, 'Yuma API');
      return { results: [], hasNextPage: false };
    }

    const data = await response.json();

    const results = (data.results || []).map((item: any) => ({
      id: item.id,
      dataId: extractDataId(item.id), // 🔧 FIX: Extract numeric ID for Hianime compatibility
      title: item.title,
      image: item.image,
      type: item.type,
      language: {
        sub: item.sub ? String(item.sub) : null,
        dub: item.dub ? String(item.dub) : null,
      },
      // V4 specific: Store Yuma metadata
      duration: item.duration,
      episodes: item.episodes,
      japaneseTitle: item.japanese_title,
    }));

    return {
      results,
      hasNextPage: data.has_next_page || data.hasNextPage || false
    };
  } catch (error) {
    logError(`Yuma API Error for ${endpoint}`, 'Yuma API', error instanceof Error ? error : undefined);
    return { results: [], hasNextPage: false };
  }
}

// Fetch spotlight anime for hero banner
async function fetchSpotlight(): Promise<AnimeItem[]> {
  try {
    const response = await fetch('https://yumaapi.vercel.app/spotlight');
    if (!response.ok) {
      logWarn(`Yuma Spotlight API returned ${response.status}`, 'Yuma API');
      return [];
    }

    const data = await response.json();

    // The spotlight endpoint returns an array directly
    return (Array.isArray(data) ? data : []).map((item: any) => ({
      id: item.id,
      dataId: extractDataId(item.id), // 🔧 FIX: Extract numeric ID for Hianime compatibility
      title: item.title,
      image: item.image,
      type: item.type,
      language: {
        sub: item.sub ? String(item.sub) : null,
        dub: item.dub ? String(item.dub) : null,
      },
      duration: item.duration,
      episodes: item.episodes,
      japaneseTitle: item.japanese_title,
      // Additional spotlight-specific data
      description: item.other_data?.description,
      rank: item.other_data?.rank,
      releaseDate: item.other_data?.releaseDate,
      nsfw: item.nsfw,
    }));
  } catch (error) {
    logError('Yuma Spotlight API failed', 'Yuma API', error instanceof Error ? error : undefined);
    return [];
  }
}

// Search Yuma API
async function searchYuma(query: string): Promise<AnimeItem[]> {
  try {
    const response = await fetch(`https://yumaapi.vercel.app/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    return (data.results || []).map((item: any) => ({
      id: item.id,
      dataId: extractDataId(item.id), // 🔧 FIX: Extract numeric ID for Hianime compatibility
      title: item.title,
      image: item.image,
      type: item.type,
      language: {
        sub: item.sub ? String(item.sub) : null,
        dub: item.dub ? String(item.dub) : null,
      },
      duration: item.duration,
      episodes: item.episodes,
      japaneseTitle: item.japanese_title,
    }));
  } catch (error) {
    logError('Yuma search failed', 'Yuma API', error instanceof Error ? error : undefined);
    return [];
  }
}

/**
 * V4 Hybrid Hook: Best of Both Worlds
 * - Home page data: Yuma API (better spotlight, descriptions, rankings)
 * - Episodes & Streaming: Hianime package (reliable, proven)
 *
 * This hook only handles HOME PAGE data. Episodes and streaming are handled
 * by use-player-logic.ts which uses api.hianime actions (same for all versions).
 */
export function useAnimeListsV4(isActive: boolean = true) {
  // Add dummy hook calls to match v1's hook structure (to avoid React Hooks Rules violation)
  // V1 has 5 useAction calls, so we add 5 matching useAction calls here (unused but necessary for hook order)
  useAction(api.hianime.topAiring);
  useAction(api.hianime.mostPopular);
  useAction(api.hianime.movies);
  useAction(api.hianime.tvShows);
  useAction(api.hianime.search);

  const [loading, setLoading] = useState(!isActive);
  const [popularItems, setPopularItems] = useState<AnimeItem[]>([]);
  const [airingItems, setAiringItems] = useState<AnimeItem[]>([]);
  const [recentEpisodeItems, setRecentEpisodeItems] = useState<AnimeItem[]>([]);
  const [tvShowItems, setTVShowItems] = useState<AnimeItem[]>([]);
  const [spotlightItems, setSpotlightItems] = useState<AnimeItem[]>([]);
  const [heroAnime, setHeroAnime] = useState<AnimeItem | null>(null);

  const [popularLoading, setPopularLoading] = useState(true);
  const [airingLoading, setAiringLoading] = useState(true);
  const [recentEpisodesLoading, setRecentEpisodesLoading] = useState(true);
  const [tvShowsLoading, setTVShowsLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AnimeItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [popularPage, setPopularPage] = useState(1);
  const [airingPage, setAiringPage] = useState(1);
  const [recentEpisodesPage, setRecentEpisodesPage] = useState(1);
  const [tvShowPage, setTVShowPage] = useState(1);

  const [popularHasMore, setPopularHasMore] = useState(false);
  const [airingHasMore, setAiringHasMore] = useState(false);
  const [recentEpisodesHasMore, setRecentEpisodesHasMore] = useState(false);
  const [tvShowHasMore, setTVShowHasMore] = useState(false);

  const [loadingMore, setLoadingMore] = useState<string | null>(null);

  // Load content progressively from Yuma API
  useEffect(() => {
    if (!isActive) {
      console.log('[V4 Hook] Skipping fetch - hook is inactive');
      return;
    }

    let mounted = true;

    // Load Spotlight items for hero banner (V4 Feature: Rich hero data)
    logInfo('Fetching spotlight from Yuma (v4 hybrid flow)', 'Initial Load');
    retryWithBackoff(() => fetchSpotlight())
      .then((spotlightData) => {
        if (!mounted) return;
        setSpotlightItems(spotlightData);

        // Set the first spotlight item as the initial hero
        if (spotlightData && spotlightData.length > 0) {
          setHeroAnime(spotlightData[0]);
        }

        setLoading(false);
        logInfo(`✅ V4 Spotlight loaded - ${spotlightData.length} items with descriptions & rankings`, 'Initial Load');
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load spotlight";
        logError(msg, 'Yuma Spotlight', err instanceof Error ? err : undefined);
        setLoading(false);
      });

    // Load Top Airing as "popular" section
    logInfo('Fetching top airing from Yuma (v4 hybrid flow)', 'Initial Load');
    retryWithBackoff(() => fetchYumaEndpoint('top-airing', 1))
      .then((data) => {
        if (!mounted) return;
        setPopularItems(data.results);
        setPopularHasMore(data.hasNextPage);
        setPopularLoading(false);
        logInfo('✅ V4 Top airing loaded from Yuma', 'Initial Load');
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load top airing";
        logError(msg, 'Yuma Top Airing', err instanceof Error ? err : undefined);
        setPopularLoading(false);
      });

    // Load recent episodes (use as "airing")
    logInfo('Fetching recent episodes from Yuma (v4 hybrid flow)', 'Initial Load');
    retryWithBackoff(() => fetchYumaEndpoint('recent-episodes', 1))
      .then((data) => {
        if (!mounted) return;
        setAiringItems(data.results);
        setAiringHasMore(data.hasNextPage);
        setAiringLoading(false);
        logInfo('✅ V4 Recent episodes loaded from Yuma', 'Initial Load');
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load recent episodes";
        logError(msg, 'Yuma Recent Episodes', err instanceof Error ? err : undefined);
        setAiringLoading(false);
      });

    // Load recent episodes
    logInfo('Fetching recent episodes from Yuma (v4 hybrid flow)', 'Initial Load');
    retryWithBackoff(() => fetchYumaEndpoint('recent-episodes', 1))
      .then((data) => {
        if (!mounted) return;
        setRecentEpisodeItems(data.results);
        setRecentEpisodesHasMore(data.hasNextPage);
        setRecentEpisodesLoading(false);
        logInfo('✅ V4 Recent episodes loaded from Yuma', 'Initial Load');
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load recent episodes";
        logError(msg, 'Yuma Recent Episodes', err instanceof Error ? err : undefined);
        setRecentEpisodesLoading(false);
      });

    // Load TV shows
    logInfo('Fetching TV shows from Yuma (v4 hybrid flow)', 'Initial Load');
    retryWithBackoff(() => fetchYumaEndpoint('tv', 1))
      .then((data) => {
        if (!mounted) return;
        setTVShowItems(data.results);
        setTVShowHasMore(data.hasNextPage);
        setTVShowsLoading(false);
        logInfo('✅ V4 TV shows loaded from Yuma', 'Initial Load');
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load TV shows";
        logError(msg, 'Yuma TV Shows', err instanceof Error ? err : undefined);
        setTVShowsLoading(false);
      });

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  // Auto-rotate hero banner through spotlight items
  useEffect(() => {
    if (!heroAnime || spotlightItems.length === 0) return;

    const interval = setInterval(() => {
      setHeroAnime((prev) => {
        const currentIndex = spotlightItems.findIndex(item => item.id === prev?.id);
        const nextIndex = (currentIndex + 1) % spotlightItems.length;
        return spotlightItems[nextIndex];
      });
    }, 5000); // Rotate every 5 seconds

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
      logInfo(`Searching Yuma for: ${query} (v4 hybrid flow)`, 'Search');
      try {
        const results = await retryWithBackoff(() => searchYuma(query.trim()));
        setSearchResults(results);
        logInfo(`✅ V4 Yuma search completed: ${results.length} results`, 'Search');
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Search failed";
        logError(msg, 'Yuma Search', err instanceof Error ? err : undefined);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const loadMoreItems = async (category: 'popular' | 'airing' | 'recentEpisodes' | 'tvShows') => {
    setLoadingMore(category);
    logInfo(`Loading more items for: ${category} (v4 hybrid flow)`, 'Pagination');

    try {
      let nextPage = 1;
      let endpoint = '';
      let setItems;
      let setPage;
      let setHasMore;

      switch (category) {
        case 'popular':
          nextPage = popularPage + 1;
          endpoint = 'top-airing';
          setItems = setPopularItems;
          setPage = setPopularPage;
          setHasMore = setPopularHasMore;
          break;
        case 'airing':
          nextPage = airingPage + 1;
          endpoint = 'recent-episodes';
          setItems = setAiringItems;
          setPage = setAiringPage;
          setHasMore = setAiringHasMore;
          break;
        case 'recentEpisodes':
          nextPage = recentEpisodesPage + 1;
          endpoint = 'recent-episodes';
          setItems = setRecentEpisodeItems;
          setPage = setRecentEpisodesPage;
          setHasMore = setRecentEpisodesHasMore;
          break;
        case 'tvShows':
          nextPage = tvShowPage + 1;
          endpoint = 'tv';
          setItems = setTVShowItems;
          setPage = setTVShowPage;
          setHasMore = setTVShowHasMore;
          break;
      }

      const data = await retryWithBackoff(() => fetchYumaEndpoint(endpoint, nextPage));

      setItems((prev: AnimeItem[]) => [...prev, ...data.results]);
      setPage(nextPage);
      setHasMore(data.hasNextPage);
      logInfo(`✅ V4 Loaded ${data.results.length} more items for ${category} from Yuma`, 'Pagination');
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load more items";
      logError(msg, `Yuma Pagination - ${category}`, err instanceof Error ? err : undefined);
    } finally {
      setLoadingMore(null);
    }
  };

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
    }
  };
}