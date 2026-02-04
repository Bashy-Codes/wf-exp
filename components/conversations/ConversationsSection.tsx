import { useCallback, useMemo, useRef, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useTheme } from "@/lib/Theme";
import { useConversations } from "@/hooks/conversations/useConversations";
import { ConversationData } from "@/types/conversations";
import { useTranslation } from "react-i18next";

import { ConversationItem } from "./ConversationItem";
import { ConversationItemSkeleton } from "../skeletons/ConversationItemSkeleton";
import { ConfirmationModal } from "../common/ConfirmationModal";
import { ActionSheet, ActionSheetOption, ActionSheetRef } from "../common/ActionSheet";
import { EmptyState } from "../EmptyState";

export const ConversationsSection = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const actionSheetRef = useRef<ActionSheetRef>(null);

  const [selectedConversation, setSelectedConversation] = useState<ConversationData | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const { conversations, loading, hasMore, handleDeleteConversation, loadMoreConversations } = useConversations();

  const handleLongPress = useCallback((conversation: ConversationData) => {
    setSelectedConversation(conversation);
    actionSheetRef.current?.present();
  }, []);

  const handleDeleteAction = useCallback(() => {
    setDeleteModalVisible(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!selectedConversation) return;
    await handleDeleteConversation(selectedConversation.conversationId);
    setDeleteModalVisible(false);
    setSelectedConversation(null);
  }, [selectedConversation, handleDeleteConversation]);

  const cancelDelete = useCallback(() => {
    setDeleteModalVisible(false);
    setSelectedConversation(null);
  }, []);

  const actionOptions: ActionSheetOption[] = useMemo(
    () => [
      {
        id: "delete",
        title: t("actions.deleteConversation"),
        icon: "trash",
        color: theme.colors.error,
        onPress: handleDeleteAction,
      },
    ],
    [theme.colors.error, handleDeleteAction, t]
  );

  const renderItem = useCallback(
    ({ item }: { item: ConversationData }) => (
      <ConversationItem conversation={item} onLongPress={handleLongPress} />
    ),
    [handleLongPress]
  );

  const renderSkeleton = useCallback(() => <ConversationItemSkeleton />, []);

  const skeletonData = useMemo(() => Array(10).fill(null), []);

  const renderFooter = useCallback(() => {
    if (!hasMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }, [hasMore, theme.colors.primary]);

  const renderEmpty = useCallback(() => {
    if (loading) return null;
    return <EmptyState fullScreen />;
  }, [loading]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    listContent: {
      paddingTop: 12,
    },
    footerLoader: {
      paddingVertical: 20,
      alignItems: "center",
    },
  });

  return (
    <View style={styles.container}>
      <FlashList
        data={loading ? skeletonData : conversations}
        renderItem={loading ? renderSkeleton : renderItem}
        keyExtractor={(item, index) =>
          loading ? `skeleton-${index}` : item.conversationId
        }
        onEndReached={loadMoreConversations}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      <ActionSheet ref={actionSheetRef} options={actionOptions} />

      <ConfirmationModal
        visible={deleteModalVisible}
        icon="trash-outline"
        iconColor={theme.colors.error}
        description={t("confirmation.deleteConversation")}
        confirmButtonColor={theme.colors.error}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </View>
  );
};
