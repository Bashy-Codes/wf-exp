import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";
import { GroupData } from "@/types/groups";
import { Id } from "@/convex/_generated/dataModel";

interface GroupItemProps {
  group: GroupData;
  onPress: (groupId: Id<"groups">) => void;
}

export const GroupItem: React.FC<GroupItemProps> = ({ group, onPress }) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      padding: 16,
      backgroundColor: theme.colors.surface,
      marginHorizontal: 16,
      marginBottom: 12,
      borderRadius: theme.borderRadius.xl,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    bannerWrapper: {
      width: 70,
      height: 70,
      borderRadius: theme.borderRadius.lg,
      overflow: "hidden",
      backgroundColor: `${theme.colors.primary}15`,
    },
    banner: {
      width: "100%",
      height: "100%",
    },
    bannerPlaceholder: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      flex: 1,
      marginLeft: 16,
      justifyContent: "center",
    },
    title: {
      fontSize: 17,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 6,
    },
    membersRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    membersCount: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: "500",
    },
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(group.groupId)}
      activeOpacity={0.7}
    >
      <View style={styles.bannerWrapper}>
        {group.banner ? (
          <Image source={{ uri: group.banner }} style={styles.banner} contentFit="cover" />
        ) : (
          <View style={styles.bannerPlaceholder}>
            <Ionicons name="people" size={32} color={theme.colors.primary} />
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {group.title}
        </Text>
        <View style={styles.membersRow}>
          <Ionicons name="people-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.membersCount}>
            {group.membersCount} {group.membersCount === 1 ? "member" : "members"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
