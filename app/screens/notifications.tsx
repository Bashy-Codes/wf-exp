import React, { useCallback, useEffect } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { formatTimeAgo } from "@/utils/formatTime";
import { useRouter } from "expo-router";
import { useNotifications } from "@/hooks/useNotifications";

import { ScreenLoading } from "@/components/ScreenLoading";
import { ScreenHeader } from "@/components/ScreenHeader";

export interface NotificationItem {
  notificationId: string;
  type:
  | "friend_request_sent"
  | "friend_request_accepted"
  | "friend_request_rejected"
  | "friend_removed"
  | "conversation_deleted"
  | "user_blocked"
  | "post_reaction"
  | "post_commented"
  | "comment_replied"
  | "gift_received"
  createdAt: number;
  sender: {
    userId: string;
    name: string;
    country: string;
  };
}


export default function NotificationsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const {
    notifications,
    status,
    loadMore,
    markNotificationsAsRead,
    deleteAllNotifications,

    // helper functions
    getLocalizedContent,
    getNotificationIcon,
    getNotificationColor,
    getNotificationBackgroundColor,
  } = useNotifications();

  useEffect(() => {
    const markAsRead = async () => {
      try {
        await markNotificationsAsRead();
      } catch (error) {
        console.error("Failed to mark notifications as read:", error);
      }
    };

    if (notifications && notifications.length > 0) {
      markAsRead();
    }
  }, [notifications, markNotificationsAsRead]);

  const handleDeleteAll = useCallback(async () => {
    try {
      await deleteAllNotifications();
    } catch (error) {
      console.error("Failed to delete notifications:", error);
    }
  }, [deleteAllNotifications]);

  const renderNotificationItem = useCallback(
    ({ item }: { item: NotificationItem }) => {
      const iconName = getNotificationIcon(item.type);
      const iconColor = getNotificationColor(item.type, theme);
      const backgroundColor = getNotificationBackgroundColor(item.type, theme);
      const content = getLocalizedContent(item);

      return (
        <View
          style={[
            styles.notificationItem,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <View style={styles.notificationContent}>
            <View style={[styles.iconContainer, { backgroundColor }]}>
              <Ionicons
                name={iconName as any}
                size={24}
                color={iconColor}
              />
            </View>
            <View style={styles.textContent}>
              <Text
                style={[styles.notificationText, { color: theme.colors.text }]}
              >
                {content}
              </Text>
              <Text
                style={[styles.timeText, { color: theme.colors.textMuted }]}
              >
                {formatTimeAgo(item.createdAt, t)}
              </Text>
            </View>
          </View>
        </View>
      );
    },
    [theme, t],
  );

  const keyExtractor = useCallback(
    (item: NotificationItem) => item.notificationId,
    [],
  );

  const handleLoadMore = useCallback(() => {
    if (status === "CanLoadMore") {
      loadMore(10);
    }
  }, [status, loadMore]);

  if (status === "LoadingFirstPage") {
    return <ScreenLoading />;
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["left", "right", "bottom"]}
    >
      <ScreenHeader
        title={t("screenTitles.notifications")}
        onBack={() => router.back()}
        rightComponent="button"
        rightButtonText={t("notifications.clearAll")}
        onRightPress={handleDeleteAll}
      />

      <FlatList
        data={notifications || []}
        renderItem={renderNotificationItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIconContainer,
                { backgroundColor: `${theme.colors.primary}15` },
              ]}
            >
              <Ionicons
                name="notifications-outline"
                size={48}
                color={theme.colors.primary}
              />
            </View>
            <Text style={[styles.emptyText, { color: theme.colors.text }]}>
              {t("emptyState.notifications")}
            </Text>
            <Text
              style={[
                styles.emptySubtext,
                { color: theme.colors.textSecondary },
              ]}
            >
              {t("notifications.emptySubtext")}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  notificationItem: {
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContent: {
    flex: 1,
    paddingTop: 2,
  },
  notificationText: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
    marginBottom: 6,
  },
  timeText: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 120,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    opacity: 0.8,
  },
});
