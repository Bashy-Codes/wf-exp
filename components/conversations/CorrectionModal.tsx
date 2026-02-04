import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";
import { MessageData } from "@/types/conversations";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/Button";
import { KeyboardHandler } from "../KeyboardHandler";

interface CorrectionModalProps {
  visible: boolean;
  message: MessageData | null;
  onCorrect: (messageId: string, correction: string) => void;
  onClose: () => void;
}

export const CorrectionModal: React.FC<CorrectionModalProps> = ({
  visible,
  message,
  onCorrect,
  onClose,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [correction, setCorrection] = useState("");

  const handleCorrect = () => {
    if (correction.trim() && message) {
      onCorrect(message.messageId, correction.trim());
      setCorrection("");
      onClose();
    }
  };

  const handleClose = () => {
    setCorrection("");
    onClose();
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      paddingVertical: 24,
      paddingHorizontal: 20,
      width: "100%",
      maxWidth: 360,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.success + "15",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      flex: 1,
    },
    originalContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: 12,
      marginBottom: 16,
    },
    label: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.textMuted,
      marginBottom: 6,
    },
    originalText: {
      fontSize: 15,
      color: theme.colors.text,
      lineHeight: 20,
    },
    inputContainer: {
      marginBottom: 20,
    },
    input: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: 12,
      fontSize: 15,
      color: theme.colors.text,
      minHeight: 80,
      textAlignVertical: "top",
      maxHeight: 120,
    },
    buttonContainer: {
      flexDirection: "row",
      gap: 12,
    },
  });

  if (!message) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardHandler
        style={styles.overlay}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.container}
        >
          <View style={styles.originalContainer}>
            <Text style={styles.label}>Original</Text>
            <Text style={styles.originalText} numberOfLines={3}>{message.content}</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Correction</Text>
            <TextInput
              style={styles.input}
              value={correction}
              onChangeText={setCorrection}
              placeholder="Enter Correction Text"
              placeholderTextColor={theme.colors.textMuted}
              multiline
              autoFocus
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              iconName="close"
              onPress={handleClose}
              bgColor={theme.colors.surfaceSecondary}
              style={{ flex: 1, paddingVertical: 12 }}
            />
            <Button
              iconName="checkmark"
              onPress={handleCorrect}
              bgColor={theme.colors.success}
              style={{ flex: 1, paddingVertical: 12 }}
              disabled={!correction.trim()}
            />
          </View>
        </TouchableOpacity>
      </KeyboardHandler>
    </Modal>
  );
};
