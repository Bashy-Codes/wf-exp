import React, { memo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";
import { Id } from "@/convex/_generated/dataModel";

interface PostMetaProps {
  postId: Id<"posts">;
  reactionsCount: number;
  commentsCount: number;
  hasReacted: boolean;
  userReaction?: string;
  onReactionButtonPress: () => void;
  onReactionsPress: () => void;
  onCommentPress: () => void;
}

// Internal Reaction Button Component
const ReactionButton = memo<{
  hasReacted: boolean;
  userReaction?: string;
  onPress: () => void;
}>(({ hasReacted, userReaction, onPress }) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    reactionButton: {
      padding: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    userReactionEmoji: {
      fontSize: 22,
    },
  });

  return (
    <TouchableOpacity
      style={styles.reactionButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {hasReacted && userReaction ? (
        <Text style={styles.userReactionEmoji}>{userReaction}</Text>
      ) : (
        <MaterialIcons
          name="add-reaction"
          size={24}
          color={theme.colors.textSecondary}
        />
      )}
    </TouchableOpacity>
  );
});

// Internal Reactions Count Component
const ReactionsCount = memo<{
  count: number;
  onPress: () => void;
}>(({ count, onPress }) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    reactionButton: {
      backgroundColor: theme.colors.surface,
      paddingVertical: 4,
      paddingHorizontal: 18,
      borderRadius: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    countText: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.text,
      marginLeft: 4,
    },
  });

  if (count === 0) {
    return null;
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.reactionButton}>
      <Text style={styles.countText}>
        {count >= 100 ? "99+" : count.toString()}
      </Text>
    </TouchableOpacity>
  );
});

// Internal Comment Button Component
const CommentButton = memo<{
  commentsCount: number;
  onPress: () => void;
}>(({ commentsCount, onPress }) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    commentButton: {
      flexDirection: "row",
      alignItems: "center",
    },
    commentsCount: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginRight: 6,
      fontWeight: "500",
    },
  });

  return (
    <TouchableOpacity
      style={styles.commentButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.commentsCount}>{commentsCount}</Text>
      <MaterialCommunityIcons
        name="message-reply-text-outline"
        size={22}
        color={theme.colors.textSecondary}
      />
    </TouchableOpacity>
  );
});

// Main PostMeta Component
export const PostMeta = memo<PostMetaProps>(({
  reactionsCount,
  commentsCount,
  hasReacted,
  userReaction,
  onReactionButtonPress,
  onReactionsPress,
  onCommentPress,
}) => {
  const handleReactionsPress = useCallback(() => {
    onReactionsPress();
  }, [onReactionsPress]);

  const styles = StyleSheet.create({
    actions: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingBottom: 16,
      paddingTop: 8,
    },
    reactionsSection: {
      flexDirection: "row",
      alignItems: "center",
    },
  });

  return (
    <View style={styles.actions}>
      {/* Reactions Section - Left */}
      <View style={styles.reactionsSection}>
        <ReactionButton
          hasReacted={hasReacted}
          userReaction={userReaction}
          onPress={onReactionButtonPress}
        />
        <ReactionsCount
          count={reactionsCount}
          onPress={handleReactionsPress}
        />
      </View>

      {/* Comments Section - Right */}
      <CommentButton
        commentsCount={commentsCount}
        onPress={onCommentPress}
      />
    </View>
  );
});
