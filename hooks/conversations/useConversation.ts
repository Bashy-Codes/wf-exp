import { useCallback, useEffect, useState } from "react";
import { useConvex, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ConversationInfo, MessageData } from "@/types/conversations";
import { useConversationHelpers } from "./conversationHelpers";

export const useConversation = (conversationId: string) => {
  const convex = useConvex();
  const [conversationInfo, setConversationInfo] = useState<ConversationInfo | null>(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    results,
    status,
    loadMore,
    isLoading,
  } = usePaginatedQuery(
    api.conversations.queries.getConversationMessages,
    { conversationId },
    { initialNumItems: 10 }
  );

  const helpers = useConversationHelpers({ conversationId, isGroup: false });

  useEffect(() => {
    async function fetchConversationInfo() {
      try {
        setIsLoadingConversation(true);
        setError(null);
        const result = await convex.query(api.conversations.queries.getConversationInfo, {
          conversationId,
        });
        setConversationInfo(result);
      } catch (err) {
        console.error("Failed to fetch conversation info:", err);
        setError("Failed to load conversation info");
      } finally {
        setIsLoadingConversation(false);
      }
    }

    fetchConversationInfo();
  }, [conversationId, convex]);

  const loadOlderMessages = useCallback(() => {
    if (status === "CanLoadMore" && !isLoading) {
      loadMore(10);
    }
  }, [status, isLoading, loadMore]);

  return {
    conversationInfo,
    messages: (results || []) as MessageData[],
    isLoadingConversation,
    isLoadingMessages: isLoading,
    messagesStatus: status,
    loadOlderMessages,
    hasOlderMessages: status === "CanLoadMore",
    error,
    ...helpers,
  };
};