import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@/lib/Theme";
import { Id } from "@/convex/_generated/dataModel";
import { useTranslation } from "react-i18next";
import { FlashList } from "@shopify/flash-list";
import { useQuery, useMutation, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Toast from "react-native-toast-message";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { ScreenHeader } from "@/components/ScreenHeader";
import { ScreenLoading } from "@/components/ScreenLoading";
import { KeyboardHandler } from "@/components/KeyboardHandler";
import { ThreadInput } from "@/components/ui/ThreadInput";
import { ThreadItem } from "@/components/ui/ThreadItem";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { CommentTypes } from "@/types/feed";
import NameContainer from "@/components/ui/NameContainer";
import { formatTimeAgo } from "@/utils/formatTime";
import Divider from "@/components/ui/Divider";

export default function ThreadScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const commentId = id as Id<"comments">;

  const [replyToComment, setReplyToComment] = useState<CommentTypes | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<Id<"comments"> | null>(null);

  const parentComment = useQuery(api.feed.interactions.getComment, { commentId });
  const {
    results: replies,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.feed.interactions.getCommentReplies,
    { commentId },
    { initialNumItems: 20 }
  );

  const createComment = useMutation(api.feed.interactions.commentPost);
  const deleteCommentMutation = useMutation(api.feed.interactions.deleteComment);

  const handleSubmitReply = useCallback(async (text: string, gifUrl?: string) => {
    if (!parentComment) return;

    try {
      await createComment({
        postId: parentComment.postId,
        content: text,
        replyParentId: replyToComment?.commentId || commentId,
        attachment: gifUrl,
      });
      setReplyToComment(null);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t("errors.commentFailed"),
      });
    }
  }, [parentComment, replyToComment, commentId, createComment, t]);

  const handleReplyToComment = useCallback((comment: CommentTypes) => {
    setReplyToComment(comment);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyToComment(null);
  }, []);

  const handleDeleteComment = useCallback((id: Id<"comments">) => {
    setCommentToDelete(id);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!commentToDelete) return;

    try {
      await deleteCommentMutation({ commentId: commentToDelete });
      setCommentToDelete(null);

      if (commentToDelete === commentId) {
        router.back();
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t("errors.deleteFailed"),
      });
    }
  }, [commentToDelete, commentId, deleteCommentMutation, router, t]);

  const handleLoadMore = useCallback(() => {
    if (status === "CanLoadMore") {
      loadMore(20);
    }
  }, [status, loadMore]);

  const renderReplyItem = useCallback(
    ({ item }: { item: CommentTypes }) => (
      <ThreadItem
        id={item.commentId}
        content={item.content}
        attachment={item.attachment}
        author={{
          name: item.commentAuthor.name,
          profilePicture: item.commentAuthor.profilePicture,
          isPremiumUser: item.commentAuthor.isPremiumUser,
        }}
        createdAt={item.createdAt}
        isOwner={item.isOwner}
        repliesCount={item.repliesCount}
        onDelete={handleDeleteComment}
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

  const renderListHeader = () =>
    parentComment ? (
      <View>
        <View style={styles.parentComment}>
          <View style={styles.parentHeader}>
            <Image
              source={{ uri: parentComment.commentAuthor.profilePicture }}
              style={styles.parentProfileImage}
              contentFit="cover"
              priority="high"
              cachePolicy="memory"
            />
            <View style={styles.parentUserInfo}>
              <NameContainer
                name={parentComment.commentAuthor.name}
                isPremiumUser={parentComment.commentAuthor.isPremiumUser}
                size={17}
                style={{ margin: 0, justifyContent: "flex-start" }}
              />
              <View style={styles.timeContainer}>
                <Ionicons name="time" size={13} color={theme.colors.success} />
                <Text style={styles.timeText}>{formatTimeAgo(parentComment.createdAt, t)}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.parentContent} selectable>
            {parentComment.content}
          </Text>
          {parentComment.attachment && (
            <Image
              source={{ uri: parentComment.attachment }}
              style={{ width: "100%", height: 200, borderRadius: 12, marginTop: 8 }}
              contentFit="cover"
              priority="normal"
              cachePolicy="memory-disk"
            />
          )}
        </View>
        <Divider text={parentComment.repliesCount} />
      </View>
    ) : null;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        content: {
          flex: 1,
        },
        repliesContainer: {
          flex: 1,
        },
        loadingContainer: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 40,
        },
        parentComment: {
          backgroundColor: theme.colors.surface,
          padding: 16,
          margin: 6,
          borderRadius: 20,
          borderWidth: 2,
          borderColor: theme.colors.primary + "30",
        },
        parentHeader: {
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 14,
        },
        parentProfileImage: {
          width: 52,
          height: 52,
          borderRadius: theme.borderRadius.full,
          marginRight: 14,
          borderWidth: 2,
          borderColor: theme.colors.primary,
        },
        parentUserInfo: {
          flex: 1,
        },
        timeContainer: {
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          marginTop: 2,
        },
        timeText: {
          fontSize: 13,
          color: theme.colors.textMuted,
        },
        parentContent: {
          fontSize: 15,
          lineHeight: 22,
          color: theme.colors.text,
          marginBottom: 12,
        }
      }),
    [theme]
  );

  if (!parentComment) {
    return <ScreenLoading />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <ScreenHeader title={t("screenTitles.thread")} />
      <KeyboardHandler enabled={true} style={styles.content}>
        <View style={styles.repliesContainer}>
          {status === "LoadingFirstPage" ? (
            renderLoader()
          ) : (
            <FlashList
              data={replies}
              keyExtractor={(item) => item.commentId}
              renderItem={renderReplyItem}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={renderListHeader}
              ListEmptyComponent={<EmptyState halfScreen />}
            />
          )}
        </View>
        <ThreadInput
          onSubmit={handleSubmitReply}
          replyPreview={
            replyToComment
              ? {
                authorName: replyToComment.commentAuthor.name,
                content: replyToComment.content,
              }
              : null
          }
          onCancelReply={handleCancelReply}
        />
      </KeyboardHandler>

      <ConfirmationModal
        visible={!!commentToDelete}
        icon="trash-outline"
        description={t("confirmation.deleteComment")}
        onConfirm={handleConfirmDelete}
        onCancel={() => setCommentToDelete(null)}
      />
    </SafeAreaView>
  );
}
