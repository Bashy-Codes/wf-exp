import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";
import { MessageData } from "@/types/conversations";
import { useTranslation } from "react-i18next";


interface ActionModalProps {
  visible: boolean;
  message: MessageData | null;
  onReply: (message: MessageData) => void;
  onCorrect: (message: MessageData) => void;
  onDelete: (message: MessageData) => void;
  onClose: () => void;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  visible,
  message,
  onReply,
  onCorrect,
  onDelete,
  onClose,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();


  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
    },
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      paddingVertical: 24,
      paddingHorizontal: 20,
      width: "100%",
      maxWidth: 300,
    },
    actionsContainer: {
      gap: 12,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.background,
    },
    deleteButton: {
      backgroundColor: theme.colors.error + "15",
    },
    actionIcon: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.full,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    replyIcon: {
      backgroundColor: theme.colors.primary + "15",
    },
    correctIcon: {
      backgroundColor: theme.colors.success + "15",
    },
    deleteIcon: {
      backgroundColor: theme.colors.error + "15",
    },
    actionContent: {
      flex: 1,
    },
    actionTitle: {
      fontSize: 16,
      fontWeight: "600",
    },
    replyTitle: {
      color: theme.colors.text,
    },
    correctTitle: {
      color: theme.colors.success,
    },
    deleteTitle: {
      color: theme.colors.error,
    },
  })

  // Handle reply action
  const handleReply = () => {
    if (message) {
      onReply(message);
      onClose();
    }
  };

  // Handle correct action
  const handleCorrect = () => {
    if (message) {
      onCorrect(message);
      onClose();
    }
  };

  // Handle delete action
  const handleDelete = () => {
    if (message) {
      onDelete(message);
      onClose();
    }
  };

  if (!message) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.container}
          activeOpacity={1}
          onPress={() => { }}
        >
          {/* Actions */}
          <View style={styles.actionsContainer}>
            {/* Reply Action */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleReply}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, styles.replyIcon]}>
                <Ionicons
                  name="arrow-undo"
                  size={20}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, styles.replyTitle]}>
                  {t("common.reply")}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Correct Action - Only for other's text messages */}
            {!message.isOwner && message.type === "text" && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleCorrect}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, styles.correctIcon]}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={theme.colors.success}
                  />
                </View>
                <View style={styles.actionContent}>
                  <Text style={[styles.actionTitle, styles.correctTitle]}>
                    {"Correction"}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Delete Action - Only for own messages */}
            {message.isOwner && (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, styles.deleteIcon]}>
                  <Ionicons
                    name="trash"
                    size={20}
                    color={theme.colors.error}
                  />
                </View>
                <View style={styles.actionContent}>
                  <Text style={[styles.actionTitle, styles.deleteTitle]}>
                    {t("actions.deleteMessage")}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
