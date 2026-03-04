import { useAnimeLists as useAnimeListsV1 } from "./use-anime-lists";
import { useAnimeListsV2 } from "./use-anime-lists-v2";
import { useAnimeListsV3 } from "./use-anime-lists-v3";
import { useDataFlow } from "./use-data-flow";

/**
 * Router hook that selects the appropriate anime lists hook based on user's API version preference
 */
export function useAnimeListsRouter() {
  const { dataFlow } = useDataFlow();

  // Route to the appropriate hook based on dataFlow setting
  if (dataFlow === "v2") {
    return useAnimeListsV2();
  } else if (dataFlow === "v3") {
    return useAnimeListsV3();
  }

  // Default to v1
  return useAnimeListsV1();
}
