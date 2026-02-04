import type React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/lib/Theme";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

export const UserCardSkeleton: React.FC = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: 20,
      marginHorizontal: 16,
      marginVertical: 8,
      alignItems: "center",
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: theme.borderRadius.full,
      marginBottom: 16,
    },
    name: {
      width: "70%",
      height: 24,
      borderRadius: theme.borderRadius.sm,
      marginBottom: 12,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
      width: "100%",
    },
    genderButton: {
      width: 60,
      height: 30,
      borderRadius: theme.borderRadius.full,
      marginRight: 8,
    },
    ageButton: {
      width: 75,
      height: 30,
      borderRadius: theme.borderRadius.full,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginBottom: 10,
      width: "100%",
    },
    detailIcon: {
      width: 20,
      height: 20,
      borderRadius: theme.borderRadius.sm,
      marginRight: 12,
    },
    detailLabel: {
      width: 60,
      height: 16,
      borderRadius: theme.borderRadius.sm,
      marginRight: 8,
    },
    detailValue: {
      flex: 1,
      height: 16,
      borderRadius: theme.borderRadius.sm,
    }
  });

  const shimmerColors = [
    theme.colors.surfaceSecondary,
    theme.colors.border,
    theme.colors.surfaceSecondary,
  ];

  return (
    <View style={styles.card}>
      <ShimmerPlaceholder
        shimmerColors={shimmerColors}
        style={styles.profileImage}
      />
      <ShimmerPlaceholder shimmerColors={shimmerColors} style={styles.name} />

      <View style={styles.infoRow}>
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.genderButton}
        />
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.ageButton}
        />
      </View>

      <View style={styles.detailRow}>
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.detailIcon}
        />
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.detailLabel}
        />
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.detailValue}
        />
      </View>

      <View style={styles.detailRow}>
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.detailIcon}
        />
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.detailLabel}
        />
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.detailValue}
        />
      </View>

      <View style={styles.detailRow}>
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.detailIcon}
        />
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.detailLabel}
        />
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.detailValue}
        />
      </View>
    </View>
  );
};
