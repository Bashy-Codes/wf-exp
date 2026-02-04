import { useState, useCallback } from "react";
import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { type CommentTypes } from "@/types/feed";

export const useComments = (postId: Id<"posts">) => {
  // Comment state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<Id<"comments"> | null>(null);
  const [replyToComment, setReplyToComment] = useState<CommentTypes | null>(null);

  // Convex mutations for comments
  const commentPostMutation = useMutation(api.feed.interactions.commentPost);
  const deleteCommentMutation = useMutation(api.feed.interactions.deleteComment);

  // Paginated query for comments
  const {
    results: comments,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.feed.interactions.getComments,
    { postId },
    { initialNumItems: 10 }
  );
  const isLoadingComments = status === "LoadingFirstPage";

  // Comment handlers
  const handleLoadMoreComments = useCallback(() => {
    if (status === "CanLoadMore") {
      loadMore(10);
    }
  }, [status, loadMore]);

  const handleDeleteComment = useCallback((commentId: Id<"comments">) => {
    setCommentToDelete(commentId);
    setShowDeleteModal(true);
  }, []);

  const handleReplyToComment = useCallback((comment: CommentTypes) => {
    setReplyToComment(comment);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyToComment(null);
  }, []);

  const handleSubmitComment = useCallback(async (text: string, gifUrl?: string) => {
    try {
      await commentPostMutation({
        postId,
        content: text,
        replyParentId: replyToComment?.commentId,
        attachment: gifUrl,
      });
      setReplyToComment(null);
    } catch (error) {
      console.error("Failed to submit comment:", error);
    }
  }, [commentPostMutation, postId, replyToComment]);

  const handleConfirmDelete = useCallback(async () => {
    if (commentToDelete) {
      try {
        await deleteCommentMutation({ commentId: commentToDelete });
        setCommentToDelete(null);
        setShowDeleteModal(false);
      } catch (error) {
        console.error("Failed to delete comment:", error);
      }
    }
  }, [commentToDelete, deleteCommentMutation]);

  const handleCloseDeleteModal = useCallback(() => {
    setShowDeleteModal(false);
    setCommentToDelete(null);
  }, []);

  return {
    // State
    comments: comments || [],
    isLoadingComments,
    replyToComment,
    showDeleteModal,

    // Handlers
    handleLoadMoreComments,
    handleDeleteComment,
    handleReplyToComment,
    handleCancelReply,
    handleSubmitComment,
    handleConfirmDelete,
    handleCloseDeleteModal,
  };
};
