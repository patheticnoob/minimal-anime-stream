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
  // V2 enriched fields from Hianime API
  alternativeTitle?: string;
  quality?: string; // HD, FHD, etc.
  rank?: number;
  rating?: string; // PG-13, R, etc.
  is18Plus?: boolean;
  malScore?: number;
  synonyms?: string;
  premiered?: string;
  producers?: string[];
  related?: Array<{
    title: string;
    alternativeTitle?: string;
    id: string;
    poster: string;
    type: string;
    episodes?: { sub: number; dub: number; eps: number };
  }>;
  moreSeasons?: Array<{
    title: string;
    id: string;
    poster: string;
  }>;
  // V2 enriched fields from Jikan
  malId?: number;
  synopsis?: string;
  genres?: string[];
  score?: number;
  totalEpisodes?: number;
  status?: string;
  aired?: string | { from?: string; to?: string | null };
  studios?: string[];
  // V3 fields from Yuma
  episodes?: number;
  japaneseTitle?: string;
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