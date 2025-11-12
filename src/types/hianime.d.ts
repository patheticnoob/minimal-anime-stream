declare module "hianime" {
  export type AnimeItem = {
    id?: string;
    image?: string;
    title?: string;
    type?: string;
    dataId?: string;
    language?: {
      sub?: string;
      dub?: string;
    };
  };

  export type TopAiringResult = {
    page: number;
    totalPage: number;
    hasNextPage: boolean;
    results: Array<AnimeItem>;
  };

  export type Episode = {
    id: string;
    title?: string;
    number?: number;
  };

  export type EpisodeServers = {
    sub: Array<{ id: string; name: string }>;
    dub: Array<{ id: string; name: string }>;
  };

  export type EpisodeSources = {
    sources: Array<{ file: string; type: string }>;
    tracks?: Array<{ file: string; label: string; kind?: string }>;
  };

  export class Hianime {
    constructor();
    getTopAiring(page?: number): Promise<TopAiringResult>;
    getMostPopular(page?: number): Promise<TopAiringResult>;
    getTVShows(page?: number): Promise<TopAiringResult>;
    getMovies(page?: number): Promise<TopAiringResult>;
    getEpisodes(dataId: string): Promise<Array<Episode>>;
    getEpisodeServers(episodeId: string): Promise<EpisodeServers>;
    getEpisodeSources(serverId: string): Promise<EpisodeSources>;
  }

  const _default: typeof Hianime;
  export default _default;
}