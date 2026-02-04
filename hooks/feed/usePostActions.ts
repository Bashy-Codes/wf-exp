import { useCallback, useRef, useState } from "react";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { useTheme } from "@/lib/Theme";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PostTypes, CollectionPostTypes } from "@/types/feed";
import {
  ActionSheetOption,
  ActionModalRef,
} from "@/components/common/ActionSheet";
import { CollectionsModalRef } from "@/components/feed/CollectionsModal";

/**
 * Helper hook for post actions
 * Provides clean handlers without managing state - state is owned by components
 */
export const usePostActions = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  // State for modals and sheets
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostTypes | null>(null);
  const [selectedCollectionPost, setSelectedCollectionPost] =
    useState<CollectionPostTypes | null>(null);

  // Refs for modals
  const actionModalRef = useRef<ActionModalRef>(null);
  const collectionsModalRef = useRef<CollectionsModalRef>(null);

  // Convex mutations
  const deletePost = useMutation(api.feed.posts.deletePost);
  const togglePinPost = useMutation(api.feed.interactions.togglePinPost);
  const addPostToCollection = useMutation(
    api.feed.collections.addPostToCollection,
  );
  const removePostFromCollection = useMutation(
    api.feed.collections.removePostFromCollection,
  );

  /**
   * Operations handlers
   * Takes parameters for post and collection post data
   */

  // Delete post handler
  const handleDeletePost = useCallback(
    async (postId: Id<"posts">, onSuccess?: () => void) => {
      try {
        await deletePost({ postId });

        Toast.show({
          type: "success",
          text1: t("successToasts.postDeleted")
        });

        // Call optional callback for post deletion
        onSuccess?.();
      } catch (error) {
        console.error("Failed to delete post:", error);
        Toast.show({
          type: "error",
          text1: t("errorToasts.genericError")
        });
      }
    },
    [deletePost, t],
  );

  // Add to collection handler
  const handleAddToCollection = useCallback(
    async (
      postId: Id<"posts">,
      collectionId: Id<"collections">,
      onSuccess?: () => void,
    ) => {
      try {
        await addPostToCollection({ collectionId, postId });

        Toast.show({
          type: "success",
          text1: t("successToasts.postAddedToCollection")
        });

        onSuccess?.();
      } catch (error) {
        console.error("Failed to add to collection:", error);
        Toast.show({
          type: "error",
          text1: t("errorToasts.postAlreadyInCollection")
        });
      }
    },
    [addPostToCollection, t],
  );

  // Remove from collection handler
  const handleRemoveFromCollection = useCallback(
    async (
      postId: Id<"posts">,
      onSuccess?: () => void,
    ) => {
      try {
        await removePostFromCollection({ postId });

        Toast.show({
          type: "success",
          text1: t("successToasts.postRemovedFromCollection")
        });

        onSuccess?.();
      } catch (error) {
        console.error("Failed to remove from collection:", error);
        Toast.show({
          type: "error",
          text1: t("errorToasts.genericError")
        });
      }
    },
    [removePostFromCollection, t],
  );

  // Report post handler
  const handleReportPress = useCallback(
    (postId: Id<"posts">, content: string, authorName: string) => {
      router.push({
        pathname: "/screens/report",
        params: {
          type: "post",
          targetId: postId,
          targetName: authorName,
        },
      });
    },
    [],
  );

  // Toggle pin handler
  const handleTogglePin = useCallback(
    async (postId: Id<"posts">, isPinned: boolean) => {
      try {
        await togglePinPost({ postId });
        Toast.show({
          type: "success",
          text1: isPinned ? t("successToasts.postUnpinned") : t("successToasts.postPinned")
        });
      } catch (error) {
        console.error("Failed to toggle pin:", error);
        Toast.show({
          type: "error",
          text1: t("errorToasts.genericError")
        });
      }
    },
    [togglePinPost, t],
  );

  // Post options handler
  const handlePostOptionsPress = useCallback((post: PostTypes) => {
    setSelectedPost(post);
    actionModalRef.current?.present();
  }, []);

  // Collection post options handler - for posts in collections
  const handleCollectionPostOptionsPress = useCallback(
    (collectionPost: CollectionPostTypes) => {
      setSelectedCollectionPost(collectionPost);
      actionModalRef.current?.present();
    },
    [],
  );

  // Action handlers for post options
  const onDeletePress = useCallback(() => {
    actionModalRef.current?.dismiss();
    setShowDeleteModal(true);
  }, []);

  const onAddToCollectionPress = useCallback(() => {
    actionModalRef.current?.dismiss();
    collectionsModalRef.current?.present();
  }, []);

  const onRemoveFromCollectionPress = useCallback(() => {
    actionModalRef.current?.dismiss();
    setShowRemoveModal(true);
  }, []);

  const onReportPress = useCallback(() => {
    actionModalRef.current?.dismiss();

    if (selectedPost) {
      handleReportPress(
        selectedPost.postId,
        selectedPost.content,
        selectedPost.postAuthor.name,
      );
    } else if (selectedCollectionPost) {
      handleReportPress(
        selectedCollectionPost.post.postId,
        selectedCollectionPost.post.content,
        selectedCollectionPost.post.postAuthor.name,
      );
    }
  }, [selectedPost, selectedCollectionPost, handleReportPress]);

  const onTogglePinPress = useCallback(() => {
    actionModalRef.current?.dismiss();
    if (selectedPost) {
      handleTogglePin(selectedPost.postId, selectedPost.isPinned);
    } else if (selectedCollectionPost) {
      handleTogglePin(selectedCollectionPost.post.postId, selectedCollectionPost.post.isPinned);
    }
  }, [selectedPost, selectedCollectionPost, handleTogglePin]);

  // Modal handlers
  const closeDeleteModal = useCallback(() => {
    setShowDeleteModal(false);
    setSelectedPost(null);
    setSelectedCollectionPost(null);
  }, []);

  const closeRemoveModal = useCallback(() => {
    setShowRemoveModal(false);
    setSelectedPost(null);
    setSelectedCollectionPost(null);
  }, []);

  const confirmDeletePost = useCallback(async () => {
    if (selectedPost) {
      await handleDeletePost(selectedPost.postId);
      closeDeleteModal();
    }
  }, [selectedPost, handleDeletePost, closeDeleteModal]);

  const confirmRemoveFromCollection = useCallback(async () => {
    if (selectedCollectionPost) {
      await handleRemoveFromCollection(
        selectedCollectionPost.post.postId
      );
      closeRemoveModal();
    }
  }, [selectedCollectionPost, handleRemoveFromCollection, closeRemoveModal]);

  const handleCollectionSelect = useCallback(
    async (collectionId: Id<"collections">) => {
      if (selectedPost) {
        await handleAddToCollection(selectedPost.postId, collectionId);
        collectionsModalRef.current?.dismiss();
        setSelectedPost(null);
      }
    },
    [selectedPost, handleAddToCollection],
  );

  // Generate Action Modal options based on selected post/collection post
  const getActionSheetOptions = useCallback((): ActionSheetOption[] => {
    const options: ActionSheetOption[] = [];

    if (selectedPost) {
      // Regular post options
      if (selectedPost.isOwner) {
        // Own post options
        options.push({
          id: "togglePin",
          title: selectedPost.isPinned ? "Unpin Post" : "Pin Post",
          icon: "pin-outline",
          color: theme.colors.primary,
          onPress: onTogglePinPress,
        });
        options.push({
          id: "addToCollection",
          title: t("actions.addToCollection"),
          icon: "bookmark-outline",
          color: theme.colors.info,
          onPress: onAddToCollectionPress,
        });
        options.push({
          id: "delete",
          title: t("actions.deletePost"),
          icon: "trash-outline",
          color: theme.colors.error,
          onPress: onDeletePress,
        });
      } else {
        options.push({
          id: "report",
          title: t("actions.reportPost"),
          icon: "flag-outline",
          color: theme.colors.error,
          onPress: onReportPress,
        });
      }
    } else if (selectedCollectionPost) {
      // Collection post options
      if (selectedCollectionPost.post.isOwner) {
        // Own post options in collection
        options.push({
          id: "togglePin",
          title: selectedCollectionPost.post.isPinned ? t("actions.unpinPost") : t("actions.pinPost"),
          icon: "pin-outline",
          color: theme.colors.primary,
          onPress: onTogglePinPress,
        });
        options.push({
          id: "removeFromCollection",
          title: t("actions.removeFromCollection"),
          icon: "remove-circle-outline",
          color: theme.colors.error,
          onPress: onRemoveFromCollectionPress,
        });
        options.push({
          id: "delete",
          title: t("actions.deletePost"),
          icon: "trash-outline",
          color: theme.colors.error,
          onPress: onDeletePress,
        });
      } else {
        // Other user's post in collection
        options.push({
          id: "report",
          title: t("actions.reportPost"),
          icon: "flag-outline",
          color: theme.colors.error,
          onPress: onReportPress,
        });
      }
    }

    return options;
  }, [
    selectedPost,
    selectedCollectionPost,
    t,
    theme.colors,
    onDeletePress,
    onAddToCollectionPress,
    onRemoveFromCollectionPress,
    onReportPress,
  ]);

  // Navigation handlers
  const handleReadMore = useCallback((postId: Id<"posts">) => {
    router.push(`/screens/post/${postId}`);
  }, []);

  const handleUserPress = useCallback(
    (userId: Id<"users">, isOwner: boolean) => {
      if (isOwner) {
        // Do nothing for own posts
        return;
      } else {
        // Navigate to user details for other users
        router.push(`/screens/user-profile/${userId}`);
      }
    },
    [],
  );

  // Component renderers
  const renderActionSheet = useCallback(() => {
    const options = getActionSheetOptions();
    if (options.length === 0) return null;

    return {
      ref: actionModalRef,
      options,
    };
  }, [getActionSheetOptions]);

  const renderCollectionsModal = useCallback(() => {
    return {
      ref: collectionsModalRef,
      onCollectionSelect: handleCollectionSelect,
    };
  }, [handleCollectionSelect]);

  const renderDeleteConfirmationModal = useCallback(() => {
    return {
      visible: showDeleteModal,
      icon: "trash-outline",
      iconColor: theme.colors.error,
      description: t("confirmation.deletePost"),
      confirmButtonColor: theme.colors.error,
      onConfirm: confirmDeletePost,
      onCancel: closeDeleteModal,
    };
  }, [
    showDeleteModal,
    t,
    theme.colors.error,
    confirmDeletePost,
    closeDeleteModal,
  ]);

  const renderRemoveConfirmationModal = useCallback(() => {
    return {
      visible: showRemoveModal,
      icon: "remove-circle-outline",
      iconColor: theme.colors.error,
      description: t("confirmation.removeFromCollection"),
      confirmButtonColor: theme.colors.error,
      onConfirm: confirmRemoveFromCollection,
      onCancel: closeRemoveModal,
    };
  }, [
    showRemoveModal,
    t,
    theme.colors.error,
    confirmRemoveFromCollection,
    closeRemoveModal,
  ]);

  return {
    // Post action handlers
    handleReadMore,
    handleUserPress,
    handleDeletePost,
    handleAddToCollection,
    handleRemoveFromCollection,
    handleReportPress,

    // Post options handlers
    handlePostOptionsPress,
    handleCollectionPostOptionsPress,

    // Component renderers
    renderActionSheet,
    renderCollectionsModal,
    renderDeleteConfirmationModal,
    renderRemoveConfirmationModal,
  };
};
