import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";

interface SelectedItemProps {
  text: string;
  emoji?: string;
  onRemove: () => void;
}

export const SelectedItem: React.FC<SelectedItemProps> = ({
  text,
  emoji,
  onRemove,
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    selectedItem: {
      backgroundColor: theme.colors.primary + "15",
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: 12,
      paddingVertical: 6,
      flexDirection: "row",
      alignItems: "center",
    },
    selectedItemText: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: "500",
      marginRight: 4,
    },
    removeButton: {
      marginLeft: 4,
    },
  });

  return (
    <View style={styles.selectedItem}>
      <Text style={styles.selectedItemText}>
        {emoji ? `${emoji} ${text}` : text}
      </Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={onRemove}
        activeOpacity={0.7}
      >
        <Ionicons
          name="close"
          size={14}
          color={theme.colors.primary}
        />
      </TouchableOpacity>
    </View>
  );
};
