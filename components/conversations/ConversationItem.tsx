import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useTheme } from "@/lib/Theme";
import NameContainer from "@/components/ui/NameContainer";
import { ConversationData } from "@/types/conversations";
import { useTranslation } from "react-i18next";
import { formatTimeAgo } from "@/utils/formatTime";
import { useRouter } from "expo-router";
import { Id } from "@/convex/_generated/dataModel";

export type GroupData = {
  groupId: Id<"groups">;
  groupPhoto: string | null;
  groupTitle: string;
  lastMessage: {
    content: string;
    type: string;
    senderName: string;
    createdAt: number;
  } | null;
  unreadCount: number;
  isGroupAdmin: boolean;
};

interface ConversationItemProps {
  conversation?: ConversationData;
  group?: GroupData;
  onLongPress?: (item: ConversationData) => void;
  onGroupLongPress?: (item: GroupData) => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  group,
  onLongPress,
  onGroupLongPress,
}) => {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();

  const isGroup = !!group;
  const item = group || conversation!;

  const handlePress = () => {
    if (isGroup) {
      router.push(`/screens/group/${group.groupId}`);
    } else {
      router.push(`/screens/conversation/${conversation!.conversationId}`);
    }
  };

  const handleLongPress = () => {
    if (isGroup && onGroupLongPress && group) {
      onGroupLongPress(group);
    } else if (!isGroup && onLongPress && conversation) {
      onLongPress(conversation);
    }
  };

  const getMessagePreview = () => {
    if (isGroup) {
      if (!group?.lastMessage) return "...";
      const { lastMessage } = group;
      const prefix = `${lastMessage.senderName}: `;

      if (lastMessage.type === "image" || lastMessage.type === "gif") {
        return (
          <>
            <Text style={{ color: theme.colors.primary }}>{prefix}</Text>
            <Ionicons name={lastMessage.type === "image" ? "image" : "film-outline"} size={14} color={theme.colors.textSecondary} />
          </>
        );
      }

      return (
        <>
          <Text style={{ color: theme.colors.primary, fontSize: 16, fontWeight: "600" }}>{prefix}</Text>
          <Text>{lastMessage.content || ""}</Text>
        </>
      );
    }

    if (!conversation?.lastMessage) return "...";

    const { lastMessage } = conversation;
    const prefix = lastMessage.isOwner ? "You: " : `${conversation.otherUser.name}: `;

    if (lastMessage.type === "image" || lastMessage.type === "gif") {
      return (
        <>
          <Text style={{ color: theme.colors.primary }}>{prefix}</Text>
          <Ionicons name={lastMessage.type === "image" ? "image" : "film-outline"} size={14} color={theme.colors.textSecondary} />
        </>
      );
    }

    if (lastMessage.replyParentId) {
      return (
        <>
          <Text style={{ color: theme.colors.primary }}>{prefix}</Text>
          <Text>↩️ {lastMessage.content || ""}</Text>
        </>
      );
    }

    return (
      <>
        <Text style={{ color: theme.colors.primary, fontSize: 16, fontWeight: "600" }}>{prefix}</Text>
        <Text>{lastMessage.content || ""}</Text>
      </>
    );
  };

  const hasUnread = isGroup ? group.unreadCount > 0 : conversation!.hasUnreadMessages;
  const photo = isGroup ? group.groupPhoto : conversation!.otherUser.profilePicture;
  const name = isGroup ? group.groupTitle : conversation!.otherUser.name;
  const isPremium = isGroup ? false : conversation!.otherUser.isPremiumUser;
  const country = isGroup ? null : conversation!.otherUser.country;
  const timestamp = isGroup
    ? (group.lastMessage ? formatTimeAgo(group.lastMessage.createdAt, t) : "")
    : conversation!.lastMessageTime;

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: 8,
      marginBottom: 4,
      borderRadius: theme.borderRadius.lg,
    },
    pressable: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    profileSection: {
      position: "relative",
      marginRight: 12,
    },
    profileImage: {
      width: 56,
      height: 56,
      borderRadius: 28,
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
    },
    countryEmoji: {
      position: "absolute",
      bottom: -2,
      left: -2,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: theme.colors.background,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: theme.colors.surface,
    },
    countryText: {
      fontSize: 12,
    },
    contentSection: {
      flex: 1,
      justifyContent: "center"
    },
    messagePreview: {
      fontSize: 14,
      color: hasUnread ? theme.colors.text : theme.colors.textSecondary,
      fontWeight: hasUnread ? "500" : "400",
      flex: 1,
      marginRight: 8,
    },
    timestamp: {
      fontSize: 12,
      color: theme.colors.textMuted,
      fontWeight: "500",
    },
    rightSection: {
      alignItems: "flex-end",
      justifyContent: "space-between",
      height: 52,
      paddingVertical: 4,
    },
    unreadIndicator: {
      marginBottom: 4,
      width: 10,
      height: 10,
      borderRadius: 6,
      backgroundColor: theme.colors.notification,
    },
    unreadBadge: {
      backgroundColor: theme.colors.notification,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 6,
    },
    unreadText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "600",
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.pressable}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
        delayLongPress={500}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image
            source={{ uri: photo || undefined }}
            style={styles.profileImage}
            contentFit="cover"

          />
          {country && (
            <View style={styles.countryEmoji}>
              <Text style={styles.countryText}>{country}</Text>
            </View>
          )}
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <NameContainer
            name={name}
            isPremiumUser={isPremium}
            size={18}
            style={{ margin: 0, paddingTop: 3, justifyContent: "flex-start" }}
          />
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Text
              style={styles.messagePreview}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {getMessagePreview()}
            </Text>
          </View>
        </View>

        {/* Right Section - Vertical Stack */}
        <View style={styles.rightSection}>
          <Text style={styles.timestamp}>{timestamp}</Text>
          {isGroup ? (
            group.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{group.unreadCount}</Text>
              </View>
            )
          ) : (
            conversation!.hasUnreadMessages ? (
              <View style={styles.unreadIndicator} />
            ) : (
              !conversation!.lastMessage?.isOwner && (
                <Ionicons name="arrow-redo" size={14} color={theme.colors.primary} />
              )
            )
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};
