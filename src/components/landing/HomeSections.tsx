import { ContentRail } from "@/components/ContentRail";
import { AnimeItem } from "@/shared/types";

interface HomeSectionsProps {
  isAuthenticated: boolean;
  continueWatchingItems: AnimeItem[];
  watchlistItems: AnimeItem[];
  recentEpisodesItems: AnimeItem[];
  popularItems: AnimeItem[];
  airingItems: AnimeItem[];
  movieItems: AnimeItem[];
  tvShowItems: AnimeItem[];
  onOpenAnime: (anime: AnimeItem) => void;
  onLoadMore: (category: 'popular' | 'airing' | 'movies' | 'tvShows' | 'recentEpisodes') => void;
  loadingMore: string | null;
  hasMore: {
    popular: boolean;
    airing: boolean;
    movies: boolean;
    tvShows: boolean;
    recentEpisodes: boolean;
  };
}

export function HomeSections({
  isAuthenticated,
  continueWatchingItems,
  watchlistItems,
  recentEpisodesItems,
  popularItems,
  airingItems,
  movieItems,
  tvShowItems,
  onOpenAnime,
  onLoadMore,
  loadingMore,
  hasMore,
}: HomeSectionsProps) {
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

      {/* Recent Episodes */}
      {recentEpisodesItems.length > 0 && (
        <ContentRail
          title="Recent Episodes"
          items={recentEpisodesItems}
          onItemClick={onOpenAnime}
          enableInfiniteScroll
          onLoadMore={() => onLoadMore('recentEpisodes')}
          hasMore={hasMore.recentEpisodes}
          isLoadingMore={loadingMore === 'recentEpisodes'}
        />
      )}

      <ContentRail
        title="Trending Now"
        items={popularItems}
        onItemClick={onOpenAnime}
        enableInfiniteScroll
        onLoadMore={() => onLoadMore('popular')}
        hasMore={hasMore.popular}
        isLoadingMore={loadingMore === 'popular'}
      />
      <ContentRail
        title="Top Airing"
        items={airingItems}
        onItemClick={onOpenAnime}
        enableInfiniteScroll
        onLoadMore={() => onLoadMore('airing')}
        hasMore={hasMore.airing}
        isLoadingMore={loadingMore === 'airing'}
      />
      <ContentRail
        title="Popular Movies"
        items={movieItems}
        onItemClick={onOpenAnime}
        enableInfiniteScroll
        onLoadMore={() => onLoadMore('movies')}
        hasMore={hasMore.movies}
        isLoadingMore={loadingMore === 'movies'}
      />
      <ContentRail
        title="TV Series"
        items={tvShowItems}
        onItemClick={onOpenAnime}
        enableInfiniteScroll
        onLoadMore={() => onLoadMore('tvShows')}
        hasMore={hasMore.tvShows}
        isLoadingMore={loadingMore === 'tvShows'}
      />
    </div>
  );
}