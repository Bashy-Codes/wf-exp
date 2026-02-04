import { useCallback, useMemo } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { useDiscover } from "@/hooks/useDiscover";
import { type UserCardData } from "@/types/discover";

// UI components
import { TabHeader } from "@/components/TabHeader";
import { UserCard } from "@/components/discover/UserCard";
import { UserCardSkeleton } from "@/components/skeletons/UserCardSkeleton";
import { FilterModal } from "@/components/discover/FilterSheet";
import { EmptyState } from "@/components/EmptyState";
import { FloatingButton } from "@/components/common/FloatingButton";

export default function DiscoverTab() {
  const theme = useTheme();
  const { t } = useTranslation();

  const {
    // State
    loading,
    loadingMore,
    users,
    filterState,
    hasActiveFilters,

    // Refs
    filterSheetRef,

    // Filter handlers
    handleFilterPress,
    handleFiltersConfirm,
    handleFiltersReset,

    // Other handlers
    handleViewProfile,
    handleLoadMore,

    // Constants
    INITIAL_LOAD_COUNT,
  } = useDiscover();

  const renderUserCard = useCallback(
    ({ item }: { item: UserCardData }) => (
      <UserCard user={item} onViewProfile={handleViewProfile} />
    ),
    [handleViewProfile]
  );

  const renderSkeleton = useCallback(() => <UserCardSkeleton />, []);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator />
      </View>
    );
  }, [loadingMore]);

  const renderEmptyState = useCallback(() => {
    if (loading) return null;
    return <EmptyState fullScreen />;
  }, [loading]);

  // Memoize skeleton data to prevent array recreation on every render
  const skeletonData = useMemo(() => Array(INITIAL_LOAD_COUNT).fill(null), []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        listContainer: {
          flex: 1,
        },
        footerLoader: {
          paddingVertical: 20,
          alignItems: "center",
        }
      }),
    [theme]
  );

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <TabHeader
        title={t("screenTitles.discover")}
      />
      <View style={styles.listContainer}>
        <FlashList
          data={loading ? skeletonData : users}
          renderItem={loading ? renderSkeleton : renderUserCard}
          keyExtractor={(item, index) =>
            loading ? `skeleton-${index}` : item.userId
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmptyState}
          
        />
      </View>

      {/* Filter Button */}
      <FloatingButton
        onPress={hasActiveFilters ? handleFiltersReset : handleFilterPress}
        iconName={hasActiveFilters ? "radio" : "options-outline"}
        backgroundColor={hasActiveFilters ? theme.colors.success : theme.colors.primary}
      />

      <FilterModal
        ref={filterSheetRef}
        currentFilters={filterState}
        onFiltersConfirm={handleFiltersConfirm}
        onFiltersReset={handleFiltersReset}
      />
    </SafeAreaView>
  );
}
