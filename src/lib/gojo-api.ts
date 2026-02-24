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
  episodes?: {
    sub: number;
    dub: number;
    eps: number;
  };
  rank?: number;
  type?: string;
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
  episodes?: {
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
  const episodes = item.episodes || { sub: 0, dub: 0, eps: 0 };
  return {
    id: item.id,
    dataId: item.id,
    title: item.title,
    alternativeTitle: item.alternativeTitle,
    image: item.poster,
    type: item.type || "TV",
    language: {
      sub: episodes.sub > 0 ? String(episodes.sub) : null,
      dub: episodes.dub > 0 ? String(episodes.dub) : null,
    },
    totalEpisodes: episodes.eps,
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
 * Fetch anime by genre using Gojo API
 */
export async function fetchGojoGenre(
  genre: string,
  page: number = 1
): Promise<{ results: AnimeItem[]; hasNextPage: boolean }> {
  try {
    const response = await fetch(
      `${GOJO_API_BASE}/genre/${encodeURIComponent(genre)}?page=${page}`
    );
    if (!response.ok) return { results: [], hasNextPage: false };

    const data: GojoResponse<GojoSearchResult> = await response.json();
    if (!data.success) return { results: [], hasNextPage: false };

    const results = data.data.response.map(item => convertToAnimeItem(item, "genre"));
    return {
      results,
      hasNextPage: data.data.pageInfo.hasNextPage,
    };
  } catch (error) {
    console.error("[Gojo API] Genre Error:", error);
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
    const episodes = anime.episodes || { sub: 0, dub: 0, eps: 0 };
    return {
      id: anime.id,
      dataId: anime.id,
      title: anime.title,
      alternativeTitle: anime.alternativeTitle,
      image: anime.poster,
      type: anime.type || "TV",
      language: {
        sub: episodes.sub > 0 ? String(episodes.sub) : null,
        dub: episodes.dub > 0 ? String(episodes.dub) : null,
      },
      totalEpisodes: episodes.eps,
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

/**
 * Fetch ALL home page data in a single request and return all categories
 */
export async function fetchGojoHomeAll(): Promise<{
  spotlight: AnimeItem[];
  popular: AnimeItem[];
  airing: AnimeItem[];
  latestEpisode: AnimeItem[];
  trending: AnimeItem[];
  mostFavorite: AnimeItem[];
  latestCompleted: AnimeItem[];
  newAdded: AnimeItem[];
  topUpcoming: AnimeItem[];
  topTenToday: AnimeItem[];
  genres: string[];
}> {
  const empty = {
    spotlight: [],
    popular: [],
    airing: [],
    latestEpisode: [],
    trending: [],
    mostFavorite: [],
    latestCompleted: [],
    newAdded: [],
    topUpcoming: [],
    topTenToday: [],
    genres: [],
  };

  try {
    const [homeRes, spotlightRes] = await Promise.all([
      fetch(`${GOJO_API_BASE}/home`),
      fetch(`${GOJO_API_BASE}/spotlight`),
    ]);

    const homeData: GojoResponse<GojoHomeData> = homeRes.ok ? await homeRes.json() : { success: false, data: {} as GojoHomeData };
    const spotlightData: GojoResponse<GojoAnimeItem[]> = spotlightRes.ok ? await spotlightRes.json() : { success: false, data: [] };

    if (!homeData.success) return empty;

    const d = homeData.data;

    return {
      spotlight: spotlightData.success ? spotlightData.data.map(i => convertToAnimeItem(i, "spotlight")) : (d.spotlight || []).map(i => convertToAnimeItem(i, "spotlight")),
      popular: (d.mostPopular || []).map(i => convertToAnimeItem(i, "mostPopular")),
      airing: (d.topAiring || []).map(i => convertToAnimeItem(i, "topAiring")),
      latestEpisode: (d.latestEpisode || []).map(i => convertToAnimeItem(i, "latestEpisode")),
      trending: (d.trending || []).map(i => convertToAnimeItem(i, "trending")),
      mostFavorite: (d.mostFavorite || []).map(i => convertToAnimeItem(i, "mostFavorite")),
      latestCompleted: (d.latestCompleted || []).map(i => convertToAnimeItem(i, "latestCompleted")),
      newAdded: (d.newAdded || []).map(i => convertToAnimeItem(i, "newAdded")),
      topUpcoming: (d.topUpcoming || []).map(i => convertToAnimeItem(i, "topUpcoming")),
      topTenToday: (d.topTen?.today || []).map(i => convertToAnimeItem(i, "topten")),
      genres: Array.isArray(d.genres) ? d.genres : [],
    };
  } catch (error) {
    console.error("[Gojo API] HomeAll Error:", error);
    return empty;
  }
}