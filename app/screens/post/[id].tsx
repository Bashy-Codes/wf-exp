import { useCallback, useMemo } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@/lib/Theme";
import { usePost } from "@/hooks/feed/usePost";
import { useComments } from "@/hooks/feed/useComments";
import { Id } from "@/convex/_generated/dataModel";
import { useTranslation } from "react-i18next";
import { FlashList } from "@shopify/flash-list";

// UI components
import { ScreenHeader } from "@/components/ScreenHeader";
import { ScreenLoading } from "@/components/ScreenLoading";
import { KeyboardHandler } from "@/components/KeyboardHandler";
import { ReactionsModal } from "@/components/feed/ReactionsModal";
import { ActionModal } from "@/components/common/ActionSheet";
import { CollectionsModal } from "@/components/feed/CollectionsModal";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { ImageViewer } from "@/components/common/ImageViewer";
import { PostCard } from "@/components/feed/PostCard";
import { ThreadInput } from "@/components/ui/ThreadInput";
import { ThreadItem } from "@/components/ui/ThreadItem";
import { EmptyState } from "@/components/EmptyState";
import { CommentTypes } from "@/types/feed";
import Divider from "@/components/ui/Divider";

export default function PostScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Convert string ID to Convex ID
  const postId = id as Id<"posts">;

  // Use the post hook
  const {
    post,
    loading,
    handleReaction,
    handleReactionsPress,
    handleImagePress,
    handleUserPress,
    handlePostOptionsPress,
    renderReactionsModal,
    renderImageViewer,
    renderActionSheet,
    renderCollectionsModal,
    renderDeleteConfirmationModal,
    renderRemoveConfirmationModal,
  } = usePost(postId);

  // Use the comments hook
  const {
    comments,
    isLoadingComments,
    replyToComment,
    showDeleteModal,
    handleLoadMoreComments,
    handleDeleteComment,
    handleReplyToComment,
    handleCancelReply,
    handleSubmitComment,
    handleConfirmDelete,
    handleCloseDeleteModal,
  } = useComments(postId);

  // Render comment item
  const renderCommentItem = useCallback(
    ({ item }: { item: CommentTypes }) => (
      <ThreadItem
        id={item.commentId}
        content={item.content}
        attachment={item.attachment}
        author={{
          name: item.commentAuthor.name,
          profilePicture: item.commentAuthor.profilePicture,
          isPremiumUser: item.commentAuthor.isPremiumUser
        }}
        createdAt={item.createdAt}
        isOwner={item.isOwner}
        repliesCount={item.repliesCount}
        onDelete={(id) => handleDeleteComment(id as Id<"comments">)}
        onReply={() => handleReplyToComment(item)}
        onViewReplies={(id) => router.push(`/screens/thread/${id}`)}
      />
    ),
    [handleDeleteComment, handleReplyToComment, router]
  );

  const renderLoader = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );

  const renderEmptyState = () => (
    <EmptyState halfScreen />
  );

  const renderListHeader = () => (
    post ? (
      <View>
        <PostCard
          post={post}
          onReaction={handleReaction}
          onComment={() => { }}
          onImagePress={handleImagePress}
          onReadMore={() => { }}
          onReactionsPress={handleReactionsPress}
          onUserPress={handleUserPress}
          onOptionsPress={undefined}
          showFullText={true}
        />
        <Divider text={post.commentsCount} />
      </View>
    ) : null
  );

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
    },
    commentsContainer: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 40,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 40,
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.textMuted,
      textAlign: "center",
    },
    listContent: {
      paddingVertical: 8,
    },
  }), [theme]);

  // Sheets and Modals
  const Reactions = (() => {
    const reactionsProps = renderReactionsModal();
    return reactionsProps ? (
      <ReactionsModal
        visible={reactionsProps.visible}
        postId={reactionsProps.postId}
        onClose={reactionsProps.onClose}
      />
    ) : null;
  })();

  const Actions = (() => {
    const actionProps = renderActionSheet();
    return actionProps ? (
      <ActionModal ref={actionProps.ref} options={actionProps.options} />
    ) : null;
  })();

  const Collections = (() => {
    const collectionsProps = renderCollectionsModal();
    return (
      <CollectionsModal
        ref={collectionsProps.ref}
        onCollectionSelect={collectionsProps.onCollectionSelect}
      />
    );
  })();

  // Show loading if either post or comments are loading initially
  if (loading || (isLoadingComments && !post)) {
    return <ScreenLoading />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <ScreenHeader
        title={t("screenTitles.post")}
      />
      <KeyboardHandler enabled={true} style={styles.content}>
        <View style={styles.commentsContainer}>
          {isLoadingComments ? renderLoader() :
            <FlashList
              data={comments}
              keyExtractor={(item) => item.commentId}
              renderItem={renderCommentItem}
              onEndReached={handleLoadMoreComments}
              onEndReachedThreshold={0.5}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={renderListHeader}
              ListEmptyComponent={renderEmptyState}

            />
          }
        </View>
        <ThreadInput
          onSubmit={handleSubmitComment}
          replyPreview={replyToComment ? {
            authorName: replyToComment.commentAuthor.name,
            content: replyToComment.content,
          } : null}
          onCancelReply={handleCancelReply}
        />
      </KeyboardHandler>

      {/* Sheets and Modals */}
      {Reactions}
      {Actions}
      {Collections}
      <ImageViewer {...renderImageViewer()} />
      <ConfirmationModal {...renderDeleteConfirmationModal()} />
      <ConfirmationModal {...renderRemoveConfirmationModal()} />

      {/* Comment Delete Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        icon="trash-outline"
        description={t("confirmation.deleteComment")}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteModal}
      />
    </SafeAreaView>
  );
}
