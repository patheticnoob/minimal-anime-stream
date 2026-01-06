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
      dataId: item.id,
      title: item.title,
      image: item.image,
      type: item.type,
      language: {
        sub: item.sub ? String(item.sub) : null,
        dub: item.dub ? String(item.dub) : null,
      },
      // V3 specific: Store Yuma metadata
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
      dataId: item.id,
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

export function useAnimeListsV3(isActive: boolean = true) {
  // Add dummy hook calls to match v1's hook structure (to avoid React Hooks Rules violation)
  // V1 has 5 useAction calls, so we add 5 matching useAction calls here (unused but necessary for hook order)
  const _dummyAction1 = useAction(api.hianime.topAiring);
  const _dummyAction2 = useAction(api.hianime.mostPopular);
  const _dummyAction3 = useAction(api.hianime.movies);
  const _dummyAction4 = useAction(api.hianime.tvShows);
  const _dummyAction5 = useAction(api.hianime.search);

  const [loading, setLoading] = useState(!isActive); // Start as not loading if inactive
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

  const [popularPage, setPopularPage] = useState(1);
  const [airingPage, setAiringPage] = useState(1);
  const [moviePage, setMoviePage] = useState(1);
  const [tvShowPage, setTVShowPage] = useState(1);
  
  const [popularHasMore, setPopularHasMore] = useState(false);
  const [airingHasMore, setAiringHasMore] = useState(false);
  const [movieHasMore, setMovieHasMore] = useState(false);
  const [tvShowHasMore, setTVShowHasMore] = useState(false);
  
  const [loadingMore, setLoadingMore] = useState<string | null>(null);

  // Load content progressively from Yuma API
  useEffect(() => {
    if (!isActive) {
      console.log('[V3 Hook] Skipping fetch - hook is inactive');
      return;
    }

    let mounted = true;

    // Load Top Airing (use as "popular" since Yuma has no trending endpoint)
    logInfo('Fetching top airing from Yuma (v3 flow)', 'Initial Load');
    retryWithBackoff(() => fetchYumaEndpoint('top-airing', 1))
      .then((data) => {
        if (!mounted) return;
        setPopularItems(data.results);
        setPopularHasMore(data.hasNextPage);
        
        if (data.results && data.results.length > 0) {
          const randomIndex = Math.floor(Math.random() * Math.min(5, data.results.length));
          setHeroAnime(data.results[randomIndex]);
        }
        
        setPopularLoading(false);
        setLoading(false);
        logInfo('Top airing loaded from Yuma (v3)', 'Initial Load');
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load top airing";
        logError(msg, 'Yuma Top Airing', err instanceof Error ? err : undefined);
        setPopularLoading(false);
        setLoading(false);
      });

    // Load recent episodes (use as "airing")
    logInfo('Fetching recent episodes from Yuma (v3 flow)', 'Initial Load');
    retryWithBackoff(() => fetchYumaEndpoint('recent-episodes', 1))
      .then((data) => {
        if (!mounted) return;
        setAiringItems(data.results);
        setAiringHasMore(data.hasNextPage);
        setAiringLoading(false);
        logInfo('Recent episodes loaded from Yuma (v3)', 'Initial Load');
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load recent episodes";
        logError(msg, 'Yuma Recent Episodes', err instanceof Error ? err : undefined);
        setAiringLoading(false);
      });

    // Load movies
    logInfo('Fetching movies from Yuma (v3 flow)', 'Initial Load');
    retryWithBackoff(() => fetchYumaEndpoint('movies', 1))
      .then((data) => {
        if (!mounted) return;
        setMovieItems(data.results);
        setMovieHasMore(data.hasNextPage);
        setMoviesLoading(false);
        logInfo('Movies loaded from Yuma (v3)', 'Initial Load');
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load movies";
        logError(msg, 'Yuma Movies', err instanceof Error ? err : undefined);
        setMoviesLoading(false);
      });

    // Load TV shows again for the TV section
    logInfo('Fetching TV shows for TV section from Yuma (v3 flow)', 'Initial Load');
    retryWithBackoff(() => fetchYumaEndpoint('tv', 1))
      .then((data) => {
        if (!mounted) return;
        setTVShowItems(data.results);
        setTVShowHasMore(data.hasNextPage);
        setTVShowsLoading(false);
        logInfo('TV shows for TV section loaded from Yuma (v3)', 'Initial Load');
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
      logInfo(`Searching Yuma for: ${query} (v3 flow)`, 'Search');
      try {
        const results = await retryWithBackoff(() => searchYuma(query.trim()));
        setSearchResults(results);
        logInfo(`Yuma search completed: ${results.length} results (v3)`, 'Search');
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

  const loadMoreItems = async (category: 'popular' | 'airing' | 'movies' | 'tvShows') => {
    setLoadingMore(category);
    logInfo(`Loading more items for: ${category} (v3 flow)`, 'Pagination');
    
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
        case 'movies':
          nextPage = moviePage + 1;
          endpoint = 'movies';
          setItems = setMovieItems;
          setPage = setMoviePage;
          setHasMore = setMovieHasMore;
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
      logInfo(`Loaded ${data.results.length} more items for ${category} from Yuma (v3)`, 'Pagination');
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