import { AnimeItem } from "@/shared/types";

export async function fetchYumaRecentEpisodes(page: number = 1): Promise<{ results: AnimeItem[]; hasNextPage: boolean }> {
  try {
    const response = await fetch(`https://yumaapi.vercel.app/recent-episodes?page=${page}`);
    if (!response.ok) {
      return { results: [], hasNextPage: false };
    }
    const data = await response.json();
    
    const results = (data.results || []).map((item: any) => {
      // The 'id' field from recent-episodes is the correct anime ID
      // Use it directly as dataId for fetching episodes via hianime
      return {
        id: item.id,
        dataId: item.id, // Use the ID directly without any parsing
        title: item.title,
        image: item.image,
        type: item.type,
        language: {
          sub: item.sub ? String(item.sub) : null,
          dub: item.dub ? String(item.dub) : null,
        },
        sourceCategory: "recentEpisodes" as const,
      };
    });

    return {
      results,
      hasNextPage: data.hasNextPage || data.has_next_page || false
    };
  } catch (error) {
    console.error("Yuma API Error:", error);
    return { results: [], hasNextPage: false };
  }
}