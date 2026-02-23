import { ContentRail } from "@/components/ContentRail";
import { AnimeItem } from "@/shared/types";
import { useTheme } from "@/hooks/use-theme";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataFlow } from "@/hooks/use-data-flow";

interface HomeSectionsProps {
  isAuthenticated: boolean;
  continueWatchingItems: AnimeItem[];
  watchlistItems: AnimeItem[];
  popularItems: AnimeItem[];
  airingItems: AnimeItem[];
  recentEpisodeItems: AnimeItem[];
  tvShowItems: AnimeItem[];
  popularLoading: boolean;
  airingLoading: boolean;
  recentEpisodesLoading: boolean;
  tvShowsLoading: boolean;
  onOpenAnime: (anime: AnimeItem) => void;
  onLoadMore: (category: 'popular' | 'airing' | 'recentEpisodes' | 'tvShows') => void;
  loadingMore: string | null;
  hasMore: {
    popular: boolean;
    airing: boolean;
    recentEpisodes: boolean;
    tvShows: boolean;
  };
  focusedRailIndex?: number;
  focusedItemIndex?: number;
  isNavigatingRails?: boolean;
  // V5-only extras
  mostFavoriteItems?: AnimeItem[];
  latestCompletedItems?: AnimeItem[];
  newAddedItems?: AnimeItem[];
  topUpcomingItems?: AnimeItem[];
  topTenItems?: AnimeItem[];
  genres?: string[];
}

function LoadingSkeleton() {
  const { theme } = useTheme();
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Skeleton className={`h-8 w-48 ${theme === "nothing" ? "bg-[var(--nothing-elevated)]" : "bg-white/10"}`} />
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
  recentEpisodeItems,
  tvShowItems,
  popularLoading,
  airingLoading,
  recentEpisodesLoading,
  tvShowsLoading,
  onOpenAnime,
  onLoadMore,
  loadingMore,
  hasMore,
  focusedRailIndex = -1,
  focusedItemIndex = 0,
  isNavigatingRails = false,
  mostFavoriteItems = [],
  latestCompletedItems = [],
  newAddedItems = [],
  topUpcomingItems = [],
  topTenItems = [],
  genres = [],
}: HomeSectionsProps) {
  const { theme } = useTheme();
  const { dataFlow } = useDataFlow();
  const isV5 = dataFlow === "v5";
  
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

      {/* Recent Episodes */}
      {recentEpisodesLoading ? (
        <div>
          <h2 className={`text-2xl font-bold mb-4 ${theme === "nothing" ? "text-[var(--nothing-fg)]" : "text-white"}`}>Recent Episodes</h2>
          <LoadingSkeleton />
        </div>
      ) : (
        <ContentRail
          title="Recent Episodes"
          items={recentEpisodeItems}
          onItemClick={onOpenAnime}
          enableInfiniteScroll
          onLoadMore={() => onLoadMore('recentEpisodes')}
          hasMore={hasMore.recentEpisodes}
          isLoadingMore={loadingMore === 'recentEpisodes'}
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

      {/* V5-only: Most Favorite */}
      {isV5 && mostFavoriteItems.length > 0 && (
        <ContentRail
          title="Most Favorite"
          items={mostFavoriteItems}
          onItemClick={onOpenAnime}
          isFocused={focusedRailIndex === getRailIndex() - 1}
          focusedItemIndex={focusedItemIndex}
          isNavigatingRails={isNavigatingRails}
        />
      )}

      {/* V5-only: New Additions */}
      {isV5 && newAddedItems.length > 0 && (
        <ContentRail
          title="New Additions"
          items={newAddedItems}
          onItemClick={onOpenAnime}
          isFocused={focusedRailIndex === getRailIndex() - 1}
          focusedItemIndex={focusedItemIndex}
          isNavigatingRails={isNavigatingRails}
        />
      )}

      {/* V5-only: Latest Completed */}
      {isV5 && latestCompletedItems.length > 0 && (
        <ContentRail
          title="Latest Completed"
          items={latestCompletedItems}
          onItemClick={onOpenAnime}
          isFocused={focusedRailIndex === getRailIndex() - 1}
          focusedItemIndex={focusedItemIndex}
          isNavigatingRails={isNavigatingRails}
        />
      )}

      {/* V5-only: Top Upcoming */}
      {isV5 && topUpcomingItems.length > 0 && (
        <ContentRail
          title="Top Upcoming"
          items={topUpcomingItems}
          onItemClick={onOpenAnime}
          isFocused={focusedRailIndex === getRailIndex() - 1}
          focusedItemIndex={focusedItemIndex}
          isNavigatingRails={isNavigatingRails}
        />
      )}

      {/* V5-only: Top Ten Today */}
      {isV5 && topTenItems.length > 0 && (
        <ContentRail
          title="Top 10 Today"
          items={topTenItems}
          onItemClick={onOpenAnime}
          isFocused={focusedRailIndex === getRailIndex() - 1}
          focusedItemIndex={focusedItemIndex}
          isNavigatingRails={isNavigatingRails}
        />
      )}

      {/* V5-only: Genres Strip */}
      {isV5 && genres.length > 0 && (
        <div>
          <h2 className={`text-2xl font-bold mb-4 ${theme === "nothing" ? "text-[var(--nothing-fg)]" : "text-white"}`}>Browse by Genre</h2>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <span
                key={genre}
                className={`px-4 py-2 rounded-full text-sm font-semibold cursor-default select-none transition-colors ${
                  theme === "nothing"
                    ? "bg-[#ff4d4f]/10 text-[#ff4d4f] border border-[#ff4d4f]/20 hover:bg-[#ff4d4f]/20"
                    : "bg-white/10 text-white/80 border border-white/10 hover:bg-white/20"
                }`}
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}