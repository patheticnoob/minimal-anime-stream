import { useAnimeLists as useAnimeListsV1 } from "./use-anime-lists";
import { useAnimeListsV2 } from "./use-anime-lists-v2";
import { useAnimeListsV3 } from "./use-anime-lists-v3";
import { useAnimeListsV4 } from "./use-anime-lists-v4";
import { useAnimeListsGojo } from "./use-anime-lists-gojo";
import { useDataFlow } from "./use-data-flow";

/**
 * Router hook that selects the appropriate anime lists hook based on user's API version preference
 */
export function useAnimeListsRouter() {
  const { dataFlow } = useDataFlow();

  // Call all hooks unconditionally (required by React Rules of Hooks)
  const v1Data = useAnimeListsV1(dataFlow === "v1");
  useAnimeListsV2(dataFlow === "v2");
  useAnimeListsV3(dataFlow === "v3");
  useAnimeListsV4(dataFlow === "v4");
  const v5Data = useAnimeListsGojo(dataFlow === "v5");

  if (dataFlow === "v5") {
    console.log('[Router] Using v5 API hook (Gojo)');
    return v5Data;
  }

  // Default to v1 for all other cases
  console.log('[Router] Using v1 API hook (HiAnime) - dataFlow:', dataFlow);
  return v1Data;
}