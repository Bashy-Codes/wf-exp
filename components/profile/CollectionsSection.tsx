import React, { useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { Id } from "@/convex/_generated/dataModel";
import type { CollectionTypes } from "@/types/feed";
import { useCollections } from "@/hooks/profile/useCollections";

// UI components
import { Separator } from "@/components/common/Separator";
import { CollectionCard } from "@/components/feed/CollectionCard";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { InputModal } from "@/components/common/InputModal";

interface CollectionsSectionProps {
  // User context
  userId: Id<"users">;
  isFriend?: boolean;
  showCreateButton?: boolean;
}

export const CollectionsSection: React.FC<CollectionsSectionProps> = ({
  userId,
  isFriend = true,
  showCreateButton = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  // Use the collections hook
  const {
    collections,
    areCollectionsLoading,
    loadingMore,
    handleViewCollection,
    handleDeleteCollection,
    handleCreateCollection,
    handleLoadMore,

    // component renders
    renderDeleteConfirmationModal,
    renderCreateCollectionModal,
  } = useCollections({
    targetUserId: userId,
    skip: !isFriend,
  });

  const renderCollection = useCallback(
    ({ item }: { item: CollectionTypes }) => (
      <CollectionCard
        collection={item}
        onViewPress={handleViewCollection}
        onDeletePress={handleDeleteCollection}
        showDeleteButton={item.isOwner}
      />
    ),
    [handleViewCollection, handleDeleteCollection]
  );

  const renderHeader = useCallback(() => {
    if (!showCreateButton) return null;

    return (
      <>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateCollection}
            activeOpacity={0.7}
          >
            <Ionicons
              name="add-circle-outline"
              size={20}
              color={theme.colors.primary}
              style={styles.createButtonIcon}
            />
            <Text style={styles.createButtonText}>
              {t("common.createCollection")}
            </Text>
          </TouchableOpacity>
        </View>

        <Separator />
      </>
    );
  }, [showCreateButton, handleCreateCollection, theme.colors.primary]);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={{ paddingVertical: 20, alignItems: "center" }}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }, [loadingMore, theme.colors.primary]);

  const renderEmptyState = useCallback(() => <EmptyState halfScreen />, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 40,
    },
    headerContainer: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    createButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${theme.colors.primary}15`,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}30`,
      borderStyle: "dashed",
    },
    createButtonIcon: {
      marginRight: 8,
    },
    createButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.primary,
    },
    restrictedContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
      paddingVertical: 40,
    },
    restrictedIcon: {
      marginBottom: 16,
    },
    restrictedMessage: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
  });

  if (!isFriend) {
    return (
      <View style={styles.restrictedContainer}>
        <Ionicons
          name="lock-closed"
          size={48}
          color={theme.colors.textMuted}
          style={styles.restrictedIcon}
        />
        <Text style={styles.restrictedMessage}>{t("profile.restriction.collections")}</Text>
      </View>
    );
  }

  if (areCollectionsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={collections}
        renderItem={renderCollection}
        keyExtractor={(item) => item.collectionId}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16 }}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        
      />

      {/* Modal Components */}
      <ConfirmationModal {...renderDeleteConfirmationModal()} />
      <InputModal {...renderCreateCollectionModal()} />
    </View>
  );
};
