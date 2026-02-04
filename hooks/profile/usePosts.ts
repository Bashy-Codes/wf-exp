import { useState, useCallback } from "react";
import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { router } from "expo-router";
import { Id } from "@/convex/_generated/dataModel";
import { usePostActions } from "@/hooks/feed/usePostActions";
import { getUserLocale } from "@/utils/getUserLocale";

interface UsePostsProps {
  targetUserId: Id<"users">;
  skip?: boolean;
}

/**
 * Posts hook for profiles
 */
export const usePosts = ({ targetUserId, skip = false }: UsePostsProps) => {

  const userLocale = getUserLocale();

  // Use helper hooks
  const postActions = usePostActions();

  // Convex mutations
  const addPostReaction = useMutation(api.feed.interactions.addPostReaction);

  // State for modals and interactions (owned by this hook)
  const [selectedPostId, setSelectedPostId] = useState<Id<"posts"> | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showReactionsModal, setShowReactionsModal] = useState(false);

  // Paginated query for posts
  const {
    results: posts,
    status,
    loadMore,
    isLoading: loadingMore,
  } = usePaginatedQuery(
    api.feed.posts.getUserPosts,
    skip ? "skip" : { targetUserId, userLocale },
    { initialNumItems: 10 }
  );

  // Loading state
  const loading = status === "LoadingFirstPage";

  // Load more posts
  const handleLoadMore = useCallback(() => {
    console.log("Loading more posts...")
    if (status === "CanLoadMore") {
      loadMore(10);
    }
  }, [status, loadMore]);

  // Comments handler - navigate to post details
  const handleComment = useCallback((postId: Id<"posts">) => {
    router.push(`/screens/post/${postId}`);
  }, []);

  // Reactions modal handler
  const handleReactionsPress = useCallback((postId: Id<"posts">) => {
    setSelectedPostId(postId);
    setShowReactionsModal(true);
  }, []);

  const closeReactionsModal = useCallback(() => {
    setShowReactionsModal(false);
  }, []);

  // Image viewer handlers
  const handleImagePress = useCallback((images: string[], index: number) => {
    setSelectedImages(images);
    setSelectedImageIndex(index);
    setShowImageViewer(true);
  }, []);

  const closeImageViewer = useCallback(() => {
    setShowImageViewer(false);
    setSelectedImages([]);
    setSelectedImageIndex(0);
  }, []);

  // Reaction handler
  const handleReaction = useCallback(async (postId: Id<"posts">, emoji: string) => {
    try {
      await addPostReaction({ postId, emoji });
    } catch (error) {
      console.error("Failed to add reaction:", error);
    }
  }, [addPostReaction]);

  // Component renderers
  const renderReactionsModal = useCallback(() => {
    if (!selectedPostId) return null;
    return {
      visible: showReactionsModal,
      postId: selectedPostId,
      onClose: closeReactionsModal,
    };
  }, [selectedPostId, showReactionsModal, closeReactionsModal]);

  const renderImageViewer = useCallback(() => {
    return {
      images: selectedImages.map((uri) => ({ uri })),
      imageIndex: selectedImageIndex,
      visible: showImageViewer,
      onRequestClose: closeImageViewer,
    };
  }, [selectedImages, selectedImageIndex, showImageViewer, closeImageViewer]);

  return {
    // State
    posts: posts || [],
    loading,
    loadingMore,

    // Post interaction handlers
    handleReaction,
    handleComment,
    handleReactionsPress,
    handleImagePress,
    closeImageViewer,

    // Post action handlers
    handleReadMore: postActions.handleReadMore,
    handleUserPress: postActions.handleUserPress,
    handlePostOptionsPress: postActions.handlePostOptionsPress,

    // Pagination
    handleLoadMore,

    // Component renderers
    renderReactionsModal,
    renderImageViewer,
    renderActionSheet: postActions.renderActionSheet,
    renderCollectionsModal: postActions.renderCollectionsModal,
    renderDeleteConfirmationModal: postActions.renderDeleteConfirmationModal,
    renderRemoveConfirmationModal: postActions.renderRemoveConfirmationModal,
  };
};
