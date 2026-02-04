import React from "react";
import { View, StyleSheet, ViewStyle, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";
import { useTranslation } from "react-i18next";

interface EmptyStateProps {
  style?: ViewStyle;
  fullScreen?: boolean;
  halfScreen?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ style, fullScreen = false, halfScreen = false }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 20,
      minHeight: fullScreen ? 560 : halfScreen ? 300 : undefined
    },
    emptyText: {
      marginTop: 18,
      fontSize: 24,
      fontWeight: "600",
      color: theme.colors.text
    }
  });

  return (
    <View style={[styles.container, style]}>
      <Ionicons
        name="sad"
        size={100}
        color={theme.colors.primary}
      />
      <Text style={styles.emptyText}>{t("common.emptyState")}</Text>
    </View>
  );
};
