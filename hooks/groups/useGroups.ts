import { useCallback } from "react";
import { usePaginatedQuery } from "convex/react";
import { useRouter } from "expo-router";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export const useGroups = () => {
  const router = useRouter();
  const {
    results: groups,
    status,
    isLoading,
  } = usePaginatedQuery(
    api.groups.queries.getUserGroups,
    {},
    { initialNumItems: 10 }
  );

  const loading = status === "LoadingFirstPage";

  return {
    groups: groups || [],
    isLoading,
    loading,
    status,
  };
};
