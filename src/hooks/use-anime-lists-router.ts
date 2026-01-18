import { useAnimeLists as useAnimeListsV1 } from "./use-anime-lists";
import { useAnimeListsV2 } from "./use-anime-lists-v2";
import { useAnimeListsV3 } from "./use-anime-lists-v3";
import { useAnimeListsV4 } from "./use-anime-lists-v4";
import { useDataFlow } from "./use-data-flow";

/**
 * Router hook that selects the appropriate anime lists hook based on user's API version preference
 */
export function useAnimeListsRouter() {
  const { dataFlow } = useDataFlow();

  // EMERGENCY: Force v1 due to Yumaapi outage (overrides user preference)
  console.log('[Router] 🚨 FORCED v1 API (Yumaapi outage) - User preference:', dataFlow, 'ignored');

  // Call all hooks unconditionally (required by React Rules of Hooks)
  // Only v1 is active, all others are inactive
  const v1Data = useAnimeListsV1(true);  // Force active
  const v2Data = useAnimeListsV2(false);
  const v3Data = useAnimeListsV3(false);
  const v4Data = useAnimeListsV4(false);

  // Always return v1 data during Yumaapi outage
  console.log('[Router] Using v1 API hook (Hianime) - forced due to Yumaapi outage');
  return v1Data;
}
