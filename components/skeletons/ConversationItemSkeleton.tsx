import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/lib/Theme";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

export const ConversationItemSkeleton: React.FC = () => {
  const theme = useTheme();

  const shimmerColors = [
    theme.colors.surfaceSecondary,
    theme.colors.border,
    theme.colors.surfaceSecondary,
  ];

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: 8,
      marginBottom: 4,
      borderRadius: 16,
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      overflow: "hidden",
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    profileSection: {
      marginRight: 12,
    },
    profileImage: {
      width: 52,
      height: 52,
      borderRadius: 26,
    },
    contentSection: {
      flex: 1,
      justifyContent: "center",
    },
    userName: {
      width: "60%",
      height: 16,
      borderRadius: 8,
      marginBottom: 8,
    },
    messagePreview: {
      width: "80%",
      height: 14,
      borderRadius: 8,
    },
    rightSection: {
      alignItems: "flex-end",
      justifyContent: "space-between",
      height: 52,
      paddingVertical: 4,
    },
    timestamp: {
      width: 40,
      height: 12,
      borderRadius: 8,
    },
    unreadIndicator: {
      marginBottom: 4,
      width: 10,
      height: 10,
      borderRadius: 6,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.profileSection}>
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={styles.profileImage}
          />
        </View>
        <View style={styles.contentSection}>
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={styles.userName}
          />
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={styles.messagePreview}
          />
        </View>
        <View style={styles.rightSection}>
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={styles.timestamp}
          />
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={styles.unreadIndicator}
          />
        </View>
      </View>
    </View>
  );
};
