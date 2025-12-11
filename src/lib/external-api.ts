import { AnimeItem } from "@/shared/types";

export async function fetchYumaRecentEpisodes(page: number = 1): Promise<{ results: AnimeItem[]; hasNextPage: boolean }> {
  try {
    const response = await fetch(`https://yumaapi.vercel.app/recent-episodes?page=${page}`);
    if (!response.ok) {
      // Silently fail or return empty
      return { results: [], hasNextPage: false };
    }
    const data = await response.json();
    
    const results = (data.results || []).map((item: any) => {
      // Extract anime ID from new episode ID format (e.g. "dragon-ball-509$episode$10218" -> "dragon-ball-509")
      let animeId = item.id;
      if (typeof animeId === 'string') {
        // Handle new format with $episode$ separator
        if (animeId.includes('$episode$')) {
          animeId = animeId.split('$episode$')[0];
        }
        // Fallback: handle old format with -episode- separator
        else if (animeId.includes('-episode-')) {
          animeId = animeId.replace(/-episode-\d+$/, '');
        }
      }

      return {
        id: item.id,
        dataId: animeId, // Use extracted ID for fetching anime details
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