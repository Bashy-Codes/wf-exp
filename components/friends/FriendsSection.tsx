import { useCallback, useMemo, useState } from "react";
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";
import { EmptyState } from "@/components/EmptyState";
import { UserItem } from "@/components/common/UserItem";
import { UserItemSkeleton } from "@/components/skeletons/UserItemSkeleton";
import { useFriendships } from "@/hooks/useFriendships";
import type { FriendshipItem } from "@/types/friendships";
import { themes } from "@/constants/themes";

export const FriendsSection = () => {
  const theme = useTheme();
  const { friends, friendsLoading, handleMessage, handleLoadMoreFriends, isCreatingConversation } = useFriendships();

  const renderFriend = useCallback(
    ({ item }: { item: FriendshipItem }) => {
      const onMessagePress = (e: any) => {
        e.stopPropagation();
        handleMessage(item.userId);
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
            <TouchableOpacity
              onPress={onMessagePress}
              style={[
                styles.actionButton,
                { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.full },
              ]}
            >
              {isCreatingConversation ? <ActivityIndicator size={"small"} color={theme.colors.white} /> : <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />}
            </TouchableOpacity>
          }
        />
      );
    },
    [handleMessage, theme]
  );

  const renderSkeleton = useCallback(() => <UserItemSkeleton />, []);
  const skeletonData = useMemo(() => Array(10).fill(null), []);

  const renderEmptyState = useCallback(() => {
    return <EmptyState fullScreen />;
  }, []);

  const renderItem = friendsLoading ? renderSkeleton : renderFriend;
  const keyExtractor = useCallback(
    (item: any, index: number) => (friendsLoading ? `skeleton-${index}` : item.userId),
    [friendsLoading]
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      minHeight: 400,
    },
    contentContainer: {
      paddingTop: 6,
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
        data={friendsLoading ? skeletonData : friends}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={handleLoadMoreFriends}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!friendsLoading ? renderEmptyState : null}
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
};
