import { useCallback } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface UsePhotosProps {
  userId: Id<"users">;
  skip?: boolean;
}

export const usePhotos = ({ userId, skip = false }: UsePhotosProps) => {
  const {
    results: photos,
    status,
    loadMore,
    isLoading: loadingMore,
  } = usePaginatedQuery(
    api.feed.posts.getUserPhotos,
    skip ? "skip" : { userId },
    { initialNumItems: 10 }
  );

  const loading = status === "LoadingFirstPage" && !skip;

  const handleLoadMore = useCallback(() => {
    if (status === "CanLoadMore") {
      loadMore(10);
    }
  }, [status, loadMore]);

  return {
    photos: photos || [],
    loading,
    loadingMore,
    handleLoadMore,
  };
};
