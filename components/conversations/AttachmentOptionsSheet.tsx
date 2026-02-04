import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";

interface AttachmentOptionsSheetProps {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (imageUri: string) => void;
  onSelectGif: () => void;
}

interface OptionItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}

export const AttachmentOptionsSheet: React.FC<AttachmentOptionsSheetProps> = ({
  visible,
  onClose,
  onImageSelected,
  onSelectGif,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const handleCamera = async () => {
    onClose();
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: t("infoToasts.cameraPermission"),
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Camera error:", error);
      Toast.show({
        type: "error",
        text1: t("errorToasts.genericError"),
      });
    }
  };

  const handleGallery = async () => {
    onClose();
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: t("infoToasts.photoLibraryPermission"),
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Gallery error:", error);
      Toast.show({
        type: "error",
        text1: t("errorToasts.genericError"),
      });
    }
  };

  const handleGif = () => {
    onSelectGif();
    onClose();
  };

  const options: OptionItem[] = [
    {
      icon: "camera",
      label: "Camera",
      color: "#FF6B6B",
      onPress: handleCamera,
    },
    {
      icon: "images",
      label: "Gallery",
      color: "#A78BFA",
      onPress: handleGallery,
    },
    {
      icon: "film",
      label: "GIF",
      color: "#4ECDC4",
      onPress: handleGif,
    },
  ];

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    container: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      paddingTop: 8,
      paddingBottom: insets.bottom + 16,
      paddingHorizontal: 16,
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      alignSelf: "center",
      marginBottom: 20,
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 20,
      paddingHorizontal: 4,
    },
    optionsGrid: {
      flexDirection: "row",
      gap: 16,
      marginBottom: 12,
    },
    optionCard: {
      flex: 1,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: 20,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    optionLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.white,
    },
    cancelButton: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 8,
    },
    cancelText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View style={styles.container}>
            <View style={styles.handle} />

            <Text style={styles.title}>Send Attachment</Text>

            <View style={styles.optionsGrid}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.optionCard, { backgroundColor: option.color }]}
                  onPress={option.onPress}
                  activeOpacity={0.8}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name={option.icon}
                      size={28}
                      color={theme.colors.white}
                    />
                  </View>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
