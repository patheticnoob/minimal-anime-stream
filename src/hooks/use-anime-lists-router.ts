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

  // Determine which hook should be active
  const isV1Active = safeDataFlow === "v1";
  const isV2Active = safeDataFlow === "v2";
  const isV3Active = safeDataFlow === "v3";

  // Call all hooks unconditionally (required by React Rules of Hooks)
  // Pass active flag so each hook can skip fetching if not active
  const v1Data = useAnimeListsV1(isV1Active);
  const v2Data = useAnimeListsV2(isV2Active);
  const v3Data = useAnimeListsV3(isV3Active);

  // Return the appropriate data based on dataFlow setting
  if (isV2Active) {
    console.log('[Router] Using v2 API hook');
    return v2Data;
  } else if (isV3Active) {
    console.log('[Router] Using v3 API hook');
    return v3Data;
  }

  // Default to v1
  console.log('[Router] Using v1 API hook (default)');
  return v1Data;
}
