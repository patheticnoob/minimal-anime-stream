import { ContentRail } from "./ContentRail";

type AnimeItem = {
  title?: string;
  image?: string;
  type?: string;
  id?: string;
  dataId?: string;
  language?: {
    sub?: string | null;
    dub?: string | null;
  };
  episodeNumber?: number;
  currentTime?: number;
  duration?: number;
  sourceCategory?: "continueWatching" | "watchlist" | "recentEpisodes";
};

interface HomeContentRailsProps {
  isAuthenticated: boolean;
  continueWatchingItems: AnimeItem[];
  watchlistItems: AnimeItem[];
  recentEpisodesItems: AnimeItem[];
  popularItems: AnimeItem[];
  airingItems: AnimeItem[];
  movieItems: AnimeItem[];
  tvShowItems: AnimeItem[];
  onItemClick: (item: AnimeItem) => void;
  onLoadMore: (category: 'popular' | 'airing' | 'movies' | 'tvShows' | 'recentEpisodes') => void;
  hasMore: {
    popular: boolean;
    airing: boolean;
    movies: boolean;
    tvShows: boolean;
    recentEpisodes: boolean;
  };
  loadingMore: string | null;
}

export function HomeContentRails({
  isAuthenticated,
  continueWatchingItems,
  watchlistItems,
  recentEpisodesItems,
  popularItems,
  airingItems,
  movieItems,
  tvShowItems,
  onItemClick,
  onLoadMore,
  hasMore,
  loadingMore,
}: HomeContentRailsProps) {
  return (
    <div className="space-y-8">
      {/* Continue Watching */}
      {isAuthenticated && continueWatchingItems.length > 0 && (
        <ContentRail
          title="Continue Watching"
          items={continueWatchingItems}
          onItemClick={onItemClick}
        />
      )}

      {/* My Watchlist */}
      {isAuthenticated && watchlistItems.length > 0 && (
        <ContentRail
          title="My Watchlist"
          items={watchlistItems}
          onItemClick={onItemClick}
        />
      )}

      {/* Recent Episodes */}
      {recentEpisodesItems.length > 0 && (
        <ContentRail
          title="Recent Episodes"
          items={recentEpisodesItems}
          onItemClick={onItemClick}
          enableInfiniteScroll
          onLoadMore={() => onLoadMore('recentEpisodes')}
          hasMore={hasMore.recentEpisodes}
          isLoadingMore={loadingMore === 'recentEpisodes'}
        />
      )}

      <ContentRail
        title="Trending Now"
        items={popularItems}
        onItemClick={onItemClick}
        enableInfiniteScroll
        onLoadMore={() => onLoadMore('popular')}
        hasMore={hasMore.popular}
        isLoadingMore={loadingMore === 'popular'}
      />
      
      <ContentRail
        title="Top Airing"
        items={airingItems}
        onItemClick={onItemClick}
        enableInfiniteScroll
        onLoadMore={() => onLoadMore('airing')}
        hasMore={hasMore.airing}
        isLoadingMore={loadingMore === 'airing'}
      />
      
      <ContentRail
        title="Popular Movies"
        items={movieItems}
        onItemClick={onItemClick}
        enableInfiniteScroll
        onLoadMore={() => onLoadMore('movies')}
        hasMore={hasMore.movies}
        isLoadingMore={loadingMore === 'movies'}
      />
      
      <ContentRail
        title="TV Series"
        items={tvShowItems}
        onItemClick={onItemClick}
        enableInfiniteScroll
        onLoadMore={() => onLoadMore('tvShows')}
        hasMore={hasMore.tvShows}
        isLoadingMore={loadingMore === 'tvShows'}
      />
    </div>
  );
}
