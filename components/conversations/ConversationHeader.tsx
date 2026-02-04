import React, { useMemo } from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/Theme";
import NameContainer from "@/components/ui/NameContainer";
import { Id } from "@/convex/_generated/dataModel";
import { router } from "expo-router";

interface ConversationHeaderProps {
  name: string;
  isPremiumUser?: boolean;
  userId?: Id<"users">;
  groupId?: string | Id<"groups">;
  groupMemberIds?: Id<"users">[];
  onBackPress: () => void;
}

export const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  name,
  isPremiumUser = false,
  userId,
  groupId,
  groupMemberIds,
  onBackPress,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    if (userId) {
      router.push(`/screens/user-profile/${userId}`);
    } else if (groupId) {
      router.push(`/screens/group-info/${groupId}`);
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: theme.colors.surface,
          paddingTop: insets.top + 6,
          paddingHorizontal: 16,
          paddingBottom: 10,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottomLeftRadius: theme.borderRadius.xl
        },
        leftSection: {
          flexDirection: "row",
          alignItems: "center",
          flex: 1,
        },
        backButton: {
          padding: 8,
          borderRadius: theme.borderRadius.full,
          backgroundColor: theme.colors.background,
          marginRight: 12,
        },
        profileSection: {
          flex: 1,
        },
        statusText: {
          fontSize: 12,
          color: theme.colors.textSecondary,
          marginTop: 2,
        },
      }),
    [theme, insets.top],
  );

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackPress}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileSection} onPress={handlePress} activeOpacity={0.9}>
          <NameContainer
            name={name}
            isPremiumUser={isPremiumUser}
            size={24}
            style={{ margin: 0, justifyContent: "flex-start" }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};