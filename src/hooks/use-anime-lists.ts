import { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { AnimeItem } from "@/shared/types";

export function useAnimeLists() {
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
  
  // Individual loading states for progressive loading
  const [popularLoading, setPopularLoading] = useState(true);
  const [airingLoading, setAiringLoading] = useState(true);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [tvShowsLoading, setTVShowsLoading] = useState(true);
  
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AnimeItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Pagination state
  const [popularPage, setPopularPage] = useState(1);
  const [airingPage, setAiringPage] = useState(1);
  const [moviePage, setMoviePage] = useState(1);
  const [tvShowPage, setTVShowPage] = useState(1);
  
  const [popularHasMore, setPopularHasMore] = useState(false);
  const [airingHasMore, setAiringHasMore] = useState(false);
  const [movieHasMore, setMovieHasMore] = useState(false);
  const [tvShowHasMore, setTVShowHasMore] = useState(false);
  
  const [loadingMore, setLoadingMore] = useState<string | null>(null);

  // Load content progressively - each section loads independently
  useEffect(() => {
    let mounted = true;

    // Load popular first (for hero banner)
    fetchMostPopular({ page: 1 })
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
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load popular content";
        toast.error(msg);
        setPopularLoading(false);
        setLoading(false);
      });

    // Load airing independently
    fetchTopAiring({ page: 1 })
      .then((airing) => {
        if (!mounted) return;
        const airingData = airing as { results: AnimeItem[]; hasNextPage: boolean };
        setAiringItems(airingData.results || []);
        setAiringHasMore(airingData.hasNextPage || false);
        setAiringLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load airing content";
        toast.error(msg);
        setAiringLoading(false);
      });

    // Load movies independently
    fetchMovies({ page: 1 })
      .then((movies) => {
        if (!mounted) return;
        const moviesData = movies as { results: AnimeItem[]; hasNextPage: boolean };
        setMovieItems(moviesData.results || []);
        setMovieHasMore(moviesData.hasNextPage || false);
        setMoviesLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load movies";
        toast.error(msg);
        setMoviesLoading(false);
      });

    // Load TV shows independently
    fetchTVShows({ page: 1 })
      .then((tvShows) => {
        if (!mounted) return;
        const tvShowsData = tvShows as { results: AnimeItem[]; hasNextPage: boolean };
        setTVShowItems(tvShowsData.results || []);
        setTVShowHasMore(tvShowsData.hasNextPage || false);
        setTVShowsLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load TV shows";
        toast.error(msg);
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
      try {
        const results = await searchAnime({ query: query.trim(), page: 1 });
        const searchData = results as { results: AnimeItem[] };
        setSearchResults(searchData.results || []);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Search failed";
        toast.error(msg);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, searchAnime]);

  const loadMoreItems = async (category: 'popular' | 'airing' | 'movies' | 'tvShows') => {
    setLoadingMore(category);
    
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
        const result = await fetchFunction({ page: nextPage });
        const data = result as { results: AnimeItem[]; hasNextPage: boolean };
        
        setItems((prev: AnimeItem[]) => [...prev, ...(data.results || [])]);
        setPage(nextPage);
        setHasMore(data.hasNextPage || false);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load more items";
      toast.error(msg);
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