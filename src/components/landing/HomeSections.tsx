import { ContentRail } from "@/components/ContentRail";
import { AnimeItem } from "@/shared/types";
import { Loader2 } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

interface HomeSectionsProps {
  isAuthenticated: boolean;
  continueWatchingItems: AnimeItem[];
  watchlistItems: AnimeItem[];
  popularItems: AnimeItem[];
  airingItems: AnimeItem[];
  movieItems: AnimeItem[];
  tvShowItems: AnimeItem[];
  popularLoading: boolean;
  airingLoading: boolean;
  moviesLoading: boolean;
  tvShowsLoading: boolean;
  onOpenAnime: (anime: AnimeItem) => void;
  onLoadMore: (category: 'popular' | 'airing' | 'movies' | 'tvShows') => void;
  loadingMore: string | null;
  hasMore: {
    popular: boolean;
    airing: boolean;
    movies: boolean;
    tvShows: boolean;
  };
}

function LoadingSkeleton() {
  const { theme } = useTheme();
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className={`h-8 w-8 animate-spin ${theme === "nothing" ? "text-[var(--nothing-accent)]" : "text-blue-500"}`} />
    </div>
  );
}

export function HomeSections({
  isAuthenticated,
  continueWatchingItems,
  watchlistItems,
  popularItems,
  airingItems,
  movieItems,
  tvShowItems,
  popularLoading,
  airingLoading,
  moviesLoading,
  tvShowsLoading,
  onOpenAnime,
  onLoadMore,
  loadingMore,
  hasMore,
}: HomeSectionsProps) {
  const { theme } = useTheme();
  
  return (
    <div className="space-y-8">
      {/* Continue Watching */}
      {isAuthenticated && continueWatchingItems.length > 0 && (
        <ContentRail
          title="Continue Watching"
          items={continueWatchingItems}
          onItemClick={onOpenAnime}
        />
      )}

      {/* My Watchlist */}
      {isAuthenticated && watchlistItems.length > 0 && (
        <ContentRail
          title="My Watchlist"
          items={watchlistItems}
          onItemClick={onOpenAnime}
        />
      )}

      {/* Trending Now */}
      {popularLoading ? (
        <div>
          <h2 className={`text-2xl font-bold mb-4 ${theme === "nothing" ? "text-[var(--nothing-fg)]" : "text-white"}`}>Trending Now</h2>
          <LoadingSkeleton />
        </div>
      ) : (
        <ContentRail
          title="Trending Now"
          items={popularItems}
          onItemClick={onOpenAnime}
          enableInfiniteScroll
          onLoadMore={() => onLoadMore('popular')}
          hasMore={hasMore.popular}
          isLoadingMore={loadingMore === 'popular'}
        />
      )}

      {/* Top Airing */}
      {airingLoading ? (
        <div>
          <h2 className={`text-2xl font-bold mb-4 ${theme === "nothing" ? "text-[var(--nothing-fg)]" : "text-white"}`}>Top Airing</h2>
          <LoadingSkeleton />
        </div>
      ) : (
        <ContentRail
          title="Top Airing"
          items={airingItems}
          onItemClick={onOpenAnime}
          enableInfiniteScroll
          onLoadMore={() => onLoadMore('airing')}
          hasMore={hasMore.airing}
          isLoadingMore={loadingMore === 'airing'}
        />
      )}

      {/* Popular Movies */}
      {moviesLoading ? (
        <div>
          <h2 className={`text-2xl font-bold mb-4 ${theme === "nothing" ? "text-[var(--nothing-fg)]" : "text-white"}`}>Popular Movies</h2>
          <LoadingSkeleton />
        </div>
      ) : (
        <ContentRail
          title="Popular Movies"
          items={movieItems}
          onItemClick={onOpenAnime}
          enableInfiniteScroll
          onLoadMore={() => onLoadMore('movies')}
          hasMore={hasMore.movies}
          isLoadingMore={loadingMore === 'movies'}
        />
      )}

      {/* TV Series */}
      {tvShowsLoading ? (
        <div>
          <h2 className={`text-2xl font-bold mb-4 ${theme === "nothing" ? "text-[var(--nothing-fg)]" : "text-white"}`}>TV Series</h2>
          <LoadingSkeleton />
        </div>
      ) : (
        <ContentRail
          title="TV Series"
          items={tvShowItems}
          onItemClick={onOpenAnime}
          enableInfiniteScroll
          onLoadMore={() => onLoadMore('tvShows')}
          hasMore={hasMore.tvShows}
          isLoadingMore={loadingMore === 'tvShows'}
        />
      )}
    </div>
  );
}