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
      
      // Don't retry on the last attempt
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        logWarn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`, 'API Retry');
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

export function useAnimeLists(isActive: boolean = true) {
  const fetchTopAiring = useAction(api.hianime.topAiring);
  const fetchMostPopular = useAction(api.hianime.mostPopular);
  const fetchRecentEpisodes = useAction(api.hianime.recentEpisodes);
  const fetchTVShows = useAction(api.hianime.tvShows);
  const searchAnime = useAction(api.hianime.search);

  const [loading, setLoading] = useState(!isActive); // Start as not loading if inactive
  const [popularItems, setPopularItems] = useState<AnimeItem[]>([]);
  const [airingItems, setAiringItems] = useState<AnimeItem[]>([]);
  const [recentEpisodeItems, setRecentEpisodeItems] = useState<AnimeItem[]>([]);
  const [tvShowItems, setTVShowItems] = useState<AnimeItem[]>([]);
  const [heroAnime, setHeroAnime] = useState<AnimeItem | null>(null);

  // Individual loading states for progressive loading
  const [popularLoading, setPopularLoading] = useState(true);
  const [airingLoading, setAiringLoading] = useState(true);
  const [recentEpisodesLoading, setRecentEpisodesLoading] = useState(true);
  const [tvShowsLoading, setTVShowsLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AnimeItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Pagination state
  const [popularPage, setPopularPage] = useState(1);
  const [airingPage, setAiringPage] = useState(1);
  const [recentEpisodesPage, setRecentEpisodesPage] = useState(1);
  const [tvShowPage, setTVShowPage] = useState(1);

  const [popularHasMore, setPopularHasMore] = useState(false);
  const [airingHasMore, setAiringHasMore] = useState(false);
  const [recentEpisodesHasMore, setRecentEpisodesHasMore] = useState(false);
  const [tvShowHasMore, setTVShowHasMore] = useState(false);

  const [loadingMore, setLoadingMore] = useState<string | null>(null);

  // Load content progressively - each section loads independently with retry logic
  useEffect(() => {
    if (!isActive) {
      console.log('[V1 Hook] Skipping fetch - hook is inactive');
      return;
    }

    let mounted = true;

    // Load popular first (for hero banner) with retry
    logInfo('Fetching popular anime', 'Initial Load');
    retryWithBackoff(() => fetchMostPopular({ page: 1 }))
      .then((popular) => {
        if (!mounted) return;
        const popularData = popular as { results: AnimeItem[]; hasNextPage: boolean };
        setPopularItems(popularData.results || []);
        setPopularHasMore(popularData.hasNextPage || false);
        
        // Set hero from popular
        if (popularData.results && popularData.results.length > 0) {
          const randomIndex = Math.floor(Math.random() * Math.min(5, popularData.results.length));
          setHeroAnime(popularData.results[randomIndex]);
        }
        
        setPopularLoading(false);
        setLoading(false); // Allow page to render after popular loads
        logInfo('Popular anime loaded successfully', 'Initial Load');
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load popular content";
        logError(msg, 'Popular Anime', err instanceof Error ? err : undefined);
        setPopularLoading(false);
        setLoading(false);
      });

    // Load airing independently with retry
    logInfo('Fetching airing anime', 'Initial Load');
    retryWithBackoff(() => fetchTopAiring({ page: 1 }))
      .then((airing) => {
        if (!mounted) return;
        const airingData = airing as { results: AnimeItem[]; hasNextPage: boolean };
        setAiringItems(airingData.results || []);
        setAiringHasMore(airingData.hasNextPage || false);
        setAiringLoading(false);
        logInfo('Airing anime loaded successfully', 'Initial Load');
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load airing content";
        logError(msg, 'Airing Anime', err instanceof Error ? err : undefined);
        setAiringLoading(false);
      });

    // Load recent episodes independently with retry
    logInfo('Fetching recent episodes', 'Initial Load');
    retryWithBackoff(() => fetchRecentEpisodes({ page: 1 }))
      .then((recentEps) => {
        if (!mounted) return;
        const recentEpisodesData = recentEps as { results: AnimeItem[]; hasNextPage: boolean };
        setRecentEpisodeItems(recentEpisodesData.results || []);
        setRecentEpisodesHasMore(recentEpisodesData.hasNextPage || false);
        setRecentEpisodesLoading(false);
        logInfo('Recent episodes loaded successfully', 'Initial Load');
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load recent episodes";
        logError(msg, 'Recent Episodes', err instanceof Error ? err : undefined);
        setRecentEpisodesLoading(false);
      });

    // Load TV shows independently with retry
    logInfo('Fetching TV shows', 'Initial Load');
    retryWithBackoff(() => fetchTVShows({ page: 1 }))
      .then((tvShows) => {
        if (!mounted) return;
        const tvShowsData = tvShows as { results: AnimeItem[]; hasNextPage: boolean };
        setTVShowItems(tvShowsData.results || []);
        setTVShowHasMore(tvShowsData.hasNextPage || false);
        setTVShowsLoading(false);
        logInfo('TV shows loaded successfully', 'Initial Load');
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load TV shows";
        logError(msg, 'TV Shows', err instanceof Error ? err : undefined);
        setTVShowsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isActive, fetchMostPopular, fetchTopAiring, fetchRecentEpisodes, fetchTVShows]);

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

  // Search handler with retry
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      logInfo(`Searching for: ${query}`, 'Search');
      try {
        const results = await retryWithBackoff(() => searchAnime({ query: query.trim(), page: 1 }));
        const searchData = results as { results: AnimeItem[] };
        setSearchResults(searchData.results || []);
        logInfo(`Search completed: ${searchData.results?.length || 0} results`, 'Search');
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Search failed";
        logError(msg, 'Search', err instanceof Error ? err : undefined);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, searchAnime]);

  const loadMoreItems = async (category: 'popular' | 'airing' | 'recentEpisodes' | 'tvShows') => {
    setLoadingMore(category);
    logInfo(`Loading more items for: ${category}`, 'Pagination');
    
    try {
      let nextPage = 1;
      let fetchFunction;
      let setItems;
      let setPage;
      let setHasMore;
      
      switch (category) {
        case 'popular':
          nextPage = popularPage + 1;
          fetchFunction = fetchMostPopular;
          setItems = setPopularItems;
          setPage = setPopularPage;
          setHasMore = setPopularHasMore;
          break;
        case 'airing':
          nextPage = airingPage + 1;
          fetchFunction = fetchTopAiring;
          setItems = setAiringItems;
          setPage = setAiringPage;
          setHasMore = setAiringHasMore;
          break;
        case 'recentEpisodes':
          nextPage = recentEpisodesPage + 1;
          fetchFunction = fetchRecentEpisodes;
          setItems = setRecentEpisodeItems;
          setPage = setRecentEpisodesPage;
          setHasMore = setRecentEpisodesHasMore;
          break;
        case 'tvShows':
          nextPage = tvShowPage + 1;
          fetchFunction = fetchTVShows;
          setItems = setTVShowItems;
          setPage = setTVShowPage;
          setHasMore = setTVShowHasMore;
          break;
      }
      
      if (fetchFunction) {
        const result = await retryWithBackoff(() => fetchFunction({ page: nextPage }));
        const data = result as { results: AnimeItem[]; hasNextPage: boolean };
        
        setItems((prev: AnimeItem[]) => [...prev, ...(data.results || [])]);
        setPage(nextPage);
        setHasMore(data.hasNextPage || false);
        logInfo(`Loaded ${data.results?.length || 0} more items for ${category}`, 'Pagination');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load more items";
      logError(msg, `Pagination - ${category}`, err instanceof Error ? err : undefined);
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