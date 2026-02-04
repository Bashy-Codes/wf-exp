import { useCallback } from "react";
import { usePaginatedQuery, useMutation } from "convex/react";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import { api } from "@/convex/_generated/api";
import { getUserLocale } from "@/utils/getUserLocale";


export const useConversations = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const locale = getUserLocale();

  const {
    results: conversations,
    status,
    loadMore,
    isLoading,
  } = usePaginatedQuery(
    api.conversations.queries.getUserConversations,
    { locale },
    { initialNumItems: 10 }
  );

  // Initial Loading state
  const loading = status === "LoadingFirstPage";

  // Delete conversation mutation
  const deleteConversationMutation = useMutation(api.conversations.mutations.deleteConversation);

  // Delete conversation handler
  const handleDeleteConversation = useCallback(
    async (conversationId: string) => {
      try {
        await deleteConversationMutation({ conversationId });
        Toast.show({
          type: "success",
          text1: t("toasts.conversationDeleted")
        });
      } catch (error) {
        console.error("Failed to delete conversation:", error);
        Toast.show({
          type: "error",
          text1: t("errorToasts.genericError")
        });
      }
    },
    [deleteConversationMutation, t]
  );

  // Load more handler
  const handleLoadMore = useCallback(() => {
    if (status === "CanLoadMore" && !isLoading) {
      loadMore(10);
    }
  }, [status, isLoading, loadMore]);

  return {
    conversations: conversations || [],
    isLoading,
    loading,
    status,
    loadMore,
    hasMore: status === "CanLoadMore",

    // hanlders
    handleDeleteConversation,
    loadMoreConversations: handleLoadMore,
  };
};