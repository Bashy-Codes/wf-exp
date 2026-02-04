import { memo, ReactNode } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";
import { Id } from "@/convex/_generated/dataModel";

export interface UserItem {
  userId: Id<"users">;
  name: string;
  profilePicture?: string;
  country: string;
  isPremium?: boolean;
}

interface UserItemProps {
  data: UserItem;
  onPress?: () => void;
  rightContent?: ReactNode;
}


const UserItemComponent: React.FC<UserItemProps> = ({
  data,
  onPress,
  rightContent,
}) => {
  const theme = useTheme();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/screens/user-profile/${data.userId}`);
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: 16,
      marginHorizontal: 16,
      marginVertical: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    profilePhoto: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.background,
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
    },
    profilePhotoContainer: {
      position: "relative",
    },
    onlineIndicator: {
      position: "absolute",
      top: 0,
      right: 0,
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: theme.colors.success,
      borderWidth: 2,
      borderColor: theme.colors.surface,
    },
    contentContainer: {
      flex: 1,
      gap: 4,
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    name: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
    country: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
  });

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={styles.container}
    >
      <Image
        source={{ uri: data.profilePicture }}
        style={styles.profilePhoto}
        contentFit="cover"
        cachePolicy={"memory-disk"}
        priority={"normal"}
      />

      <View style={styles.contentContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{data.name}</Text>
          {data.isPremium && (
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={theme.colors.primary}
            />
          )}
        </View>
        <Text style={styles.country}>{data.country}</Text>
      </View>

      {rightContent}
    </TouchableOpacity>
  );
};

export const UserItem = memo(UserItemComponent);
