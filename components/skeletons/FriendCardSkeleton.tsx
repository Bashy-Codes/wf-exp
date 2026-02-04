import type React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/lib/Theme";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

export const FriendCardSkeleton: React.FC = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
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
      borderRadius: 50,
      marginBottom: 16,
    },
    name: {
      width: "70%",
      height: 24,
      borderRadius: 8,
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
      width: 50,
      height: 30,
      borderRadius: 50,
      marginRight: 8,
    },
    ageButton: {
      width: 60,
      height: 30,
      borderRadius: 50,
    },
    countryContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },
    countryText: {
      width: 120,
      height: 18,
      borderRadius: 8,
    },
    messageButton: {
      width: "100%",
      height: 48,
      borderRadius: 50,
    },
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

      <View style={styles.countryContainer}>
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.countryText}
        />
      </View>

      <ShimmerPlaceholder
        shimmerColors={shimmerColors}
        style={styles.messageButton}
      />
    </View>
  );
};
