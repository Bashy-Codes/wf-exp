import { memo, FC } from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";

interface NameContainerProps {
  name: string;
  isPremiumUser: boolean
  size?: number;
  style?: ViewStyle;
}

const NameContainer: FC<NameContainerProps> = ({
  name,
  isPremiumUser = false,
  size = 24,
  style
}) => {
  const theme = useTheme();

  const fontSize = size;
  const iconSize = size * 0.80;
  const marginBottom = size >= 24 ? 12 : 8;

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      margin: marginBottom,
    },
    name: {
      fontSize: fontSize,
      fontWeight: "700",
      color: theme.colors.text,
      textAlign: "center",
      textAlignVertical: "center",
    },
    verifiedIcon: {
      marginLeft: 6,
    },
    badgeIcon: {
      marginLeft: 4,
      width: iconSize,
      height: iconSize,
    },
  });

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.name}>{name}</Text>
      {isPremiumUser && (
        <Ionicons
          name="checkmark-circle"
          size={iconSize}
          color={theme.colors.primary}
          style={styles.verifiedIcon}
        />
      )}
    </View>
  );
};

export default memo(NameContainer);