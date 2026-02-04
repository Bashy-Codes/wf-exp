import React, { useEffect, useRef } from "react";
import { View, Modal, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";

type LoadingModalState = 'loading' | 'success' | 'error';

interface LoadingModalProps {
  visible: boolean;
  state: LoadingModalState;
  onComplete?: () => void;
}

export const LoadingModal: React.FC<LoadingModalProps> = ({
  visible,
  state,
  onComplete,
}) => {
  const theme = useTheme();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Render content based on state
  const renderContent = () => {
    switch (state) {
      case 'loading':
        return <ActivityIndicator size="large" color={theme.colors.primary} />;
      case 'success':
        return (
          <Ionicons
            name="checkmark-circle"
            size={80}
            color={theme.colors.success}
          />
        );
      case 'error':
        return (
          <Ionicons
            name="close-circle"
            size={80}
            colo={theme.colors.error}
          />
        );
      default:
        return <ActivityIndicator size="large" color={theme.colors.primary} />;
    }
  };

  // Handle auto-dismiss for success/error states
  useEffect(() => {
    if (visible && (state === 'success' || state === 'error')) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set timeout for auto-dismiss
      const dismissDelay = state === 'success' ? 2000 : 3000; // 2s for success, 3s for error
      timeoutRef.current = setTimeout(() => {
        onComplete?.();
      }, dismissDelay);
    }

    // Cleanup timeout on unmount or when modal is hidden
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [visible, state, onComplete]);

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      alignItems: "center",
      justifyContent: "center",
      width: "86%",
      height: "26%",
    },
    contentContainer: {
      alignItems: "center",
      justifyContent: "center",
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
        <View style={styles.modalContainer}>
          <View style={styles.contentContainer}>
            {renderContent()}
          </View>
        </View>
      </View>
    </Modal>
  );
};
