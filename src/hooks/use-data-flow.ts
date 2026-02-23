import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useDataFlow() {
  const dataFlowQuery = useQuery(api.dataFlow.getUserDataFlow);
  // undefined = still loading, string = resolved
  const isLoading = dataFlowQuery === undefined;
  // Don't default to v1 while loading - keep undefined so hooks wait
  const dataFlow = dataFlowQuery ?? "v5";
  const setDataFlowMutation = useMutation(api.dataFlow.setUserDataFlow);

  const setDataFlow = async (flow: string) => {
    try {
      await setDataFlowMutation({ dataFlow: flow });
    } catch (error) {
      console.error("Failed to update data flow:", error);
    }
  };

  return {
    dataFlow,
    isLoading,
    setDataFlow,
    isV1: dataFlow === "v1",
    isV2: dataFlow === "v2",
    isV3: dataFlow === "v3",
    isV4: dataFlow === "v4",
    isV5: dataFlow === "v5",
  };
}