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

  // Load all content on mount
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([
      fetchMostPopular({ page: 1 }),
      fetchTopAiring({ page: 1 }),
      fetchMovies({ page: 1 }),
      fetchTVShows({ page: 1 }),
    ])
      .then(([popular, airing, movies, tvShows]) => {
        if (!mounted) return;
        
        const popularData = popular as { results: AnimeItem[]; hasNextPage: boolean };
        const airingData = airing as { results: AnimeItem[]; hasNextPage: boolean };
        const moviesData = movies as { results: AnimeItem[]; hasNextPage: boolean };
        const tvShowsData = tvShows as { results: AnimeItem[]; hasNextPage: boolean };

        setPopularItems(popularData.results || []);
        setAiringItems(airingData.results || []);
        setMovieItems(moviesData.results || []);
        setTVShowItems(tvShowsData.results || []);
        
        setPopularHasMore(popularData.hasNextPage || false);
        setAiringHasMore(airingData.hasNextPage || false);
        setMovieHasMore(moviesData.hasNextPage || false);
        setTVShowHasMore(tvShowsData.hasNextPage || false);

        // Combine popular and airing for hero rotation
        const heroPool = [
          ...(popularData.results || []).slice(0, 5),
          ...(airingData.results || []).slice(0, 5),
        ];
        
        if (heroPool.length > 0) {
          const randomIndex = Math.floor(Math.random() * heroPool.length);
          setHeroAnime(heroPool[randomIndex]);
        }
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Failed to load content";
        toast.error(msg);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [fetchMostPopular, fetchTopAiring, fetchMovies, fetchTVShows]);

  // Auto-rotate hero banner
  useEffect(() => {
    if (!heroAnime || popularItems.length === 0 || airingItems.length === 0) return;

    const heroPool = [
      ...popularItems.slice(0, 5),
      ...airingItems.slice(0, 5),
    ];

    if (heroPool.length === 0) return;

    const interval = setInterval(() => {
      setHeroAnime((prev) => {
        const currentIndex = heroPool.findIndex(item => item.id === prev?.id);
        const nextIndex = (currentIndex + 1) % heroPool.length;
        return heroPool[nextIndex];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [heroAnime, popularItems, airingItems]);

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