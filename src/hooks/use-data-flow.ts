import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useDataFlow() {
  const dataFlow = useQuery(api.dataFlow.getUserDataFlow);
  const setDataFlow = useMutation(api.dataFlow.setUserDataFlow);

  return {
    dataFlow: dataFlow || "v1",
    setDataFlow,
    isV1: dataFlow === "v1" || !dataFlow,
    isV2: dataFlow === "v2",
  };
}
