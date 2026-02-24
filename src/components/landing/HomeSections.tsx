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
            <div key={idx} className={`flex-none ${theme === "nothing" ? "w-[110px] md:w-[140px]" : "w-[95px] md:w-[120px]"} space-y-2`}>
              <Skeleton className={`w-full ${theme === "nothing" ? "aspect-[3/4] bg-[var(--nothing-elevated)] rounded-[28px]" : "aspect-[2/3] bg-white/10 rounded-[4px]"}`} />
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

  if (theme === "nothing") {
    return (
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left Column - Main Content */}
        <div className="flex-1 min-w-0">
          {/* Continue Watching */}
          {isAuthenticated && continueWatchingItems.length > 0 && (
            <ContentRail
              title="Continue Watching"
              items={continueWatchingItems}
              onItemClick={onOpenAnime}
              isFocused={focusedRailIndex === 0}
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
              isFocused={focusedRailIndex === 1}
              focusedItemIndex={focusedItemIndex}
              isNavigatingRails={isNavigatingRails}
            />
          )}

          {/* Recent Episodes */}
          {recentEpisodesLoading ? (
            <div className="bg-[#151821] rounded-[24px] p-5 mb-6">
              <h2 className="text-lg md:text-xl font-bold text-[var(--nothing-fg)] tracking-wide uppercase mb-4 px-2">Recent Episodes</h2>
              <LoadingSkeleton />
            </div>
          ) : recentEpisodeItems.length > 0 && (
            <ContentRail
              title="Recent Episodes"
              items={recentEpisodeItems}
              onItemClick={onOpenAnime}
              enableInfiniteScroll
              onLoadMore={() => onLoadMore('recentEpisodes')}
              hasMore={hasMore.recentEpisodes}
              isLoadingMore={loadingMore === 'recentEpisodes'}
              isFocused={focusedRailIndex === 4}
              focusedItemIndex={focusedItemIndex}
              isNavigatingRails={isNavigatingRails}
            />
          )}

          {/* New Additions */}
          {newAddedItems.length > 0 && (
            <ContentRail
              title="New Additions"
              items={newAddedItems}
              onItemClick={onOpenAnime}
              isFocused={focusedRailIndex === 7}
              focusedItemIndex={focusedItemIndex}
              isNavigatingRails={isNavigatingRails}
            />
          )}

          {/* Trending Now */}
          {popularLoading ? (
            <div className="bg-[#151821] rounded-[24px] p-5 mb-6">
              <h2 className="text-lg md:text-xl font-bold text-[var(--nothing-fg)] tracking-wide uppercase mb-4 px-2">Trending Now</h2>
              <LoadingSkeleton />
            </div>
          ) : popularItems.length > 0 && (
            <ContentRail
              title="Trending Now"
              items={popularItems}
              onItemClick={onOpenAnime}
              enableInfiniteScroll
              onLoadMore={() => onLoadMore('popular')}
              hasMore={hasMore.popular}
              isLoadingMore={loadingMore === 'popular'}
              isFocused={focusedRailIndex === 2}
              focusedItemIndex={focusedItemIndex}
              isNavigatingRails={isNavigatingRails}
            />
          )}

          {/* Top Airing */}
          {airingLoading ? (
            <div className="bg-[#151821] rounded-[24px] p-5 mb-6">
              <h2 className="text-lg md:text-xl font-bold text-[var(--nothing-fg)] tracking-wide uppercase mb-4 px-2">Top Airing</h2>
              <LoadingSkeleton />
            </div>
          ) : airingItems.length > 0 && (
            <ContentRail
              title="Top Airing"
              items={airingItems}
              onItemClick={onOpenAnime}
              enableInfiniteScroll
              onLoadMore={() => onLoadMore('airing')}
              hasMore={hasMore.airing}
              isLoadingMore={loadingMore === 'airing'}
              isFocused={focusedRailIndex === 3}
              focusedItemIndex={focusedItemIndex}
              isNavigatingRails={isNavigatingRails}
            />
          )}

          {/* TV Series */}
          {tvShowsLoading ? (
            <div className="bg-[#151821] rounded-[24px] p-5 mb-6">
              <h2 className="text-lg md:text-xl font-bold text-[var(--nothing-fg)] tracking-wide uppercase mb-4 px-2">TV Series</h2>
              <LoadingSkeleton />
            </div>
          ) : tvShowItems.length > 0 && (
            <ContentRail
              title="TV Series"
              items={tvShowItems}
              onItemClick={onOpenAnime}
              enableInfiniteScroll
              onLoadMore={() => onLoadMore('tvShows')}
              hasMore={hasMore.tvShows}
              isLoadingMore={loadingMore === 'tvShows'}
              isFocused={focusedRailIndex === 5}
              focusedItemIndex={focusedItemIndex}
              isNavigatingRails={isNavigatingRails}
            />
          )}

          {/* Most Favorite */}
          {mostFavoriteItems.length > 0 && (
            <ContentRail
              title="Most Favorite"
              items={mostFavoriteItems}
              onItemClick={onOpenAnime}
              isFocused={focusedRailIndex === 6}
              focusedItemIndex={focusedItemIndex}
              isNavigatingRails={isNavigatingRails}
            />
          )}

          {/* Latest Completed */}
          {latestCompletedItems.length > 0 && (
            <ContentRail
              title="Latest Completed"
              items={latestCompletedItems}
              onItemClick={onOpenAnime}
              isFocused={focusedRailIndex === 8}
              focusedItemIndex={focusedItemIndex}
              isNavigatingRails={isNavigatingRails}
            />
          )}

          {/* Top Upcoming */}
          {topUpcomingItems.length > 0 && (
            <ContentRail
              title="Top Upcoming"
              items={topUpcomingItems}
              onItemClick={onOpenAnime}
              isFocused={focusedRailIndex === 9}
              focusedItemIndex={focusedItemIndex}
              isNavigatingRails={isNavigatingRails}
            />
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="w-full xl:w-[320px] shrink-0 space-y-6">
          {/* Top Ten Today */}
          {topTenItems.length > 0 && (
            <div className="bg-[#151821] rounded-[24px] p-6">
              <h2 className="text-lg font-bold text-[var(--nothing-fg)] tracking-wide uppercase mb-6">Top 10 Today</h2>
              <div className="space-y-5">
                {topTenItems.slice(0, 10).map((item, idx) => (
                  <div key={item.id ?? idx} className="flex items-center gap-4 cursor-pointer group" onClick={() => onOpenAnime(item)}>
                    <span className={`text-2xl font-bold w-6 text-center ${idx < 3 ? "text-[var(--nothing-accent)]" : "text-[var(--nothing-gray-4)] group-hover:text-[var(--nothing-accent)]"} transition-colors`}>
                      {idx + 1}
                    </span>
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-[#1a1f2e]">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No Img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-[var(--nothing-fg)] truncate group-hover:text-[var(--nothing-accent)] transition-colors uppercase tracking-wide">
                        {item.title}
                      </h3>
                      <div className="flex gap-2 text-[10px] font-bold text-[var(--nothing-gray-4)] mt-1 uppercase">
                        {item.language?.sub && <span>SUB {item.language.sub}</span>}
                        {item.language?.sub && item.language?.dub && <span className="text-[var(--nothing-gray-5)]">•</span>}
                        {item.language?.dub && <span>DUB {item.language.dub}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Genres Strip */}
          {genres.length > 0 && (
            <div className="bg-[#151821] rounded-[24px] p-6">
              <h2 className="text-lg font-bold text-[var(--nothing-fg)] tracking-wide uppercase mb-4">Genres</h2>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold cursor-default select-none transition-colors bg-[var(--nothing-elevated)] text-[var(--nothing-gray-4)] border border-[var(--nothing-border)] hover:text-[var(--nothing-fg)] hover:border-[var(--nothing-gray-3)]"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Continue Watching */}
      {isAuthenticated && continueWatchingItems.length > 0 && (
        <ContentRail
          title="Continue Watching"
          items={continueWatchingItems}
          onItemClick={onOpenAnime}
          isFocused={focusedRailIndex === 0}
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
          isFocused={focusedRailIndex === 1}
          focusedItemIndex={focusedItemIndex}
          isNavigatingRails={isNavigatingRails}
        />
      )}

      {/* Trending Now */}
      {popularLoading ? (
        <div>
          <h2 className={`text-2xl font-bold mb-4 text-white`}>Trending Now</h2>
          <LoadingSkeleton />
        </div>
      ) : popularItems.length > 0 && (
        <ContentRail
          title="Trending Now"
          items={popularItems}
          onItemClick={onOpenAnime}
          enableInfiniteScroll
          onLoadMore={() => onLoadMore('popular')}
          hasMore={hasMore.popular}
          isLoadingMore={loadingMore === 'popular'}
          isFocused={focusedRailIndex === 2}
          focusedItemIndex={focusedItemIndex}
          isNavigatingRails={isNavigatingRails}
        />
      )}

      {/* Top Airing */}
      {airingLoading ? (
        <div>
          <h2 className={`text-2xl font-bold mb-4 text-white`}>Top Airing</h2>
          <LoadingSkeleton />
        </div>
      ) : airingItems.length > 0 && (
        <ContentRail
          title="Top Airing"
          items={airingItems}
          onItemClick={onOpenAnime}
          enableInfiniteScroll
          onLoadMore={() => onLoadMore('airing')}
          hasMore={hasMore.airing}
          isLoadingMore={loadingMore === 'airing'}
          isFocused={focusedRailIndex === 3}
          focusedItemIndex={focusedItemIndex}
          isNavigatingRails={isNavigatingRails}
        />
      )}

      {/* Recent Episodes */}
      {recentEpisodesLoading ? (
        <div>
          <h2 className={`text-2xl font-bold mb-4 text-white`}>Recent Episodes</h2>
          <LoadingSkeleton />
        </div>
      ) : recentEpisodeItems.length > 0 && (
        <ContentRail
          title="Recent Episodes"
          items={recentEpisodeItems}
          onItemClick={onOpenAnime}
          enableInfiniteScroll
          onLoadMore={() => onLoadMore('recentEpisodes')}
          hasMore={hasMore.recentEpisodes}
          isLoadingMore={loadingMore === 'recentEpisodes'}
          isFocused={focusedRailIndex === 4}
          focusedItemIndex={focusedItemIndex}
          isNavigatingRails={isNavigatingRails}
        />
      )}

      {/* TV Series */}
      {tvShowsLoading ? (
        <div>
          <h2 className={`text-2xl font-bold mb-4 text-white`}>TV Series</h2>
          <LoadingSkeleton />
        </div>
      ) : tvShowItems.length > 0 && (
        <ContentRail
          title="TV Series"
          items={tvShowItems}
          onItemClick={onOpenAnime}
          enableInfiniteScroll
          onLoadMore={() => onLoadMore('tvShows')}
          hasMore={hasMore.tvShows}
          isLoadingMore={loadingMore === 'tvShows'}
          isFocused={focusedRailIndex === 5}
          focusedItemIndex={focusedItemIndex}
          isNavigatingRails={isNavigatingRails}
        />
      )}

      {/* Most Favorite */}
      {mostFavoriteItems.length > 0 && (
        <ContentRail
          title="Most Favorite"
          items={mostFavoriteItems}
          onItemClick={onOpenAnime}
          isFocused={focusedRailIndex === 6}
          focusedItemIndex={focusedItemIndex}
          isNavigatingRails={isNavigatingRails}
        />
      )}

      {/* New Additions */}
      {newAddedItems.length > 0 && (
        <ContentRail
          title="New Additions"
          items={newAddedItems}
          onItemClick={onOpenAnime}
          isFocused={focusedRailIndex === 7}
          focusedItemIndex={focusedItemIndex}
          isNavigatingRails={isNavigatingRails}
        />
      )}

      {/* Latest Completed */}
      {latestCompletedItems.length > 0 && (
        <ContentRail
          title="Latest Completed"
          items={latestCompletedItems}
          onItemClick={onOpenAnime}
          isFocused={focusedRailIndex === 8}
          focusedItemIndex={focusedItemIndex}
          isNavigatingRails={isNavigatingRails}
        />
      )}

      {/* Top Upcoming */}
      {topUpcomingItems.length > 0 && (
        <ContentRail
          title="Top Upcoming"
          items={topUpcomingItems}
          onItemClick={onOpenAnime}
          isFocused={focusedRailIndex === 9}
          focusedItemIndex={focusedItemIndex}
          isNavigatingRails={isNavigatingRails}
        />
      )}

      {/* Top Ten Today */}
      {topTenItems.length > 0 && (
        <ContentRail
          title="Top 10 Today"
          items={topTenItems}
          onItemClick={onOpenAnime}
          isFocused={focusedRailIndex === 10}
          focusedItemIndex={focusedItemIndex}
          isNavigatingRails={isNavigatingRails}
        />
      )}

      {/* Genres Strip */}
      {genres.length > 0 && (
        <div>
          <h2 className={`text-2xl font-bold mb-4 text-white`}>Browse by Genre</h2>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <span
                key={genre}
                className={`px-4 py-2 rounded-full text-sm font-semibold cursor-default select-none transition-colors bg-white/10 text-white/80 border border-white/10 hover:bg-white/20`}
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