import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";

export type ActionItemType = "default" | "toggle";

export interface ActionItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  type: ActionItemType;

  // For navigation type
  onPress?: () => void;

  // For toggle type
  value?: boolean;
  onValueChange?: (value: boolean) => void;

  // Optional customization
  iconColor?: string;
  iconBgColor?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
}

export const ActionItem: React.FC<ActionItemProps> = ({
  icon,
  title,
  description,
  type,
  onPress,
  value = false,
  onValueChange,
  iconColor,
  iconBgColor,
  rightIcon,
  disabled = false,
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      paddingHorizontal: 20,
      paddingVertical: 18,
      marginBottom: 12,
    },
    settingItemPressable: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      marginBottom: 12,
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    settingItemContent: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 18,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 2,
    },
    settingDescription: {
      fontSize: 14,
      color: theme.colors.textMuted,
    },
    rightElement: {
      marginLeft: 12,
    },
    chevronIcon: {
      opacity: 0.6,
    },
    switch: {
      transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
    },
  });

  // Determine colors
  const finalIconColor = iconColor || theme.colors.primary;
  const finalIconBgColor = iconBgColor || `${theme.colors.primary}15`;

  // Render right element based on type
  const renderRightElement = () => {
    if (type === "toggle") {
      return (
        <Switch
          style={styles.switch}
          value={value}
          onValueChange={onValueChange}
          trackColor={{
            false: theme.colors.border,
            true: `${finalIconColor}40`,
          }}
          thumbColor={value ? finalIconColor : theme.colors.textMuted}
          ios_backgroundColor={theme.colors.border}
          disabled={disabled}
        />
      );
    }
    // Navigation type
    return (
      <Ionicons
        name={rightIcon || "chevron-forward"}
        size={20}
        color={theme.colors.textMuted}
        style={styles.chevronIcon}
      />
    );
  };

  // Render based on type
  if (type === "default" && onPress && !disabled) {
    return (
      <TouchableOpacity
        style={styles.settingItemPressable}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.settingItemContent}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: finalIconBgColor },
            ]}
          >
            <Ionicons name={icon} size={22} color={finalIconColor} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{title}</Text>
            <Text style={styles.settingDescription}>{description}</Text>
          </View>
          <View style={styles.rightElement}>{renderRightElement()}</View>
        </View>
      </TouchableOpacity>
    );
  }

  // Non-pressable item (toggle or disabled navigation)
  return (
    <View style={styles.settingItem}>
      <View
        style={[styles.iconContainer, { backgroundColor: finalIconBgColor }]}
      >
        <Ionicons name={icon} size={22} color={finalIconColor} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <View style={styles.rightElement}>{renderRightElement()}</View>
    </View>
  );
};
