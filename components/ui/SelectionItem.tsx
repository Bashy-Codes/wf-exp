import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { Button } from "./Button";

interface SelectionItemProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  isSelected: boolean;
  selectedText?: string;
  addButtonText?: string;
  onSelect: () => void;
  onRemove: () => void;
}

export const SelectionItem: React.FC<SelectionItemProps> = ({
  title,
  icon,
  isSelected,
  selectedText,
  addButtonText,
  onSelect,
  onRemove,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: 16,
      marginTop: 16,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    headerIcon: {
      marginRight: 8,
    },
    headerText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
    selectedContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: `${theme.colors.primary}15`,
      borderRadius: theme.borderRadius.md,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}30`,
    },
    selectedInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    selectedIcon: {
      marginRight: 8,
    },
    selectedText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.primary,
    },
    removeButton: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.error,
      alignItems: "center",
      justifyContent: "center",
    },
    addButton: {
      borderWidth: 2,
      borderColor: `${theme.colors.primary}30`,
      borderStyle: "dashed",
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name={icon}
          size={20}
          color={theme.colors.primary}
          style={styles.headerIcon}
        />
        <Text style={styles.headerText}>{title}</Text>
      </View>

      {isSelected ? (
        <View style={styles.selectedContainer}>
          <View style={styles.selectedInfo}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={theme.colors.primary}
              style={styles.selectedIcon}
            />
            <Text style={styles.selectedText}>
              {selectedText || t('common.selected')}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={onRemove}
            activeOpacity={0.7}
          >
            <Ionicons
              name="close"
              size={14}
              color={theme.colors.white}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <Button
          iconName="add"
          iconColor={theme.colors.primary}
          onPress={onSelect}
          title={addButtonText || title}
          bgColor={`${theme.colors.primary}15`}
          style={styles.addButton}
          textStyle={{ color: theme.colors.primary }}
        />
      )}
    </View>
  );
};
