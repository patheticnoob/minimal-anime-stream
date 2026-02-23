import { useAnimeLists as useAnimeListsV1 } from "./use-anime-lists";
import { useAnimeListsV2 } from "./use-anime-lists-v2";
import { useAnimeListsV3 } from "./use-anime-lists-v3";
import { useAnimeListsV4 } from "./use-anime-lists-v4";
import { useAnimeListsGojo } from "./use-anime-lists-gojo";
import { useDataFlow } from "./use-data-flow";

export function useAnimeListsRouter() {
  const { dataFlow } = useDataFlow();

  const v1Data = useAnimeListsV1(dataFlow === "v1");
  useAnimeListsV2(dataFlow === "v2");
  useAnimeListsV3(dataFlow === "v3");
  useAnimeListsV4(dataFlow === "v4");
  const v5Data = useAnimeListsGojo(dataFlow === "v5");

  if (dataFlow === "v5") {
    return v5Data;
  }

  return {
    ...v1Data,
    mostFavoriteItems: [],
    latestCompletedItems: [],
    newAddedItems: [],
    topUpcomingItems: [],
    topTenItems: [],
    genres: [],
  };
}