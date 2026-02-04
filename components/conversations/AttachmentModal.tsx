import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface AttachmentModalProps {
  visible: boolean;
  attachmentUri: string;
  attachmentType: "image" | "gif";
  onConfirm: () => void;
  onCancel: () => void;
  isSending: boolean;
}

export const AttachmentModal: React.FC<AttachmentModalProps> = ({
  visible,
  attachmentUri,
  attachmentType,
  onConfirm,
  onCancel,
  isSending,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.95)",
    },
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    closeButton: {
      position: "absolute",
      top: insets.top + 16,
      left: 20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    },
    previewContainer: {
      width: SCREEN_WIDTH - 40,
      maxHeight: SCREEN_HEIGHT * 0.6,
      borderRadius: theme.borderRadius.xl,
      overflow: "hidden",
      backgroundColor: theme.colors.surface,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 10,
    },
    attachment: {
      width: "100%",
      height: "100%",
      minHeight: 300,
    },
    footer: {
      position: "absolute",
      bottom: insets.bottom + 20,
      left: 20,
      right: 20,
    },
    sendButton: {
      height: 56,
      borderRadius: theme.borderRadius.lg,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
      backgroundColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.white,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: theme.borderRadius.xl,
    },
    typeIndicator: {
      position: "absolute",
      top: 16,
      right: 16,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: theme.borderRadius.md,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    typeText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.white,
      textTransform: "uppercase",
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Pressable style={styles.closeButton} onPress={onCancel} disabled={isSending}>
            <Ionicons name="close" size={24} color={theme.colors.white} />
          </Pressable>

          <View style={styles.previewContainer}>
            <Image
              source={{ uri: attachmentUri }}
              style={styles.attachment}
              contentFit="contain"
            />
            <View style={styles.typeIndicator}>
              <Ionicons
                name={attachmentType === "gif" ? "film" : "image"}
                size={14}
                color={theme.colors.white}
              />
              <Text style={styles.typeText}>{attachmentType}</Text>
            </View>
            {isSending && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={theme.colors.white} />
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Pressable
              style={styles.sendButton}
              onPress={onConfirm}
              disabled={isSending}
            >
              <Ionicons name="send" size={20} color={theme.colors.white} />
              <Text style={styles.buttonText}>Send</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
