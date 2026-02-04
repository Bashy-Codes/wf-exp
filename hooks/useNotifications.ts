import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { NotificationItem } from "@/app/screens/notifications";
import { useTranslation } from "react-i18next";
import { getCountryByCode } from "@/constants/geographics";

export const useNotifications = () => {
  const { t } = useTranslation();

  const {
    results: notifications,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.notifications.getUserNotifications,
    {},
    { initialNumItems: 10 }
  );

  const markNotificationsAsRead = useMutation(
    api.notifications.markNotificationsAsRead
  );

  const deleteAllNotifications = useMutation(
    api.notifications.deleteAllNotifications
  );

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "friend_request_sent":
        return "person-add-outline";
      case "friend_request_accepted":
        return "checkmark-circle";
      case "friend_request_rejected":
        return "close-circle";
      case "friend_removed":
        return "person-remove-outline";
      case "conversation_deleted":
        return "chatbubble-ellipses-outline";
      case "user_blocked":
        return "ban-outline";
      case "post_reaction":
        return "happy";
      case "post_commented":
        return "chatbubble-outline";
      case "comment_replied":
        return "arrow-undo-outline";

      default:
        return "notifications-outline";
    }
  };

  const getNotificationColor = (type: NotificationItem["type"], theme: any) => {
    switch (type) {
      case "friend_request_sent":
        return theme.colors.primary;
      case "friend_request_accepted":
        return theme.colors.success;
      case "friend_request_rejected":
        return theme.colors.error;
      case "friend_removed":
        return theme.colors.warning;
      case "conversation_deleted":
        return "#9C27B0";
      case "user_blocked":
        return theme.colors.error;
      case "post_reaction":
        return theme.colors.primary;
      case "post_commented":
        return "#2196F3";
      case "comment_replied":
        return "#FF9800";

      default:
        return theme.colors.primary;
    }
  };

  const getNotificationBackgroundColor = (
    type: NotificationItem["type"],
    theme: any
  ) => {
    switch (type) {
      case "friend_request_sent":
        return `${theme.colors.primary}15`;
      case "friend_request_accepted":
        return `${theme.colors.success}15`;
      case "friend_request_rejected":
        return `${theme.colors.error}15`;
      case "friend_removed":
        return `${theme.colors.warning}15`;
      case "conversation_deleted":
        return "#9C27B015";
      case "user_blocked":
        return `${theme.colors.error}15`;
      case "post_reaction":
        return `${theme.colors.primary}15`;
      case "post_commented":
        return "#2196F315";
      case "comment_replied":
        return "#FF980015";

      default:
        return `${theme.colors.primary}15`;
    }
  };

  const getLocalizedContent = (item: NotificationItem) => {
    const senderName = item.sender.name;
    const senderCountry = getCountryByCode(item.sender.country)

    switch (item.type) {
      case "friend_request_sent":
        return t('notification.friend_request_sent', { senderName });
      case "friend_request_accepted":
        return t('notification.friend_request_accepted', { senderName });
      case "friend_request_rejected":
        return t('notification.friend_request_rejected', { senderName });
      case "friend_removed":
        return t('notification.friend_removed', { senderName });
      case "conversation_deleted":
        return t('notification.conversation_deleted', { senderName });
      case "user_blocked":
        return t('notification.user_blocked', { senderName });
      case "post_reaction":
        return t('notification.post_reaction', { senderName });
      case "post_commented":
        return t('notification.post_commented', { senderName });
      case "comment_replied":
        return t('notification.comment_replied', { senderName });

      default:
        return '';
    }
  };


  return {
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
  };
};