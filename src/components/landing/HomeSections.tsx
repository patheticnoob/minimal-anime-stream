import { ContentRail } from "@/components/ContentRail";
import { AnimeItem } from "@/shared/types";
import { useTheme } from "@/hooks/use-theme";
import { Skeleton } from "@/components/ui/skeleton";

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
  focusedRailIndex?: number;
  focusedItemIndex?: number;
  isNavigatingRails?: boolean;
}

function LoadingSkeleton() {
  const { theme } = useTheme();
  return (
    <div className="space-y-8">
      {/* Section Title Skeleton */}
      <div className="space-y-4">
        <Skeleton className={`h-8 w-48 ${theme === "nothing" ? "bg-[var(--nothing-elevated)]" : "bg-white/10"}`} />
        
        {/* Rail Skeleton */}
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="flex-none w-[95px] md:w-[120px] space-y-2">
              <Skeleton className={`w-full aspect-[2/3] ${theme === "nothing" ? "bg-[var(--nothing-elevated)] rounded-[28px]" : "bg-white/10 rounded-[4px]"}`} />
              <Skeleton className={`h-4 w-full ${theme === "nothing" ? "bg-[var(--nothing-elevated)]" : "bg-white/10"}`} />
              <Skeleton className={`h-3 w-3/4 ${theme === "nothing" ? "bg-[var(--nothing-elevated)]" : "bg-white/10"}`} />
            </div>
          ))}
        </div>
      </div>
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
  focusedRailIndex = -1,
  focusedItemIndex = 0,
  isNavigatingRails = false,
}: HomeSectionsProps) {
  const { theme } = useTheme();
  
  // Calculate rail indices accounting for hero banner (index 0)
  let currentRailIndex = 1;
  const getRailIndex = () => currentRailIndex++;
  
  return (
    <div className="space-y-8">
      {/* Continue Watching */}
      {isAuthenticated && continueWatchingItems.length > 0 && (
        <ContentRail
          title="Continue Watching"
          items={continueWatchingItems}
          onItemClick={onOpenAnime}
          isFocused={focusedRailIndex === getRailIndex() - 1}
          focusedItemIndex={focusedItemIndex}
          isNavigatingRails={isNavigatingRails}
        />
      )}

      {/* My Watchlist */}
      {isAuthenticated && watchlistItems.length > 0 && (
        <ContentRail
          title="My Watchlist"
          items={watchlistItems}
          onItemClick={onOpenAnime}
          isFocused={focusedRailIndex === getRailIndex() - 1}
          focusedItemIndex={focusedItemIndex}
          isNavigatingRails={isNavigatingRails}
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
          isFocused={focusedRailIndex === getRailIndex() - 1}
          focusedItemIndex={focusedItemIndex}
          isNavigatingRails={isNavigatingRails}
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
          isFocused={focusedRailIndex === getRailIndex() - 1}
          focusedItemIndex={focusedItemIndex}
          isNavigatingRails={isNavigatingRails}
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
          isFocused={focusedRailIndex === getRailIndex() - 1}
          focusedItemIndex={focusedItemIndex}
          isNavigatingRails={isNavigatingRails}
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
          isFocused={focusedRailIndex === getRailIndex() - 1}
          focusedItemIndex={focusedItemIndex}
          isNavigatingRails={isNavigatingRails}
        />
      )}
    </div>
  );
}