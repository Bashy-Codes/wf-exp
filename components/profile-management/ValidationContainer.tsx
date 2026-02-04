import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "@/lib/Theme";

interface ValidationContainerProps {
  children: React.ReactNode;
  hasError?: boolean;
  style?: ViewStyle;
}

export const ValidationContainer: React.FC<ValidationContainerProps> = ({
  children,
  hasError = false,
  style,
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: hasError ? theme.colors.error : theme.colors.border,
      borderRadius: theme.borderRadius.md,
    },
  });

  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
};
