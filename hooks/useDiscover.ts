import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { router } from "expo-router";
import { FilterModalRef } from "@/components/discover/FilterSheet";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getUserLocale } from "@/utils/getUserLocale";

const INITIAL_LOAD_COUNT = 10;

// Filter state interface
interface FilterState {
  country: string | null;
  spokenLanguage: string | null;
  learningLanguage: string | null;
}

export const useDiscover = () => {

  const userLocale = getUserLocale();

  // Local state management
  const [filterState, setFilterState] = useState<FilterState>({
    country: null,
    spokenLanguage: null,
    learningLanguage: null,
  });

  // Refs
  const filterSheetRef = useRef<FilterModalRef>(null);

  // Computed values
  const hasActiveFilters = useMemo(() => {
    return !!(
      filterState.country ||
      filterState.spokenLanguage ||
      filterState.learningLanguage
    );
  }, [filterState]);

  // Build query arguments based on current state
  const queryArgs = useMemo(() => {
    if (hasActiveFilters) {
      // Filter mode
      return {
        country: filterState.country || undefined,
        spokenLanguage: filterState.spokenLanguage || undefined,
        learningLanguage: filterState.learningLanguage || undefined,
        userLocale: userLocale || undefined
      };
    }

    // Default mode - no filters
    return { userLocale };
  }, [hasActiveFilters, filterState, userLocale]);

  // Single unified query
  const discoveryQuery = usePaginatedQuery(
    api.discover.getUsersForDiscovery,
    queryArgs,
    { initialNumItems: INITIAL_LOAD_COUNT }
  );

  // Reset filters on unmount (when leaving screen)
  useEffect(() => {
    return () => {
      setFilterState({ country: null, spokenLanguage: null, learningLanguage: null });
    };
  }, []);

  // Filter handlers
  const handleFilterPress = useCallback(() => {
    filterSheetRef.current?.present();
  }, []);

  const handleFiltersConfirm = useCallback((filters: FilterState) => {
    // Validate that at least one filter is selected
    const hasAtLeastOneFilter = !!(filters.country || filters.spokenLanguage || filters.learningLanguage);

    if (hasAtLeastOneFilter) {
      setFilterState(filters);
    }
  }, []);

  const handleFiltersReset = useCallback(() => {
    setFilterState({ country: null, spokenLanguage: null, learningLanguage: null });
  }, []);

  // Navigation handler
  const handleViewProfile = useCallback((userId: Id<"users">) => {
    router.push(`/screens/user-profile/${userId}`);
  }, []);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    if (discoveryQuery.status === "CanLoadMore") {
      discoveryQuery.loadMore(INITIAL_LOAD_COUNT);
    }
  }, [discoveryQuery]);

  // Computed loading states based on actual Convex query status
  const loading = useMemo(() => {
    return discoveryQuery.status === "LoadingFirstPage";
  }, [discoveryQuery.status]);

  const loadingMore = useMemo(() => {
    return discoveryQuery.status === "LoadingMore";
  }, [discoveryQuery.status]);

  const canLoadMore = useMemo(() => {
    return discoveryQuery.status === "CanLoadMore";
  }, [discoveryQuery.status]);

  // Users data
  const users = useMemo(() => {
    return discoveryQuery.results || [];
  }, [discoveryQuery.results]);

  // // UI state
  // const isFiltering = useMemo(() => {
  //   return hasActiveFilters;
  // }, [hasActiveFilters]);

  return {
    // State
    loading,
    loadingMore,
    canLoadMore,
    users,
    filterState,
    hasActiveFilters,

    // Refs
    filterSheetRef,

    // Filter handlers
    handleFilterPress,
    handleFiltersConfirm,
    handleFiltersReset,

    // Other handlers
    handleViewProfile,
    handleLoadMore,

    // Computed values
    // isFiltering,

    // Constants
    INITIAL_LOAD_COUNT,
  };
};
