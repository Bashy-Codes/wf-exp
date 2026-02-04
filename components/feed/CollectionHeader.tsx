import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";
import { Id } from "@/convex/_generated/dataModel";

interface CollectionDetails {
  collectionId: Id<"collections">;
  title: string;
  postsCount: number;
}

interface CollectionHeaderProps {
  collectionDetails: CollectionDetails;
}

export const CollectionHeader: React.FC<CollectionHeaderProps> = ({
  collectionDetails,
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 8,
      borderRadius: 24,
      overflow: "hidden",
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    headerSection: {
      backgroundColor: `${theme.colors.primary}08`,
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 20,
      alignItems: "center",
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: theme.colors.text,
      textAlign: "center",
      lineHeight: 34,
      letterSpacing: 0.5,
    },
    contentSection: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 24,
      paddingVertical: 20,
    },
    statsContainer: {
      backgroundColor: `${theme.colors.primary}10`,
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 20,
      alignItems: "center",
    },
    statsItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    statsIcon: {
      marginRight: 8,
    },
    statsNumber: {
      color: theme.colors.primary,
      fontWeight: "800",
      fontSize: 18,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header Section with Title */}
      <View style={styles.headerSection}>
        <Text style={styles.title} numberOfLines={2}>
          {collectionDetails.title}
        </Text>
      </View>

      {/* Content Section */}
      <View style={styles.contentSection}>
        {/* Posts Count */}
        <View style={styles.statsContainer}>
          <View style={styles.statsItem}>
            <Ionicons
              name="images"
              size={22}
              color={theme.colors.primary}
              style={styles.statsIcon}
            />
            <Text style={styles.statsNumber}>
              {collectionDetails.postsCount}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
