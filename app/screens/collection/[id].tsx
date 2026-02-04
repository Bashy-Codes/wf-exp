import { useCallback } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { useTheme } from "@/lib/Theme";
import { useCollection } from "@/hooks/feed/useCollection";
import { Id } from "@/convex/_generated/dataModel";
import type { CollectionPostTypes } from "@/types";
import { useTranslation } from "react-i18next";

// UI components
import { ScreenHeader } from "@/components/ScreenHeader";
import { ScreenLoading } from "@/components/ScreenLoading";
import { PostCard } from "@/components/feed/PostCard";
import { CollectionHeader } from "@/components/feed/CollectionHeader";
import { EmptyState } from "@/components/EmptyState";
import { ReactionsModal } from "@/components/feed/ReactionsModal";
import { ImageViewer } from "@/components/common/ImageViewer";
import { ActionSheet } from "@/components/common/ActionSheet";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";


export default function CollectionScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Convert string ID to collection ID type
  const collectionId = id as Id<"collections">;

  const {
    // State
    areCollectionsLoading,
    isCollectionDetailsLoading,
    collectionPosts,
    collectionDetails,
    loadingMore,

    // Post interaction handlers
    handleReaction,
    handleComment,
    handleReactionsPress,
    handleImagePress,
    handleReadMore,
    handleUserPress,
    handleCollectionPostOptionsPress,

    // Pagination
    handleLoadMore,

    // Component renderers
    renderReactionsModal,
    renderImageViewer,
    renderActionSheet,
    renderDeleteConfirmationModal,
    renderRemoveConfirmationModal,
  } = useCollection(collectionId);

  const renderPost = useCallback(
    ({ item }: { item: CollectionPostTypes }) => (
      <PostCard
        post={item.post}
        onReaction={handleReaction}
        onComment={handleComment}
        onImagePress={handleImagePress}
        onReadMore={handleReadMore}
        onReactionsPress={handleReactionsPress}
        onUserPress={handleUserPress}
        onOptionsPress={() => handleCollectionPostOptionsPress(item)}
      />
    ),
    [
      handleReaction,
      handleComment,
      handleImagePress,
      handleReadMore,
      handleReactionsPress,
      handleUserPress,
      handleCollectionPostOptionsPress,
    ]
  );

  const ReactionsComponent = (() => {
    const reactionsProps = renderReactionsModal();
    return reactionsProps ? (
      <ReactionsModal
        visible={reactionsProps.visible}
        postId={reactionsProps.postId}
        onClose={reactionsProps.onClose}
      />
    ) : null;
  })();

  const ActionsComponent = (() => {
    const actionProps = renderActionSheet();
    return actionProps ? (
      <ActionSheet ref={actionProps.ref} options={actionProps.options} />
    ) : null;
  })();

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }, [loadingMore, theme.colors.primary]);

  const renderEmptyState = useCallback(() => {
    return <EmptyState halfScreen />;
  }, []);

  const renderHeader = useCallback(() => {
    if (!collectionDetails) return null;
    return (
      <CollectionHeader
        collectionDetails={{
          collectionId: collectionDetails.collectionId,
          title: collectionDetails.title,
          postsCount: collectionDetails.postsCount,
        }}
      />
    );
  }, [collectionDetails]);

  // Show loading screen if still loading
  if (areCollectionsLoading || isCollectionDetailsLoading) {
    return <ScreenLoading />;
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    footerLoader: {
      paddingVertical: 20,
      alignItems: "center",
    },
    listContent: {
      paddingVertical: 8,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <ScreenHeader
        title={collectionDetails?.title || t('screenTitle.collection')}
      />
      <FlashList
        data={collectionPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.collectionPostId}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}

      />

      {/* Sheets and Modals Components */}
      {ReactionsComponent}
      {ActionsComponent}
      <ImageViewer {...renderImageViewer()} />
      <ConfirmationModal {...renderDeleteConfirmationModal()} />
      <ConfirmationModal {...renderRemoveConfirmationModal()} />
    </SafeAreaView>
  );
}
