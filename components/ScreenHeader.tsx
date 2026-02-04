import type React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/Theme";
import { router } from "expo-router";

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightComponent?: "ellipsis" | "button" | null;
  onRightPress?: () => void;
  rightButtonText?: string | React.ReactNode;
  rightButtonEnabled?: boolean;
  style?: ViewStyle;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onBack,
  rightComponent = null,
  onRightPress,
  rightButtonText,
  rightButtonEnabled = true,
  style,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const styles = StyleSheet.create({
    container: {
      paddingTop: insets.top + 8,
      paddingBottom: 16,
      paddingHorizontal: 16,
      borderBottomLeftRadius: theme.borderRadius.xl,
      borderBottomRightRadius: theme.borderRadius.xl,
      overflow: "hidden",
      backgroundColor: theme.colors.surface,
      ...style,
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      height: 44,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    titleContainer: {
      flex: 1,
      alignItems: "center",
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
      textAlign: "center",
    },
    ellipsisButton: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    postButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: theme.borderRadius.full,
      alignItems: "center",
      justifyContent: "center",
      minWidth: 70,
    },
    postButtonEnabled: {
      backgroundColor: theme.colors.primary,
    },
    postButtonDisabled: {
      backgroundColor: theme.colors.border,
    },
    postButtonText: {
      fontSize: 16,
      fontWeight: "600",
    },
    postButtonTextEnabled: {
      color: theme.colors.white,
    },
    postButtonTextDisabled: {
      color: theme.colors.textMuted,
    },
    placeholder: {
      width: 40,
      height: 40,
    },
  });

  const renderRightComponent = () => {
    if (rightComponent === "ellipsis") {
      return (
        <TouchableOpacity
          style={styles.ellipsisButton}
          onPress={onRightPress}
          activeOpacity={0.7}
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      );
    }

    if (rightComponent === "button") {
      return (
        <TouchableOpacity
          style={[
            styles.postButton,
            rightButtonEnabled
              ? styles.postButtonEnabled
              : styles.postButtonDisabled,
          ]}
          onPress={rightButtonEnabled ? onRightPress : undefined}
          activeOpacity={rightButtonEnabled ? 0.7 : 1}
          disabled={!rightButtonEnabled}
        >
          <Text
            style={[
              styles.postButtonText,
              rightButtonEnabled
                ? styles.postButtonTextEnabled
                : styles.postButtonTextDisabled,
            ]}
          >
            {rightButtonText}
          </Text>
        </TouchableOpacity>
      );
    }

    return <View style={styles.placeholder} />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {renderRightComponent()}
      </View>
    </View>
  );
};
