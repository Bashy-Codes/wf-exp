import { useCallback, useMemo, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery, usePaginatedQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useTheme } from "@/lib/Theme";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useTranslation } from "react-i18next";

import { ScreenLoading } from "@/components/ScreenLoading";
import { UserItem } from "@/components/common/UserItem";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";

export default function GroupInfoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { t } = useTranslation();
  const groupId = id as Id<"groups">;

  const [selectedMember, setSelectedMember] = useState<Id<"users"> | null>(null);
  const [removeModalVisible, setRemoveModalVisible] = useState(false);

  const groupInfo = useQuery(api.groups.queries.getGroupInfo, { groupId });
  const { results: members, status, loadMore } = usePaginatedQuery(
    api.groups.queries.getGroupMembers,
    { groupId },
    { initialNumItems: 20 }
  );

  const removeGroupMember = useMutation(api.groups.mutations.removeGroupMember);

  const isAdmin = groupInfo?.isAdmin;

  const handleMemberPress = useCallback((userId: Id<"users">) => {
    router.push(`/screens/user-profile/${userId}`);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (status === "CanLoadMore") {
      loadMore(20);
    }
  }, [status, loadMore]);

  const handleRemoveMember = useCallback((userId: Id<"users">) => {
    setSelectedMember(userId);
    setRemoveModalVisible(true);
  }, []);

  const confirmRemoveMember = useCallback(async () => {
    if (!selectedMember) return;

    try {
      await removeGroupMember({ groupId, userId: selectedMember });
      setRemoveModalVisible(false);
      setSelectedMember(null);
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  }, [selectedMember, removeGroupMember, groupId]);

  const cancelRemoveMember = useCallback(() => {
    setRemoveModalVisible(false);
    setSelectedMember(null);
  }, []);

  const renderHeader = useCallback(() => {
    if (!groupInfo) return null;

    return (
      <>
        <View style={styles.bannerContainer}>
          {groupInfo.banner ? (
            <Image source={{ uri: groupInfo.banner }} style={styles.banner} contentFit="cover" />
          ) : (
            <View style={styles.bannerPlaceholder}>
              <Ionicons name="people" size={64} color={theme.colors.primary} />
            </View>
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.title}>{groupInfo.title}</Text>
          <Text style={styles.membersCount}>
            {groupInfo.membersCount} {groupInfo.membersCount === 1 ? "member" : "members"}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{groupInfo.description}</Text>
        </View>

        <View style={styles.membersHeader}>
          <Text style={styles.sectionTitle}>Members</Text>
        </View>
      </>
    );
  }, [groupInfo, theme]);

  const renderMember = useCallback(
    ({ item }: { item: any }) => (
      <UserItem
        data={{
          userId: item.userId,
          name: item.name,
          profilePicture: item.profilePicture,
          country: item.country,
        }}
        onPress={() => handleMemberPress(item.userId)}
        rightContent={isAdmin ? (
          <TouchableOpacity onPress={() => handleRemoveMember(item.userId)}>
            <Ionicons name="close-circle" size={24} color={theme.colors.error} />
          </TouchableOpacity>
        ) : null
        }
      />
    ),
    [handleMemberPress, handleRemoveMember, isAdmin, groupInfo, theme]
  );

  const renderFooter = useCallback(() => {
    if (status !== "LoadingMore") return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }, [status, theme.colors.primary]);

  const renderEmptyState = useCallback(
    () => (
      <View style={{ padding: 20, alignItems: "center" }}>
        <Text style={{ color: theme.colors.textSecondary }}>No members</Text>
      </View>
    ),
    [theme]
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        bannerContainer: {
          height: 200,
          backgroundColor: theme.colors.surface,
          position: "relative",
        },
        banner: {
          width: "100%",
          height: "100%",
          padding: 50,
          borderRadius: theme.borderRadius.lg
        },
        bannerPlaceholder: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: `${theme.colors.primary}15`,
        },
        infoCard: {
          backgroundColor: theme.colors.surface,
          marginHorizontal: 16,
          marginTop: -40,
          borderRadius: theme.borderRadius.xl,
          padding: 20,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
        },
        title: {
          fontSize: 24,
          fontWeight: "700",
          color: theme.colors.text,
          marginBottom: 8,
          textAlign: "center",
        },
        membersCount: {
          fontSize: 14,
          color: theme.colors.textSecondary,
          textAlign: "center",
          marginBottom: 16,
        },
        divider: {
          height: 1,
          backgroundColor: theme.colors.border,
          marginVertical: 16,
        },
        sectionTitle: {
          fontSize: 16,
          fontWeight: "600",
          color: theme.colors.text,
          marginBottom: 12,
        },
        description: {
          fontSize: 15,
          color: theme.colors.textSecondary,
          lineHeight: 22,
        },
        membersHeader: {
          paddingHorizontal: 16,
          marginTop: 24,
          marginBottom: 4,
        },
        footerLoader: {
          paddingVertical: 20,
          alignItems: "center",
        },
      }),
    [theme]
  );

  if (!groupInfo) {
    return <ScreenLoading />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <FlashList
        data={members || []}
        renderItem={renderMember}
        keyExtractor={(item) => item.userId}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />

      <ConfirmationModal
        visible={removeModalVisible}
        icon="person-remove-outline"
        iconColor={theme.colors.error}
        description={t("confirmation.removeMember")}
        confirmButtonColor={theme.colors.error}
        onConfirm={confirmRemoveMember}
        onCancel={cancelRemoveMember}
      />
    </SafeAreaView>
  );
}
