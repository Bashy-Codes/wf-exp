import { useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface TabHeaderProps {
  title: string;
  onNotificationPress?: () => void;
}

export const TabHeader: React.FC<TabHeaderProps> = ({ title }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const hasUnreadNotifications = useQuery(api.notifications.hasUnreadNotifications);

  const handleNotificationPress = useCallback(() => {
    router.push("/screens/notifications");
  }, []);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      paddingTop: insets.top + 10,
      paddingHorizontal: 16,
      paddingBottom: 16,
      borderBottomLeftRadius: theme.borderRadius.xl,
      borderBottomRightRadius: theme.borderRadius.xl,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.colors.text,
      flex: 1,
    },
    iconButton: {
      padding: 8,
      borderRadius: theme.borderRadius.xl,
      backgroundColor: theme.colors.background,
    },
    button: {
      padding: 8,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.background,
      marginLeft: 8,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={handleNotificationPress}
        activeOpacity={0.9}
      >
        <Ionicons
          name={hasUnreadNotifications ? "notifications" : "notifications-outline"}
          size={24}
          color={hasUnreadNotifications ? theme.colors.error : theme.colors.text}
        />
      </TouchableOpacity>
    </View>
  );
};
