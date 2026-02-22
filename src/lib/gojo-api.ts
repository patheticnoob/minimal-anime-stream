import { AnimeItem } from "@/shared/types";

const GOJO_API_BASE = "https://gojoback.zeabur.app/api/v1";

// ─── Types ───────────────────────────────────────────────────────────────────

export type GojoResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type GojoAnimeItem = {
  title: string;
  alternativeTitle?: string;
  id: string;
  poster: string;
  episodes: {
    sub: number;
    dub: number;
    eps: number;
  };
  rank?: number;
  type: string;
  quality?: string;
  duration?: string;
  aired?: string;
  synopsis?: string;
};

export type GojoHomeData = {
  spotlight: GojoAnimeItem[];
  trending: GojoAnimeItem[];
  topAiring: GojoAnimeItem[];
  mostPopular: GojoAnimeItem[];
  mostFavorite: GojoAnimeItem[];
  latestCompleted: GojoAnimeItem[];
  latestEpisode: GojoAnimeItem[];
  newAdded: GojoAnimeItem[];
  topUpcoming: GojoAnimeItem[];
  topTen: {
    today: GojoAnimeItem[];
    week: GojoAnimeItem[];
    month: GojoAnimeItem[];
  };
  genres?: string[];
};

export type GojoAnimeDetails = {
  title: string;
  alternativeTitle?: string;
  id: string;
  poster: string;
  episodes: {
    sub: number;
    dub: number;
    eps: number;
  };
  rating?: string;
  type: string;
  is18Plus: boolean;
  synopsis?: string;
  synonyms?: string;
  aired?: {
    from?: string;
    to?: string | null;
  };
  premiered?: string;
  duration?: string;
  status?: string;
  MAL_score?: string;
  genres?: string[];
  studios?: string[];
  producers?: string[];
  moreSeasons?: Array<{
    title: string;
    id: string;
    poster: string;
  }>;
  related?: Array<{
    title: string;
    alternativeTitle?: string;
    id: string;
    poster: string;
    type: string;
    episodes?: { sub: number; dub: number; eps: number };
  }>;
};

export type GojoEpisode = {
  title: string;
  alternativeTitle?: string;
  id: string;
  isFiller: boolean;
  episodeNumber: number;
};

export type GojoServer = {
  index: number | null;
  type: "sub" | "dub";
  id: number | null;
  name: string;
};

export type GojoServersData = {
  episode: number;
  sub: GojoServer[];
  dub: GojoServer[];
};

export type GojoSearchResult = {
  pageInfo: {
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
  };
  response: GojoAnimeItem[];
};

// ─── Converter ───────────────────────────────────────────────────────────────

function convertToAnimeItem(item: GojoAnimeItem, category?: string): AnimeItem {
  return {
    id: item.id,
    dataId: item.id,
    title: item.title,
    alternativeTitle: item.alternativeTitle,
    image: item.poster,
    type: item.type,
    language: {
      sub: item.episodes.sub > 0 ? String(item.episodes.sub) : null,
      dub: item.episodes.dub > 0 ? String(item.episodes.dub) : null,
    },
    totalEpisodes: item.episodes.eps,
    duration: item.duration ? parseFloat(item.duration) : undefined,
    synopsis: item.synopsis,
    aired: item.aired,
    quality: item.quality,
    rank: item.rank,
    sourceCategory: category as any,
  };
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Fetch home page data from Gojo API
 */
export async function fetchGojoHome(): Promise<{ results: AnimeItem[]; hasNextPage: boolean }> {
  try {
    const response = await fetch(`${GOJO_API_BASE}/home`);
    if (!response.ok) return { results: [], hasNextPage: false };

    const data: GojoResponse<GojoHomeData> = await response.json();
    if (!data.success) return { results: [], hasNextPage: false };

    const results: AnimeItem[] = [
      ...data.data.spotlight.map(item => convertToAnimeItem(item, "spotlight")),
      ...data.data.trending.slice(0, 10).map(item => convertToAnimeItem(item, "trending")),
    ];

    return { results, hasNextPage: false };
  } catch (error) {
    console.error("[Gojo API] Home Error:", error);
    return { results: [], hasNextPage: false };
  }
}

/**
 * Fetch spotlight anime from Gojo API
 */
export async function fetchGojoSpotlight(): Promise<{ results: AnimeItem[]; hasNextPage: boolean }> {
  try {
    const response = await fetch(`${GOJO_API_BASE}/spotlight`);
    if (!response.ok) return { results: [], hasNextPage: false };

    const data: GojoResponse<GojoAnimeItem[]> = await response.json();
    if (!data.success) return { results: [], hasNextPage: false };

    const results = data.data.map(item => convertToAnimeItem(item, "spotlight"));
    return { results, hasNextPage: false };
  } catch (error) {
    console.error("[Gojo API] Spotlight Error:", error);
    return { results: [], hasNextPage: false };
  }
}

/**
 * Fetch top 10 anime from Gojo API
 */
export async function fetchGojoTopTen(
  period: "today" | "week" | "month" = "today"
): Promise<{ results: AnimeItem[]; hasNextPage: boolean }> {
  try {
    const response = await fetch(`${GOJO_API_BASE}/topten`);
    if (!response.ok) return { results: [], hasNextPage: false };

    const data: GojoResponse<{ today: GojoAnimeItem[]; week: GojoAnimeItem[]; month: GojoAnimeItem[] }> = await response.json();
    if (!data.success) return { results: [], hasNextPage: false };

    const results = data.data[period].map(item => convertToAnimeItem(item, "topten"));
    return { results, hasNextPage: false };
  } catch (error) {
    console.error("[Gojo API] TopTen Error:", error);
    return { results: [], hasNextPage: false };
  }
}

/**
 * Fetch a specific category from Gojo home endpoint
 */
export async function fetchGojoCategory(
  category: "trending" | "topAiring" | "mostPopular" | "mostFavorite" | "latestCompleted" | "latestEpisode" | "newAdded" | "topUpcoming"
): Promise<{ results: AnimeItem[]; hasNextPage: boolean }> {
  try {
    const response = await fetch(`${GOJO_API_BASE}/home`);
    if (!response.ok) return { results: [], hasNextPage: false };

    const data: GojoResponse<GojoHomeData> = await response.json();
    if (!data.success) return { results: [], hasNextPage: false };

    const results = data.data[category].map(item => convertToAnimeItem(item, category));
    return { results, hasNextPage: false };
  } catch (error) {
    console.error(`[Gojo API] Category ${category} Error:`, error);
    return { results: [], hasNextPage: false };
  }
}

/**
 * Search anime using Gojo API
 */
export async function searchGojo(
  query: string,
  page: number = 1
): Promise<{ results: AnimeItem[]; hasNextPage: boolean }> {
  try {
    const response = await fetch(
      `${GOJO_API_BASE}/search?keyword=${encodeURIComponent(query)}&page=${page}`
    );
    if (!response.ok) return { results: [], hasNextPage: false };

    const data: GojoResponse<GojoSearchResult> = await response.json();
    if (!data.success) return { results: [], hasNextPage: false };

    const results = data.data.response.map(item => convertToAnimeItem(item, "search"));
    return {
      results,
      hasNextPage: data.data.pageInfo.hasNextPage,
    };
  } catch (error) {
    console.error("[Gojo API] Search Error:", error);
    return { results: [], hasNextPage: false };
  }
}

/**
 * Fetch detailed anime information from Gojo API
 */
export async function fetchGojoAnimeDetails(animeId: string): Promise<AnimeItem | null> {
  try {
    const response = await fetch(`${GOJO_API_BASE}/anime/${animeId}`);
    if (!response.ok) return null;

    const data: GojoResponse<GojoAnimeDetails> = await response.json();
    if (!data.success) return null;

    const anime = data.data;
    return {
      id: anime.id,
      dataId: anime.id,
      title: anime.title,
      alternativeTitle: anime.alternativeTitle,
      image: anime.poster,
      type: anime.type,
      language: {
        sub: anime.episodes.sub > 0 ? String(anime.episodes.sub) : null,
        dub: anime.episodes.dub > 0 ? String(anime.episodes.dub) : null,
      },
      totalEpisodes: anime.episodes.eps,
      duration: anime.duration ? parseFloat(anime.duration) : undefined,
      synopsis: anime.synopsis,
      rating: anime.rating,
      is18Plus: anime.is18Plus,
      malScore: anime.MAL_score ? parseFloat(anime.MAL_score) : undefined,
      genres: anime.genres,
      studios: anime.studios,
      producers: anime.producers,
      status: anime.status,
      aired: anime.aired,
      premiered: anime.premiered,
      synonyms: anime.synonyms,
      related: anime.related,
      moreSeasons: anime.moreSeasons,
    };
  } catch (error) {
    console.error("[Gojo API] Anime Details Error:", error);
    return null;
  }
}

/**
 * Fetch episodes list for an anime from Gojo API
 */
export async function fetchGojoEpisodes(animeId: string): Promise<GojoEpisode[]> {
  try {
    const response = await fetch(`${GOJO_API_BASE}/episodes/${animeId}`);
    if (!response.ok) {
      console.error(`[Gojo API] Episodes returned ${response.status}`);
      return [];
    }

    const data: GojoResponse<GojoEpisode[]> = await response.json();
    if (!data.success) return [];

    console.log(`[Gojo API] Fetched ${data.data.length} episodes for ${animeId}`);
    return data.data;
  } catch (error) {
    console.error("[Gojo API] Episodes Error:", error);
    return [];
  }
}

/**
 * Fetch servers for an episode from Gojo API
 */
export async function fetchGojoServers(episodeId: string): Promise<GojoServersData | null> {
  try {
    const response = await fetch(`${GOJO_API_BASE}/servers/${episodeId}`);
    if (!response.ok) {
      console.error(`[Gojo API] Servers returned ${response.status}`);
      return null;
    }

    const data: GojoResponse<GojoServersData> = await response.json();
    if (!data.success) return null;

    return data.data;
  } catch (error) {
    console.error("[Gojo API] Servers Error:", error);
    return null;
  }
}
