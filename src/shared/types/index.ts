export type AnimeItem = {
  title?: string;
  image?: string;
  type?: string;
  id?: string;
  dataId?: string;
  language?: {
    sub?: string | null;
    dub?: string | null;
  };
  sourceCategory?: "continueWatching" | "watchlist" | "recentEpisodes";
  episodeNumber?: number;
  currentTime?: number;
  duration?: number;
};

export type Episode = {
  id: string;
  title?: string;
  number?: number | string | null;
  currentTime?: number;
  duration?: number;
};

export type AnimePlaybackInfo = {
  animeId: string;
  title: string;
  image?: string | null;
  type?: string;
  language?: {
    sub?: string | null;
    dub?: string | null;
  };
};

export type ServerPreferences = {
  category: "sub" | "dub";
  serverName: string;
};
