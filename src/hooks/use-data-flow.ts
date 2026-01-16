import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useDataFlow() {
  const dataFlow = useQuery(api.dataFlow.getUserDataFlow) || "v4";
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
    setDataFlow,
    isV1: dataFlow === "v1",
    isV2: dataFlow === "v2",
    isV3: dataFlow === "v3",
    isV4: dataFlow === "v4",
  };
}