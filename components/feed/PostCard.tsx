import { memo, useCallback, useState, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { Id } from "@/convex/_generated/dataModel";
import { AddReactionModal } from "./AddReactionModal";
import { PostMeta } from "./PostMeta";
import { PostAttachments } from "./PostAttachments";
import NameContainer from "@/components/ui/NameContainer";
import { PostTypes } from "@/types";

// Props for Post Card
interface PostCardProps {
  post: PostTypes;
  onReaction: (postId: Id<"posts">, emoji: string) => void;
  onComment: (postId: Id<"posts">) => void;
  onImagePress: (images: string[], index: number) => void;
  onReadMore: (postId: Id<"posts">) => void;
  onReactionsPress: (postId: Id<"posts">) => void;
  onUserPress?: (userId: Id<"users">, isOwner: boolean) => void;
  onOptionsPress?: (post: PostTypes) => void;
  showFullText?: boolean;
}

const PostCardComponent: React.FC<PostCardProps> = ({
  post,
  onReaction,
  onComment,
  onImagePress,
  onReadMore,
  onReactionsPress,
  onUserPress,
  onOptionsPress,
  showFullText = false
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [showAddReactionModal, setShowAddReactionModal] = useState(false);

  const handleReaction = useCallback((postId: Id<"posts">, emoji: string) => {
    onReaction(postId, emoji);
  }, [onReaction]);

  const handleReactionsPress = useCallback(() => {
    onReactionsPress(post.postId);
  }, [post.postId, onReactionsPress]);

  const handleReactionButtonPress = useCallback(() => {
    setShowAddReactionModal(true);
  }, []);

  const handleCommentPress = useCallback(() => {
    onComment(post.postId);
  }, [post.postId, onComment]);

  const closeAddReactionModal = useCallback(() => {
    setShowAddReactionModal(false);
  }, []);

  const handleUserPress = useCallback(() => {
    onUserPress?.(post.postAuthor.userId, post.isOwner);
  }, [post.postAuthor.userId, post.isOwner, onUserPress]);

  const handleOptionsPress = useCallback(() => {
    onOptionsPress?.(post);
  }, [post, onOptionsPress]);

  const handleReadMore = useCallback(() => {
    onReadMore(post.postId);
  }, [post.postId, onReadMore]);

  const handleImagePress = useCallback((index: number = 0) => {
    if (post.postAttachments && post.postAttachments.length > 0) {
      const imageUrls = post.postAttachments.map(a => a.url);
      onImagePress?.(imageUrls, index);
    }
  }, [post.postAttachments, onImagePress]);

  const styles = useMemo(() => StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    userSection: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1
    },
    profilePicture: {
      width: 50,
      height: 50,
      borderRadius: theme.borderRadius.full,
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
      marginRight: 12,
    },
    timeContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    timeText: {
      fontSize: 12,
      color: theme.colors.textMuted,
    },
    rightSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    pinnedBadge: {
      backgroundColor: theme.colors.primary + "20",
      padding: 8,
      borderRadius: theme.borderRadius.full,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    pinnedText: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: "600",
    },
    moreButton: {
      padding: 8,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.full
    },
    content: {
      paddingHorizontal: 16,
      marginVertical: 16
    },
    contentText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 20,
    },
  }), [theme]);

  return (
    <View >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userSection}
          onPress={handleUserPress}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: post.postAuthor.profilePicture }}
            style={styles.profilePicture}
            contentFit="cover"
            priority="normal"
            cachePolicy={"memory"}
          />
          <View>
            <NameContainer
              name={post.postAuthor.name}
              isPremiumUser={post.postAuthor.isPremiumUser}
              size={18}
              style={{ margin: 0, justifyContent: "flex-start" }}
            />
            <View style={styles.timeContainer}>
              <Ionicons
                name="time"
                size={12}
                color={theme.colors.success}
              />
              <Text style={styles.timeText}>
                {post.createdAt}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.rightSection}>
          {post.isPinned && (
            <View style={styles.pinnedBadge}>
              <Entypo name="pin" size={16} color={theme.colors.primary} />
              <Text style={styles.pinnedText}>{t("Pinned")}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.moreButton}
            onPress={handleOptionsPress}
            activeOpacity={0.7}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={20}
              color={theme.colors.textMuted}
            />
          </TouchableOpacity>
        </View>

      </View>

      {/* Content */}
      <TouchableOpacity activeOpacity={0.8} onPress={handleReadMore} style={styles.content}>
        <Text style={styles.contentText} numberOfLines={showFullText ? undefined : 3} ellipsizeMode="tail" selectable>
          {post.content}
        </Text>
      </TouchableOpacity>
      {/* Attachments */}
      {post.postAttachments && post.postAttachments.length > 0 && (
        <PostAttachments attachments={post.postAttachments} onAttachmentPress={handleImagePress} />
      )}
      {/* Post Meta and Actions */}
      <PostMeta
        postId={post.postId}
        reactionsCount={post.reactionsCount}
        commentsCount={post.commentsCount}
        hasReacted={post.hasReacted}
        userReaction={post.userReaction}
        onReactionButtonPress={handleReactionButtonPress}
        onReactionsPress={handleReactionsPress}
        onCommentPress={handleCommentPress}
      />

      {/* Add Reaction Modal */}
      <AddReactionModal
        visible={showAddReactionModal}
        postId={post.postId}
        currentReaction={post.userReaction}
        onClose={closeAddReactionModal}
        onReaction={handleReaction}
      />
    </View>
  );
};

export const PostCard = memo(PostCardComponent);