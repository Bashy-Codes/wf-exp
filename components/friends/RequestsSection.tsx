import { useCallback, useMemo } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";
import { EmptyState } from "@/components/EmptyState";
import { UserItem } from "@/components/common/UserItem";
import { FriendCardSkeleton } from "@/components/skeletons/FriendCardSkeleton";
import { useFriendships } from "@/hooks/useFriendships";
import type { FriendshipItem } from "@/types/friendships";

export const RequestsSection = () => {
  const theme = useTheme();
  const {
    requests,
    requestsLoading,
    handleAcceptRequest,
    handleRejectRequest,
    handleLoadMoreRequests,
  } = useFriendships();

  const renderRequest = useCallback(
    ({ item }: { item: FriendshipItem }) => {
      const onAcceptPress = (e: any) => {
        e.stopPropagation();
        handleAcceptRequest(item.friendshipId);
      };

      const onRejectPress = (e: any) => {
        e.stopPropagation();
        handleRejectRequest(item.friendshipId);
      };

      return (
        <UserItem
          data={{
            userId: item.userId,
            name: item.name,
            profilePicture: item.profilePicture,
            country: item.country,
          }}
          rightContent={
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                onPress={onAcceptPress}
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.full },
                ]}
              >
                <Ionicons name="checkmark" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onRejectPress}
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.colors.error, borderRadius: theme.borderRadius.full },
                ]}
              >
                <Ionicons name="close" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          }
        />
      );
    },
    [handleAcceptRequest, handleRejectRequest, theme]
  );

  const renderSkeleton = useCallback(() => <FriendCardSkeleton />, []);
  const skeletonData = useMemo(() => Array(10).fill(null), []);

  const renderEmptyState = useCallback(() => {
    return <EmptyState fullScreen />;
  }, []);

  const renderItem = requestsLoading ? renderSkeleton : renderRequest;

  const keyExtractor = useCallback(
    (item: any, index: number) => (requestsLoading ? `skeleton-${index}` : item.friendshipId),
    [requestsLoading]
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      minHeight: 400,
    },
    contentContainer: {
      paddingTop: 20,
    },
    actionsContainer: {
      flexDirection: "row",
      gap: 8,
    },
    actionButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
  });

  return (
    <View style={styles.container}>
      <FlashList
        data={requestsLoading ? skeletonData : requests}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={handleLoadMoreRequests}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!requestsLoading ? renderEmptyState : null}
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
};
