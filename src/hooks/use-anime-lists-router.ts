import { useAnimeLists as useAnimeListsV1 } from "./use-anime-lists";
import { useAnimeListsV2 } from "./use-anime-lists-v2";
import { useAnimeListsV3 } from "./use-anime-lists-v3";
import { useDataFlow } from "./use-data-flow";

/**
 * Router hook that selects the appropriate anime lists hook based on user's API version preference
 */
export function useAnimeListsRouter() {
  const { dataFlow } = useDataFlow();

  // Ensure dataFlow is never undefined - always default to v1
  const safeDataFlow = dataFlow || "v1";
  console.log('[Router] Current dataFlow:', safeDataFlow, '(raw:', dataFlow, ')');

  // Route to the appropriate hook based on dataFlow setting
  if (safeDataFlow === "v2") {
    console.log('[Router] Using v2 API hook');
    return useAnimeListsV2();
  } else if (safeDataFlow === "v3") {
    console.log('[Router] Using v3 API hook');
    return useAnimeListsV3();
  }

  // Default to v1
  console.log('[Router] Using v1 API hook (default)');
  return useAnimeListsV1();
}
