import { View, StyleSheet } from "react-native";
import { useTheme } from "@/lib/Theme";

export const UserItemSkeleton = () => {
  const theme = useTheme();

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
    },
    contentContainer: {
      flex: 1,
      gap: 8,
    },
    nameSkeleton: {
      width: 120,
      height: 16,
      borderRadius: 8,
      backgroundColor: theme.colors.background,
    },
    countrySkeleton: {
      width: 80,
      height: 14,
      borderRadius: 7,
      backgroundColor: theme.colors.background,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.profilePhoto} />
      <View style={styles.contentContainer}>
        <View style={styles.nameSkeleton} />
        <View style={styles.countrySkeleton} />
      </View>
    </View>
  );
};
