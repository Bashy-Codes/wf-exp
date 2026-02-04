import { FC, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { usePaginatedQuery } from "convex/react";
import { FlashList } from "@shopify/flash-list";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "../ui/Button";
import { UserItem } from "../common/UserItem";
import { getUserLocale } from "@/utils/getUserLocale";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface ReactionsModalProps {
  visible: boolean;
  postId: Id<"posts">;
  onClose: () => void;
}

interface ReactionItem {
  reactionId: Id<"reactions">;
  emoji: string;
  userId: Id<"users">;
  name: string;
  profilePicture?: string;
  country: string;
  isPremium?: boolean;
}

const ReactionUserItem: FC<{ reaction: ReactionItem }> = ({ reaction }) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    reactionContainer: {
      alignItems: "center",
      justifyContent: "center",
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
    },
    emojiText: {
      fontSize: 18,
      textAlign: "center",
    },
  });

  return (
    <UserItem
      data={{
        userId: reaction.userId,
        name: reaction.name,
        profilePicture: reaction.profilePicture,
        country: reaction.country,
        isPremium: reaction.isPremium,
      }}
      rightContent={
        <View style={styles.reactionContainer}>
          <Text style={styles.emojiText}>{reaction.emoji}</Text>
        </View>
      }
    />
  );
};

export const ReactionsModal: React.FC<ReactionsModalProps> = ({
  visible,
  postId,
  onClose,
}) => {
  const theme = useTheme();
  const userLocale = getUserLocale();

  const {
    results: reactions,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.feed.interactions.getPostReactions,
    visible ? { postId, userLocale } : "skip",
    { initialNumItems: 10 },
  );

  const areReactionsLoading = status === "LoadingFirstPage";

  const handleLoadMore = useCallback(() => {
    if (status === "CanLoadMore") {
      loadMore(10);
    }
  }, [status, loadMore]);

  const renderUserItem = useCallback(
    ({ item }: { item: ReactionItem }) => <ReactionUserItem reaction={item} />,
    [],
  );

  const renderLoader = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );

  const renderEmptyState = () => (
    <EmptyState style={{ flex: 1, minHeight: 300 }} />
  );

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      backgroundColor: theme.colors.background,
      width: screenWidth * 0.9,
      height: screenHeight * 0.8,
      maxWidth: 500,
      maxHeight: 700,
      borderRadius: theme.borderRadius.xl,
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 12,
      },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 20,
      overflow: "hidden",
    },
    actionsContainer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
    },
    content: {
      flex: 1,
      paddingTop: 8,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.content}>
            {areReactionsLoading ? (
              renderLoader()
            ) : (
              <FlashList
                data={reactions}
                keyExtractor={(item) => item.reactionId}
                renderItem={renderUserItem}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptyState}
                contentContainerStyle={{
                  paddingVertical: 8,
                }}

              />
            )}
          </View>
          <View style={styles.actionsContainer}>
            <Button iconName="close" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
};
