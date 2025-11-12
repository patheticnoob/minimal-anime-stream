declare module "hianime" {
  export type TopAiringResult = {
    page: number;
    totalPage: number;
    hasNextPage: boolean;
    results: Array<{
      title?: string;
      image?: string;
      type?: string;
      id?: string; // human readable id/path
      dataId?: string; // numeric data id used for episodes
    }>;
  };

  export type Episode = {
    id: string; // episode id for servers
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
    getEpisodes(dataId: string): Promise<Array<Episode>>;
    getEpisodeServers(episodeId: string): Promise<EpisodeServers>;
    getEpisodeSources(serverId: string): Promise<EpisodeSources>;
  }

  const _default: typeof Hianime;
  export default _default;
}
