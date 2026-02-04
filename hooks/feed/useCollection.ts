import { useState, useCallback } from "react";
import { usePaginatedQuery, useQuery, useMutation } from "convex/react";
import { router } from "expo-router";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { usePostActions } from "@/hooks/feed/usePostActions";

export const useCollection = (collectionId: Id<"collections">) => {
  // Use helper hooks
  const postActions = usePostActions();

  // Convex mutations
  const addPostReaction = useMutation(api.feed.interactions.addPostReaction);

  // State for modals and interactions
  const [selectedPostId, setSelectedPostId] = useState<Id<"posts"> | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showReactionsModal, setShowReactionsModal] = useState(false);

  // Query for collection details
  const collectionDetails = useQuery(
    api.feed.collections.getCollectionDetails,
    { collectionId }
  );

  // Paginated query for collection posts
  const {
    results: collectionPosts,
    status,
    loadMore,
    isLoading: loadingMore,
  } = usePaginatedQuery(
    api.feed.collections.getCollectionPosts,
    { collectionId },
    { initialNumItems: 10 }
  );

  // Loading states
  const areCollectionsLoading = status === "LoadingFirstPage";
  const isCollectionDetailsLoading = collectionDetails === undefined;

  // Load more posts
  const handleLoadMore = useCallback(() => {
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

  // Collection owner press handler
  const handleCollectionOwnerPress = useCallback((userId: string) => {
    router.push(`/screens/user-profile/${userId}`);
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
    collectionPosts: collectionPosts || [],
    collectionDetails,
    areCollectionsLoading,
    isCollectionDetailsLoading,
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
    handleCollectionPostOptionsPress: postActions.handleCollectionPostOptionsPress,

    // Collection-specific action handlers
    handleRemoveFromCollection: (postId: Id<"posts">, onSuccess?: () => void) => {
      postActions.handleRemoveFromCollection(postId, onSuccess);
    },
    handleCollectionOwnerPress,

    // Pagination
    handleLoadMore,

    // Component renderers
    renderReactionsModal,
    renderImageViewer,
    renderActionSheet: postActions.renderActionSheet,
    renderDeleteConfirmationModal: postActions.renderDeleteConfirmationModal,
    renderRemoveConfirmationModal: postActions.renderRemoveConfirmationModal,
  };
};
