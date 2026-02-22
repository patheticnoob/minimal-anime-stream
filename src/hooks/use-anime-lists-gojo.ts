import { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AnimeItem } from "@/shared/types";
import { logError, logInfo } from "@/lib/error-logger";
import {
  fetchGojoSpotlight,
  fetchGojoCategory,
  searchGojo,
} from "@/lib/gojo-api";

/**
 * Gojo API Hook - Home page data from gojoback.zeabur.app
 *
 * Uses the Gojo API for home page data (spotlight, trending, topAiring, etc.)
 * Episodes and streaming still use the hianime package via convex actions.
 *
 * Key differences from v4 (Yuma):
 * - Richer spotlight data (synopsis, quality, rank, aired)
 * - Top Ten endpoint (today/week/month)
 * - Genres list
 * - MAL score, studios, producers in anime details
 * - Episode IDs use format: {animeId}::ep={episodeNumber}
 */
export function useAnimeListsGojo(isActive: boolean = true) {
  // Maintain same hook call order as v4 to avoid React Hooks Rules violations
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

  // Load content from Gojo API
  useEffect(() => {
    if (!isActive) return;

    let mounted = true;

    // Load Spotlight
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

    // Load Most Popular
    fetchGojoCategory("mostPopular")
      .then(({ results }) => {
        if (!mounted) return;
        setPopularItems(results);
        setPopularLoading(false);
        logInfo("✅ Gojo Most Popular loaded", "Gojo Initial Load");
      })
      .catch((err) => {
        if (!mounted) return;
        logError("Gojo mostPopular failed", "Gojo API", err instanceof Error ? err : undefined);
        setPopularLoading(false);
      });

    // Load Top Airing as "airing"
    fetchGojoCategory("topAiring")
      .then(({ results }) => {
        if (!mounted) return;
        setAiringItems(results);
        setAiringLoading(false);
        logInfo("✅ Gojo Top Airing loaded", "Gojo Initial Load");
      })
      .catch((err) => {
        if (!mounted) return;
        logError("Gojo topAiring failed", "Gojo API", err instanceof Error ? err : undefined);
        setAiringLoading(false);
      });

    // Load Latest Episodes as "recentEpisodes"
    fetchGojoCategory("latestEpisode")
      .then(({ results }) => {
        if (!mounted) return;
        setRecentEpisodeItems(results);
        setRecentEpisodesLoading(false);
        logInfo("✅ Gojo Latest Episodes loaded", "Gojo Initial Load");
      })
      .catch((err) => {
        if (!mounted) return;
        logError("Gojo latestEpisode failed", "Gojo API", err instanceof Error ? err : undefined);
        setRecentEpisodesLoading(false);
      });

    // Load Trending as "tvShows"
    fetchGojoCategory("trending")
      .then(({ results }) => {
        if (!mounted) return;
        setTVShowItems(results);
        setTVShowsLoading(false);
        logInfo("✅ Gojo Trending loaded", "Gojo Initial Load");
      })
      .catch((err) => {
        if (!mounted) return;
        logError("Gojo trending failed", "Gojo API", err instanceof Error ? err : undefined);
        setTVShowsLoading(false);
      });

    return () => {
      mounted = false;
    };
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
      logInfo(`Searching Gojo for: ${query}`, "Gojo Search");
      try {
        const { results } = await searchGojo(query.trim());
        setSearchResults(results);
        logInfo(`✅ Gojo search completed: ${results.length} results`, "Gojo Search");
      } catch (err) {
        logError("Gojo search failed", "Gojo API", err instanceof Error ? err : undefined);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // loadMoreItems is a no-op for now (Gojo home endpoint doesn't paginate categories)
  const loadMoreItems = async (_category: 'popular' | 'airing' | 'recentEpisodes' | 'tvShows') => {
    // Gojo home categories don't support pagination
    logInfo("Gojo API: loadMore not supported for home categories", "Gojo Pagination");
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
    },
  };
}
