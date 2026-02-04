import React, { memo } from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "@/lib/Theme";

interface AgeGenderChipProps {
  gender: "male" | "female" | "other";
  showGenerText?: boolean;
  age: number;
  size?: "small" | "medium" | "large";
  style?: ViewStyle;
}

const AgeGenderChip: React.FC<AgeGenderChipProps> = ({
  gender,
  showGenerText = false,
  age,
  size = "medium",
  style
}) => {
  const theme = useTheme();

  const sizeStyles = {
    small: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      iconSize: 12,
      fontSize: 12,
      gap: 6,
      marginBottom: 8,
    },
    medium: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      iconSize: 16,
      fontSize: 14,
      gap: 8,
      marginBottom: 10,
    },
    large: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      iconSize: 20,
      fontSize: 16,
      gap: 10,
      marginBottom: 12,
    },
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: sizeStyles[size].gap,
      marginBottom: sizeStyles[size].marginBottom,
    },
    genderChip: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        gender === "male"
          ? theme.colors.info
          : gender === "female"
            ? theme.colors.error
            : theme.colors.warning,
      borderRadius: theme.borderRadius.full,
      paddingHorizontal: sizeStyles[size].paddingHorizontal,
      paddingVertical: sizeStyles[size].paddingVertical,
    },
    ageChip: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.info,
      borderRadius: theme.borderRadius.full,
      paddingHorizontal: sizeStyles[size].paddingHorizontal,
      paddingVertical: sizeStyles[size].paddingVertical,
    },
    icon: {
      fontSize: sizeStyles[size].iconSize,
    },
    text: {
      fontSize: sizeStyles[size].fontSize,
      color: theme.colors.white,
      fontWeight: "600",
      marginLeft: 4,
    },
  });

  const genderIcon = gender === "female" ? "👩" : gender === "male" ? "👨" : "👤";
  const genderText = gender === "female" ? "Female" : gender === "male" ? "Male" : "Other";

  return (
    <View style={[styles.container, style]}>
      <View style={styles.genderChip}>
        <Text style={styles.icon}>{genderIcon}</Text>
        {showGenerText && <Text style={styles.text}>{genderText}</Text>}
      </View>
      <View style={styles.ageChip}>
        <Text style={styles.icon}>🎂</Text>
        <Text style={styles.text}>{age}</Text>
      </View>
    </View>
  );
};

export default memo(AgeGenderChip);
