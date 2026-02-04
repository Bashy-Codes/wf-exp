import type React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";
import { Button } from "../ui/Button";

interface ConfirmationModalProps {
  visible: boolean;
  icon?: string;
  iconColor?: string;
  description?: string;
  message?: string;
  confirmButtonColor?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  icon,
  iconColor,
  description,
  message,
  confirmButtonColor,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
    },
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: 24,
      paddingHorizontal: 24,
      width: "100%",
      maxWidth: 320,
    },
    iconContainer: {
      alignItems: "center",
      marginBottom: 16,
    },
    description: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
      marginBottom: 24,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      gap: 12,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View
          style={styles.container}
        >
          {icon && (
            <View style={styles.iconContainer}>
              <Ionicons
                name={icon as any}
                size={48}
                color={iconColor || theme.colors.error}
              />
            </View>
          )}
          <Text style={styles.description}>{message || description}</Text>
          <View style={styles.buttonContainer}>
            <Button
              iconName="close"
              onPress={onCancel}
              bgColor={theme.colors.surfaceSecondary}
              style={{ flex: 1, paddingVertical: 12, }}
            />
            <Button
              iconName="checkmark"
              onPress={onConfirm}
              bgColor={confirmButtonColor || theme.colors.error}
              style={{ flex: 1, paddingVertical: 12, }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};