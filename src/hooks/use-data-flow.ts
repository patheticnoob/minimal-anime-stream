import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useDataFlow() {
  // Force V1 flow
  return {
    dataFlow: "v1",
    setDataFlow: async () => {},
    isV1: true,
    isV2: false,
  };
}