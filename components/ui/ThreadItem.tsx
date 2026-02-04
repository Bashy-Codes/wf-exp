import { memo, FC, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";
import { formatTimeAgo } from "@/utils/formatTime";
import NameContainer from "@/components/ui/NameContainer";
import { useTranslation } from "react-i18next";
import { Id } from "@/convex/_generated/dataModel";
import { ImageViewer } from "../common/ImageViewer";

interface Author {
  name: string;
  profilePicture: string;
  isPremiumUser: boolean;
}

export interface ThreadItemProps {
  id: Id<"comments"> | Id<"discussionThreads">;
  content: string;
  attachment?: string;
  author: Author;
  createdAt: number;
  isOwner: boolean;
  repliesCount?: number;
  isParent?: boolean;
  onDelete: (id: Id<"comments"> | Id<"discussionThreads">) => void;
  onReply: () => void;
  onViewReplies?: (id: string) => void;
}

export const ThreadItem: FC<ThreadItemProps> = memo(({
  id,
  content,
  attachment,
  author,
  createdAt,
  isOwner,
  repliesCount = 0,
  isParent = false,
  onDelete,
  onReply,
  onViewReplies
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [imageViewerVisible, setImageViwerVisible] = useState(false)

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      marginHorizontal: 12,
      marginVertical: 6,
      borderRadius: theme.borderRadius.xl,
      padding: 16,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      borderLeftWidth: isParent ? 3 : 0,
      borderLeftColor: theme.colors.primary,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    profileImage: {
      width: 45,
      height: 45,
      borderRadius: theme.borderRadius.full,
      marginRight: 12,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    userInfo: {
      flex: 1,
    },
    timeContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 2,
    },
    timeText: {
      fontSize: 12,
      color: theme.colors.textMuted,
    },
    contentText: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.colors.text,
      marginBottom: attachment ? 8 : 12,
    },
    attachmentContainer: {
      padding: 10,
      backgroundColor: theme.colors.surface,
      marginBottom: 12,
      borderRadius: theme.borderRadius.md,
      overflow: "hidden",
    },
    attachment: {
      width: "100%",
      height: 200,
      borderRadius: theme.borderRadius.md,
    },
    deleteButton: {
      padding: 6,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.error + "15",
    },
    actionsContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.background,
    },
    actionText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontWeight: "500",
    },
    repliesCount: {
      fontSize: 13,
      color: theme.colors.primary,
      fontWeight: "600",
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: author.profilePicture }}
          style={styles.profileImage}
          contentFit="cover"
          priority="normal"
          cachePolicy="memory"
        />
        <View style={styles.userInfo}>
          <NameContainer
            name={author.name}
            isPremiumUser={author.isPremiumUser}
            size={16}
            style={{ margin: 0, justifyContent: "flex-start" }}
          />
          <View style={styles.timeContainer}>
            <Ionicons name="time" size={12} color={theme.colors.success} />
            <Text style={styles.timeText}>{formatTimeAgo(createdAt, t)}</Text>
          </View>
        </View>
        {isOwner && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(id)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash" size={18} color={theme.colors.error} />
          </TouchableOpacity>
        )}
      </View>

      {content && (
        <Text style={styles.contentText} selectable={true}>
          {content}
        </Text>
      )}

      {attachment && (
        <TouchableOpacity style={styles.attachmentContainer} onPress={() => setImageViwerVisible(true)} activeOpacity={0.8}>
          <Image
            source={{ uri: attachment }}
            style={styles.attachment}
            contentFit="cover"
            priority="normal"
            cachePolicy="memory-disk"
          />
        </TouchableOpacity>
      )}

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onReply}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.actionText}>{t("threads.reply")}</Text>
        </TouchableOpacity>

        {repliesCount > 0 && onViewReplies && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onViewReplies(id)}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubbles" size={16} color={theme.colors.primary} />
            <Text style={styles.repliesCount}>
              {repliesCount}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {attachment && (
        <ImageViewer
          images={[{ uri: attachment }]}
          imageIndex={0}
          visible={imageViewerVisible}
          onRequestClose={() => setImageViwerVisible(false)}
        />
      )}
    </View>
  );
});