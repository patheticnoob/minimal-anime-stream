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
  return {
    id: item.id,
    dataId: item.id,
    title: item.title,
    image: item.poster,
    type: item.type,
    language: {
      sub: item.episodes.sub > 0 ? String(item.episodes.sub) : null,
      dub: item.episodes.dub > 0 ? String(item.episodes.dub) : null,
    },
    totalEpisodes: item.episodes.eps,
    duration: item.duration ? parseFloat(item.duration) : undefined,
    synopsis: 'synopsis' in item ? item.synopsis : undefined,
    aired: item.aired,
    sourceCategory: category as any,
  };
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
