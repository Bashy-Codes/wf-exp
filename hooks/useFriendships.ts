import { useState, useCallback } from "react";
import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { router } from "expo-router";
import type { Id } from "@/convex/_generated/dataModel";
import { getUserLocale } from "@/utils/getUserLocale";

export const useFriendships = () => {

  const userLocale = getUserLocale();

  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  const {
    results: friendsData,
    status: friendsStatus,
    loadMore: loadMoreFriends,
  } = usePaginatedQuery(
    api.friendships.queries.getUserFriends,
    { userLocale },
    { initialNumItems: 10 }
  );

  const {
    results: requestsData,
    status: requestsStatus,
    loadMore: loadMoreRequests,
  } = usePaginatedQuery(
    api.friendships.queries.getFriendRequests,
    { userLocale },
    { initialNumItems: 10 }
  );

  const acceptRequestMutation = useMutation(api.friendships.mutations.acceptFriendRequest);
  const rejectRequestMutation = useMutation(api.friendships.mutations.rejectFriendRequest);
  const createConversationMutation = useMutation(api.conversations.mutations.createConversation);

  const handleAcceptRequest = useCallback(async (friendshipId: Id<"friendships">) => {
    try {
      await acceptRequestMutation({ friendshipId });
    } catch (error) {
      console.error("Failed to accept request:", error);
    }
  }, [acceptRequestMutation]);

  const handleRejectRequest = useCallback(async (friendshipId: Id<"friendships">) => {
    try {
      await rejectRequestMutation({ friendshipId });
    } catch (error) {
      console.error("Failed to reject request:", error);
    }
  }, [rejectRequestMutation]);

  const handleMessage = useCallback(async (userId: Id<"users">) => {
    if (isCreatingConversation) return;

    try {
      setIsCreatingConversation(true);
      const conversationId = await createConversationMutation({ otherUserId: userId });
      router.push(`/screens/conversation/${conversationId}`);
    } catch (error) {
      console.error("Failed to create conversation:", error);
    } finally {
      setIsCreatingConversation(false);
    }
  }, [createConversationMutation, isCreatingConversation]);

  const handleLoadMoreFriends = useCallback(() => {
    if (friendsStatus === "CanLoadMore") {
      loadMoreFriends(10);
    }
  }, [friendsStatus, loadMoreFriends]);

  const handleLoadMoreRequests = useCallback(() => {
    if (requestsStatus === "CanLoadMore") {
      loadMoreRequests(10);
    }
  }, [requestsStatus, loadMoreRequests]);

  return {
    friends: (friendsData || []).sort((a, b) => a.name.localeCompare(b.name)),
    friendsLoading: friendsStatus === "LoadingFirstPage",
    requests: requestsData || [],
    requestsLoading: requestsStatus === "LoadingFirstPage",
    handleAcceptRequest,
    handleRejectRequest,
    handleMessage,
    handleLoadMoreFriends,
    handleLoadMoreRequests,

    isCreatingConversation
  };
};
