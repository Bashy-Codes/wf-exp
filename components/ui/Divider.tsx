import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/lib/Theme";

interface DividerProps {
  text?: any;
}

const Divider: React.FC<DividerProps> = ({ text }) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
    },
    line: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border,
    },
    text: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.colors.textMuted,
      marginHorizontal: 12,
    },
  });

  if (!text) {
    return <View style={[styles.line, { marginHorizontal: 16 }]} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.text}>{text}</Text>
      <View style={styles.line} />
    </View>
  );
};

export default memo(Divider);
