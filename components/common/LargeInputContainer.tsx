import React from "react";
import { View, Text, TextInput, StyleSheet, ViewStyle, TextInputProps } from "react-native";
import { useTheme } from "@/lib/Theme";
import { getCounterColor } from "@/utils/common";

interface LargeInputContainerProps extends Omit<TextInputProps, 'style'> {
  minLength?: number;
  maxLength: number;
  style?: ViewStyle;
  value: string;
}

export const LargeInputContainer: React.FC<LargeInputContainerProps> = ({
  minLength = 0,
  maxLength,
  style,
  value,
  ...textInputProps
}) => {
  const theme = useTheme();


  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: 16,
      minHeight: 200,
      position: "relative",
    },
    textInput: {
      fontSize: 16,
      color: theme.colors.text,
      textAlignVertical: "top",
      flex: 1,
    },
    counter: {
      position: "absolute",
      bottom: 12,
      right: 12,
      fontSize: 12,
      fontWeight: "500",
      color: getCounterColor(value?.length || 0, minLength, maxLength, theme),
    },
  });

  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={styles.textInput}
        value={value}
        multiline
        maxLength={maxLength}
        {...textInputProps}
      />
      <Text style={styles.counter}>
        {value?.length || 0}/{maxLength}
      </Text>
    </View>
  );
};
