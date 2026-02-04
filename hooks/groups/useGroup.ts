import { useCallback, useEffect, useState } from "react";
import { useConvex, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { GroupInfo } from "@/types/groups";
import { MessageData } from "@/types/conversations";
import { useConversationHelpers } from "../conversations/conversationHelpers";

export const useGroup = (groupId: Id<"groups">) => {
  const convex = useConvex();
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [isLoadingGroup, setIsLoadingGroup] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    results,
    status,
    loadMore,
    isLoading,
  } = usePaginatedQuery(
    api.groups.queries.getGroupMessages,
    { groupId },
    { initialNumItems: 10 }
  );

  const helpers = useConversationHelpers({ groupId, isGroup: true });

  useEffect(() => {
    async function fetchGroupInfo() {
      try {
        setIsLoadingGroup(true);
        setError(null);
        const result = await convex.query(api.groups.queries.getGroupInfo, { groupId });
        setGroupInfo(result);
      } catch (err) {
        console.error("Failed to fetch group info:", err);
        setError("Failed to load group info");
      } finally {
        setIsLoadingGroup(false);
      }
    }

    fetchGroupInfo();
  }, [groupId, convex]);

  const loadOlderMessages = useCallback(() => {
    if (status === "CanLoadMore" && !isLoading) {
      loadMore(10);
    }
  }, [status, isLoading, loadMore]);

  return {
    groupInfo,
    messages: (results || []) as MessageData[],
    isLoadingGroup,
    isLoadingMessages: isLoading,
    messagesStatus: status,
    loadOlderMessages,
    hasOlderMessages: status === "CanLoadMore",
    error,
    ...helpers,
  };
};
