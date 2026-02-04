import { useCallback, useMemo, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useTheme } from "@/lib/Theme";
import { useGroups } from "@/hooks/groups/useGroups";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTranslation } from "react-i18next";

import { ConversationItem, GroupData } from "./ConversationItem";
import { ConversationItemSkeleton } from "../skeletons/ConversationItemSkeleton";
import { FloatingButton } from "../common/FloatingButton";
import { EmptyState } from "../EmptyState";
import { ConfirmationModal } from "../common/ConfirmationModal";
import { ActionSheet, ActionSheetOption, ActionSheetRef } from "../common/ActionSheet";

export const GroupsSection = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const actionSheetRef = useRef<ActionSheetRef>(null);

  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);

  const { groups, loading } = useGroups();
  const deleteGroup = useMutation(api.groups.mutations.deleteGroup);
  const leaveGroup = useMutation(api.groups.mutations.leaveGroup);

  const handleCreateGroup = useCallback(() => {
    router.push("/screens/create-group");
  }, []);

  const handleLongPress = useCallback((group: GroupData) => {
    setSelectedGroup(group);
    actionSheetRef.current?.present();
  }, []);

  const handleDeleteAction = useCallback(() => {
    setDeleteModalVisible(true);
  }, []);

  const handleLeaveAction = useCallback(() => {
    setLeaveModalVisible(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!selectedGroup) return;
    await deleteGroup({ groupId: selectedGroup.groupId });
    setDeleteModalVisible(false);
    setSelectedGroup(null);
  }, [selectedGroup, deleteGroup]);

  const confirmLeave = useCallback(async () => {
    if (!selectedGroup) return;
    await leaveGroup({ groupId: selectedGroup.groupId });
    setLeaveModalVisible(false);
    setSelectedGroup(null);
  }, [selectedGroup, leaveGroup]);

  const cancelDelete = useCallback(() => {
    setDeleteModalVisible(false);
    setSelectedGroup(null);
  }, []);

  const cancelLeave = useCallback(() => {
    setLeaveModalVisible(false);
    setSelectedGroup(null);
  }, []);

  const actionOptions: ActionSheetOption[] = useMemo(() => {
    if (!selectedGroup) return [];

    if (selectedGroup.isGroupAdmin) {
      return [
        {
          id: "delete",
          title: t("actions.deleteGroup"),
          icon: "trash",
          color: theme.colors.error,
          onPress: handleDeleteAction,
        },
      ];
    }

    return [
      {
        id: "leave",
        title: t("actions.leaveGroup"),
        icon: "exit-outline",
        color: theme.colors.error,
        onPress: handleLeaveAction,
      },
    ];
  }, [selectedGroup, theme.colors.error, handleDeleteAction, handleLeaveAction, t]);

  const renderItem = useCallback(
    ({ item }: { item: GroupData }) => (
      <ConversationItem group={item} onGroupLongPress={handleLongPress} />
    ),
    [handleLongPress]
  );

  const renderSkeleton = useCallback(() => <ConversationItemSkeleton />, []);

  const skeletonData = useMemo(() => Array(10).fill(null), []);

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
  });

  return (
    <View style={styles.container}>
      <FlashList
        data={loading ? skeletonData : groups}
        renderItem={loading ? renderSkeleton : renderItem}
        keyExtractor={(item, index) =>
          loading ? `skeleton-${index}` : item.groupId
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
      />
      <FloatingButton iconName="add" onPress={handleCreateGroup} />

      <ActionSheet ref={actionSheetRef} options={actionOptions} />

      <ConfirmationModal
        visible={deleteModalVisible}
        icon="trash-outline"
        iconColor={theme.colors.error}
        description={t("confirmation.deleteGroup")}
        confirmButtonColor={theme.colors.error}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <ConfirmationModal
        visible={leaveModalVisible}
        icon="exit-outline"
        iconColor={theme.colors.error}
        description={t("confirmation.leaveGroup")}
        confirmButtonColor={theme.colors.error}
        onConfirm={confirmLeave}
        onCancel={cancelLeave}
      />
    </View>
  );
};
