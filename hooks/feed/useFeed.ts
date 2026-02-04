import { useState, useCallback, useEffect } from "react";
import { router } from "expo-router";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePostActions } from "@/hooks/feed/usePostActions";
import { getUserLocale } from "@/utils/getUserLocale";

export const useFeed = () => {

  const userLocale = getUserLocale();

  // State for modals and interactions
  const [selectedPostId, setSelectedPostId] = useState<Id<"posts"> | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showReactionsModal, setShowReactionsModal] = useState(false);

  // Use helper hooks
  const postActions = usePostActions();

  // Convex mutations
  const updateLastActive = useMutation(api.users.mutations.updateLastActive);
  const addPostReaction = useMutation(api.feed.interactions.addPostReaction);

  // Paginated query for feed posts
  const {
    results: posts,
    status,
    loadMore,
    isLoading: loadingMore,
  } = usePaginatedQuery(api.feed.posts.getFeedPosts,
    { userLocale },
    { initialNumItems: 10 });


  // Update last active when component mounts
  useEffect(() => {
    const updateUserActivity = async () => {
      try {
        await updateLastActive();
      } catch (error) {
        console.error("Failed to update last active:", error);
      }
    };

    updateUserActivity();
  }, [updateLastActive]);

  // Loading state
  const loading = status === "LoadingFirstPage";

  // Load more posts
  const handleLoadMore = useCallback(() => {
    if (status === "CanLoadMore") {
      loadMore(10);
    }
  }, [status, loadMore]);

  // Feed-specific handlers
  const handleCreatePost = () => {
    router.push("/screens/create-post");
  };

  // Comments handler - navigate to post details
  const handleCommentPress = useCallback((postId: Id<"posts">) => {
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

    // Feed-specific handlers
    handleCreatePost,
    handleLoadMore,

    // Post interaction handlers
    handleReaction,
    handleCommentPress,
    handleReactionsPress,
    handleImagePress,
    closeImageViewer,

    // Post action handlers
    handleReadMore: postActions.handleReadMore,
    handleUserPress: postActions.handleUserPress,
    handlePostOptionsPress: postActions.handlePostOptionsPress,


    // Component renderers
    renderReactionsModal,
    renderImageViewer,
    renderActionSheet: postActions.renderActionSheet,
    renderCollectionsModal: postActions.renderCollectionsModal,
    renderDeleteConfirmationModal: postActions.renderDeleteConfirmationModal,
    renderRemoveConfirmationModal: postActions.renderRemoveConfirmationModal,
  };
};
