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
  // V2 enriched fields from Jikan
  malId?: number;
  synopsis?: string;
  genres?: string[];
  score?: number;
  totalEpisodes?: number;
  status?: string;
  aired?: string;
  studios?: string[];
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