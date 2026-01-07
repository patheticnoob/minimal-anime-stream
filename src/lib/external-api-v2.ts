import { AnimeItem } from "@/shared/types";

const HIANIME_API_BASE = "https://hianime-api-jzl7.onrender.com/api/v1";

// V2 API Types based on Hianime API
export type HianimeResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type HianimeSpotlightItem = {
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

export type HianimeAnimeItem = {
  title: string;
  alternativeTitle?: string;
  id: string;
  poster: string;
  episodes: {
    sub: number;
    dub: number;
    eps: number;
  };
  type: string;
  duration?: string;
  rank?: number;
};

export type HianimeHomeData = {
  spotlight: HianimeSpotlightItem[];
  trending: HianimeAnimeItem[];
  topAiring: HianimeAnimeItem[];
  mostPopular: HianimeAnimeItem[];
  mostFavorite: HianimeAnimeItem[];
  latestCompleted: HianimeAnimeItem[];
  latestEpisode: HianimeAnimeItem[];
  newAdded: HianimeAnimeItem[];
  topUpcoming: HianimeAnimeItem[];
  topTen: {
    today: HianimeAnimeItem[];
    week: HianimeAnimeItem[];
    month: HianimeAnimeItem[];
  };
};

export type HianimeSearchResult = {
  pageInfo: {
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
  };
  response: HianimeAnimeItem[];
};

// Convert Hianime API item to our internal AnimeItem format
function convertToAnimeItem(item: HianimeAnimeItem | HianimeSpotlightItem, category?: string): AnimeItem {
  const converted = {
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
    synopsis: 'synopsis' in item ? item.synopsis : undefined,
    aired: 'aired' in item ? item.aired : undefined,
    quality: 'quality' in item ? item.quality : undefined,
    rank: item.rank,
    sourceCategory: category as any,
  };

  // Log for debugging
  if (converted.quality || converted.rank) {
    console.log('[V2 API] Converted item:', {
      title: converted.title,
      quality: converted.quality,
      rank: converted.rank,
      hasSynopsis: !!converted.synopsis
    });
  }

  return converted;
}

/**
 * Fetch home page data from Hianime API v2
 */
export async function fetchHianimeHome(): Promise<{ results: AnimeItem[]; hasNextPage: boolean }> {
  try {
    const response = await fetch(`${HIANIME_API_BASE}/home`);
    if (!response.ok) {
      return { results: [], hasNextPage: false };
    }
    const data: HianimeResponse<HianimeHomeData> = await response.json();

    if (!data.success) {
      return { results: [], hasNextPage: false };
    }

    // Combine multiple categories into a single results array
    const results: AnimeItem[] = [
      ...data.data.spotlight.map(item => convertToAnimeItem(item, "spotlight")),
      ...data.data.trending.slice(0, 10).map(item => convertToAnimeItem(item, "trending")),
    ];

    return {
      results,
      hasNextPage: false
    };
  } catch (error) {
    console.error("Hianime API v2 Error:", error);
    return { results: [], hasNextPage: false };
  }
}

/**
 * Fetch spotlight anime from Hianime API v2
 */
export async function fetchHianimeSpotlight(): Promise<{ results: AnimeItem[]; hasNextPage: boolean }> {
  try {
    const response = await fetch(`${HIANIME_API_BASE}/spotlight`);
    if (!response.ok) {
      return { results: [], hasNextPage: false };
    }
    const data: HianimeResponse<HianimeSpotlightItem[]> = await response.json();

    if (!data.success) {
      return { results: [], hasNextPage: false };
    }

    const results = data.data.map(item => convertToAnimeItem(item, "spotlight"));

    return {
      results,
      hasNextPage: false
    };
  } catch (error) {
    console.error("Hianime API v2 Spotlight Error:", error);
    return { results: [], hasNextPage: false };
  }
}

/**
 * Fetch top 10 anime from Hianime API v2
 */
export async function fetchHianimeTopTen(period: "today" | "week" | "month" = "today"): Promise<{ results: AnimeItem[]; hasNextPage: boolean }> {
  try {
    const response = await fetch(`${HIANIME_API_BASE}/topten`);
    if (!response.ok) {
      return { results: [], hasNextPage: false };
    }
    const data: HianimeResponse<{ today: HianimeAnimeItem[]; week: HianimeAnimeItem[]; month: HianimeAnimeItem[] }> = await response.json();

    if (!data.success) {
      return { results: [], hasNextPage: false };
    }

    const results = data.data[period].map(item => convertToAnimeItem(item, "topten"));

    return {
      results,
      hasNextPage: false
    };
  } catch (error) {
    console.error("Hianime API v2 TopTen Error:", error);
    return { results: [], hasNextPage: false };
  }
}

/**
 * Search anime using Hianime API v2
 */
export async function searchHianime(query: string, page: number = 1): Promise<{ results: AnimeItem[]; hasNextPage: boolean }> {
  try {
    const response = await fetch(`${HIANIME_API_BASE}/search?keyword=${encodeURIComponent(query)}&page=${page}`);
    if (!response.ok) {
      return { results: [], hasNextPage: false };
    }
    const data: HianimeResponse<HianimeSearchResult> = await response.json();

    if (!data.success) {
      return { results: [], hasNextPage: false };
    }

    const results = data.data.response.map(item => convertToAnimeItem(item, "search"));

    return {
      results,
      hasNextPage: data.data.pageInfo.hasNextPage
    };
  } catch (error) {
    console.error("Hianime API v2 Search Error:", error);
    return { results: [], hasNextPage: false };
  }
}

/**
 * Fetch specific category from home endpoint
 */
export async function fetchHianimeCategory(
  category: "trending" | "topAiring" | "mostPopular" | "mostFavorite" | "latestCompleted" | "latestEpisode" | "newAdded" | "topUpcoming"
): Promise<{ results: AnimeItem[]; hasNextPage: boolean }> {
  try {
    const response = await fetch(`${HIANIME_API_BASE}/home`);
    if (!response.ok) {
      return { results: [], hasNextPage: false };
    }
    const data: HianimeResponse<HianimeHomeData> = await response.json();

    if (!data.success) {
      return { results: [], hasNextPage: false };
    }

    const results = data.data[category].map(item => convertToAnimeItem(item, category));

    return {
      results,
      hasNextPage: false
    };
  } catch (error) {
    console.error(`Hianime API v2 ${category} Error:`, error);
    return { results: [], hasNextPage: false };
  }
}

export type HianimeAnimeDetails = {
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

/**
 * Fetch detailed anime information
 */
export async function fetchHianimeAnimeDetails(animeId: string): Promise<AnimeItem | null> {
  try {
    const response = await fetch(`${HIANIME_API_BASE}/anime/${animeId}`);
    if (!response.ok) {
      return null;
    }
    const data: HianimeResponse<HianimeAnimeDetails> = await response.json();

    if (!data.success) {
      return null;
    }

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
    console.error("Hianime API v2 Anime Details Error:", error);
    return null;
  }
}

/**
 * Fetch episodes list for an anime
 */
export type HianimeEpisode = {
  title: string;
  alternativeTitle?: string;
  id: string;
  isFiller: boolean;
  episodeNumber: number;
};

export async function fetchHianimeEpisodes(animeId: string): Promise<HianimeEpisode[]> {
  try {
    const response = await fetch(`${HIANIME_API_BASE}/episodes/${animeId}`);
    if (!response.ok) {
      console.error(`Hianime episodes API returned ${response.status}`);
      return [];
    }
    const data: HianimeResponse<HianimeEpisode[]> = await response.json();

    if (!data.success) {
      return [];
    }

    console.log(`[V2 API] Fetched ${data.data.length} episodes for ${animeId}`);
    return data.data;
  } catch (error) {
    console.error("Hianime API v2 Episodes Error:", error);
    return [];
  }
}
