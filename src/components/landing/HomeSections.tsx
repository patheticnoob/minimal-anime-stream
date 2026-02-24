import { ContentRail } from "@/components/ContentRail";
import { AnimeItem } from "@/shared/types";
import { useTheme } from "@/hooks/use-theme";
import { Skeleton } from "@/components/ui/skeleton";
import { CompactListSection, CompactSkeleton } from "./CompactListSection";

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
  spotlightItems?: AnimeItem[];
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
  spotlightItems = [],
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

          {/* Spotlight Collage */}
          {spotlightItems.length >= 4 && (
            <div className="mb-6">
              <h2 className="text-lg md:text-xl font-bold text-[var(--nothing-fg)] tracking-wide uppercase mb-4 px-2">Featured Spotlight</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {spotlightItems.slice(-4).map((item, idx) => (
                  <div 
                    key={item.id ?? idx} 
                    className="relative aspect-[16/10] rounded-[24px] overflow-hidden cursor-pointer group bg-[#151821] hover:shadow-[0_0_20px_rgba(229,9,20,0.2)] transition-all duration-300"
                    onClick={() => onOpenAnime(item)}
                  >
                    <div className="absolute inset-0 rounded-[24px] border border-[var(--nothing-border)] group-hover:border-2 group-hover:border-[var(--nothing-accent)] pointer-events-none transition-all duration-300 z-20" />
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--nothing-gray-4)]">No Image</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/60 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="text-xl md:text-2xl font-bold text-[var(--nothing-fg)] mb-2 line-clamp-1 tracking-wide">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-[var(--nothing-gray-4)] line-clamp-2 mb-4 max-w-[90%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-150">
                        <button 
                          className="px-6 py-2 bg-[var(--nothing-accent)] text-white rounded-full text-sm font-bold hover:bg-red-700 transition-colors flex items-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenAnime(item);
                          }}
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                          Play Now
                        </button>
                        <button 
                          className="px-6 py-2 bg-[var(--nothing-elevated)] text-[var(--nothing-fg)] rounded-full text-sm font-bold hover:bg-[var(--nothing-gray-5)] transition-colors border border-[var(--nothing-border)] hover:border-[var(--nothing-accent)] hover:text-[var(--nothing-accent)]"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenAnime(item);
                          }}
                        >
                          Details
                        </button>
                      </div>
                    </div>

                    {/* Top right bookmark icon */}
                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--nothing-elevated)]/80 backdrop-blur-md flex items-center justify-center text-[var(--nothing-gray-4)] hover:text-[var(--nothing-accent)] hover:bg-[var(--nothing-gray-5)] transition-colors border border-[var(--nothing-border)] hover:border-[var(--nothing-accent)]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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

          {/* Compact Sections (Moved to Sidebar) */}
          {popularLoading ? (
            <CompactSkeleton title="Trending Now" theme={theme} />
          ) : (
            <CompactListSection title="Trending Now" items={popularItems} onOpenAnime={onOpenAnime} theme={theme} />
          )}

          {airingLoading ? (
            <CompactSkeleton title="Top Airing" theme={theme} />
          ) : (
            <CompactListSection title="Top Airing" items={airingItems} onOpenAnime={onOpenAnime} theme={theme} />
          )}

          <CompactListSection title="Most Favorite" items={mostFavoriteItems} onOpenAnime={onOpenAnime} theme={theme} />
          <CompactListSection title="Latest Completed" items={latestCompletedItems} onOpenAnime={onOpenAnime} theme={theme} />
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

      {/* Compact Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {popularLoading ? (
          <CompactSkeleton title="Trending Now" theme={theme} />
        ) : (
          <CompactListSection title="Trending Now" items={popularItems} onOpenAnime={onOpenAnime} theme={theme} />
        )}

        {airingLoading ? (
          <CompactSkeleton title="Top Airing" theme={theme} />
        ) : (
          <CompactListSection title="Top Airing" items={airingItems} onOpenAnime={onOpenAnime} theme={theme} />
        )}

        <CompactListSection title="Most Favorite" items={mostFavoriteItems} onOpenAnime={onOpenAnime} theme={theme} />
        <CompactListSection title="Latest Completed" items={latestCompletedItems} onOpenAnime={onOpenAnime} theme={theme} />
      </div>

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
    </div>
  );
}