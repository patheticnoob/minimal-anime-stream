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

// Fetch Jikan metadata by title
async function fetchJikanMetadata(title: string): Promise<any> {
  try {
    const url = new URL("https://api.jikan.moe/v4/anime");
    url.searchParams.set("q", title);
    url.searchParams.set("limit", "1");
    url.searchParams.set("sfw", "true");

    const response = await fetch(url.toString());
    if (!response.ok) return null;

    const payload = await response.json();
    const anime = payload?.data?.[0];
    
    if (!anime) return null;

    return {
      malId: anime.mal_id,
      synopsis: anime.synopsis,
      genres: anime.genres?.map((g: any) => g.name) || [],
      score: anime.score,
      episodes: anime.episodes,
      status: anime.status,
      aired: anime.aired?.string,
      studios: anime.studios?.map((s: any) => s.name) || [],
    };
  } catch (error) {
    logWarn(`Failed to fetch Jikan metadata for: ${title}`, 'Jikan API');
    return null;
  }
}

// Enrich HiAnime items with Jikan metadata
async function enrichWithJikan(items: AnimeItem[], limit: number = 5): Promise<AnimeItem[]> {
  const enrichedItems = [...items];
  
  // Only enrich the first few items to avoid rate limiting
  for (let i = 0; i < Math.min(limit, items.length); i++) {
    const item = items[i];
    if (!item.title) continue;

    const metadata = await fetchJikanMetadata(item.title);
    if (metadata) {
      enrichedItems[i] = {
        ...item,
        malId: metadata.malId,
        synopsis: metadata.synopsis,
        genres: metadata.genres,
        score: metadata.score,
        totalEpisodes: metadata.episodes,
        status: metadata.status,
        aired: metadata.aired,
        studios: metadata.studios,
      };
    }

    // Rate limiting: wait 1 second between requests
    if (i < Math.min(limit, items.length) - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return enrichedItems;
}

export function useAnimeListsV2() {
  const fetchTopAiring = useAction(api.hianime.topAiring);
  const fetchMostPopular = useAction(api.hianime.mostPopular);
  const fetchMovies = useAction(api.hianime.movies);
  const fetchTVShows = useAction(api.hianime.tvShows);
  const searchAnime = useAction(api.hianime.search);

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

  const [popularPage, setPopularPage] = useState(1);
  const [airingPage, setAiringPage] = useState(1);
  const [moviePage, setMoviePage] = useState(1);
  const [tvShowPage, setTVShowPage] = useState(1);
  
  const [popularHasMore, setPopularHasMore] = useState(false);
  const [airingHasMore, setAiringHasMore] = useState(false);
  const [movieHasMore, setMovieHasMore] = useState(false);
  const [tvShowHasMore, setTVShowHasMore] = useState(false);
  
  const [loadingMore, setLoadingMore] = useState<string | null>(null);

  // Load content progressively with Jikan enrichment
  useEffect(() => {
    let mounted = true;

    // Load popular first and enrich with Jikan
    logInfo('Fetching popular anime (v2 flow)', 'Initial Load');
    retryWithBackoff(() => fetchMostPopular({ page: 1 }))
      .then(async (popular) => {
        if (!mounted) return;
        const popularData = popular as { results: AnimeItem[]; hasNextPage: boolean };
        
        // Enrich first 5 items with Jikan metadata
        const enrichedResults = await enrichWithJikan(popularData.results || [], 5);
        
        setPopularItems(enrichedResults);
        setPopularHasMore(popularData.hasNextPage || false);
        
        if (enrichedResults && enrichedResults.length > 0) {
          const randomIndex = Math.floor(Math.random() * Math.min(5, enrichedResults.length));
          setHeroAnime(enrichedResults[randomIndex]);
        }
        
        setPopularLoading(false);
        setLoading(false);
        logInfo('Popular anime loaded and enriched (v2)', 'Initial Load');
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load popular content";
        logError(msg, 'Popular Anime', err instanceof Error ? err : undefined);
        setPopularLoading(false);
        setLoading(false);
      });

    // Load airing independently
    logInfo('Fetching airing anime (v2 flow)', 'Initial Load');
    retryWithBackoff(() => fetchTopAiring({ page: 1 }))
      .then((airing) => {
        if (!mounted) return;
        const airingData = airing as { results: AnimeItem[]; hasNextPage: boolean };
        setAiringItems(airingData.results || []);
        setAiringHasMore(airingData.hasNextPage || false);
        setAiringLoading(false);
        logInfo('Airing anime loaded (v2)', 'Initial Load');
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load airing content";
        logError(msg, 'Airing Anime', err instanceof Error ? err : undefined);
        setAiringLoading(false);
      });

    // Load movies independently
    logInfo('Fetching movies (v2 flow)', 'Initial Load');
    retryWithBackoff(() => fetchMovies({ page: 1 }))
      .then((movies) => {
        if (!mounted) return;
        const moviesData = movies as { results: AnimeItem[]; hasNextPage: boolean };
        setMovieItems(moviesData.results || []);
        setMovieHasMore(moviesData.hasNextPage || false);
        setMoviesLoading(false);
        logInfo('Movies loaded (v2)', 'Initial Load');
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load movies";
        logError(msg, 'Movies', err instanceof Error ? err : undefined);
        setMoviesLoading(false);
      });

    // Load TV shows independently
    logInfo('Fetching TV shows (v2 flow)', 'Initial Load');
    retryWithBackoff(() => fetchTVShows({ page: 1 }))
      .then((tvShows) => {
        if (!mounted) return;
        const tvShowsData = tvShows as { results: AnimeItem[]; hasNextPage: boolean };
        setTVShowItems(tvShowsData.results || []);
        setTVShowHasMore(tvShowsData.hasNextPage || false);
        setTVShowsLoading(false);
        logInfo('TV shows loaded (v2)', 'Initial Load');
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
  }, [fetchMostPopular, fetchTopAiring, fetchMovies, fetchTVShows]);

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
      logInfo(`Searching for: ${query} (v2 flow)`, 'Search');
      try {
        const results = await retryWithBackoff(() => searchAnime({ query: query.trim(), page: 1 }));
        const searchData = results as { results: AnimeItem[] };
        setSearchResults(searchData.results || []);
        logInfo(`Search completed: ${searchData.results?.length || 0} results (v2)`, 'Search');
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

  const loadMoreItems = async (category: 'popular' | 'airing' | 'movies' | 'tvShows') => {
    setLoadingMore(category);
    logInfo(`Loading more items for: ${category} (v2 flow)`, 'Pagination');
    
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
        case 'movies':
          nextPage = moviePage + 1;
          fetchFunction = fetchMovies;
          setItems = setMovieItems;
          setPage = setMoviePage;
          setHasMore = setMovieHasMore;
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
        logInfo(`Loaded ${data.results?.length || 0} more items for ${category} (v2)`, 'Pagination');
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
