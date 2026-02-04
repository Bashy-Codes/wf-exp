import React, { forwardRef, useState, useCallback, useImperativeHandle } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GifPickerModal } from "../conversations/GifPickerModal";

interface AttachmentPickerProps {
  onAttachmentSelected: (uri: string, type: "image" | "gif") => void;
}

export interface AttachmentPickerRef {
  present: () => void;
  dismiss: () => void;
}

interface OptionItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}

export const AttachmentPicker = forwardRef<AttachmentPickerRef, AttachmentPickerProps>(
  ({ onAttachmentSelected }, ref) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [visible, setVisible] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);

    useImperativeHandle(ref, () => ({
      present: () => setVisible(true),
      dismiss: () => setVisible(false),
    }), []);

    const handleClose = useCallback(() => {
      setVisible(false);
    }, []);

    const handleCameraPress = async () => {
      handleClose();
      try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Toast.show({
            type: "error",
            text1: t("infoToasts.cameraPermission")
          });
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
        });

        if (!result.canceled && result.assets[0]) {
          onAttachmentSelected(result.assets[0].uri, "image");
        }
      } catch (error) {
        console.error("Camera error:", error);
        Toast.show({
          type: "error",
          text1: t("errorToasts.genericError")
        });
      }
    };

    const handleGalleryPress = async () => {
      handleClose();
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Toast.show({
            type: "error",
            text1: t("infoToasts.photoLibraryPermission")
          });
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
        });

        if (!result.canceled && result.assets[0]) {
          onAttachmentSelected(result.assets[0].uri, "image");
        }
      } catch (error) {
        console.error("Gallery error:", error);
        Toast.show({
          type: "error",
          text1: t("errorToasts.genericError")
        });
      }
    };

    const handleGifPress = () => {
      handleClose();
      setShowGifPicker(true);
    };

    const handleGifSelected = (gifUrl: string) => {
      onAttachmentSelected(gifUrl, "gif");
      setShowGifPicker(false);
    };

    const options: OptionItem[] = [
      {
        icon: "camera",
        label: "Camera",
        color: "#FF6B6B",
        onPress: handleCameraPress,
      },
      {
        icon: "images",
        label: "Gallery",
        color: "#A78BFA",
        onPress: handleGalleryPress,
      },
      {
        icon: "film",
        label: "GIF",
        color: "#4ECDC4",
        onPress: handleGifPress,
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
      <>
        <Modal
          visible={visible}
          transparent
          animationType="slide"
          statusBarTranslucent
          onRequestClose={handleClose}
        >
          <Pressable style={styles.overlay} onPress={handleClose}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={styles.container}>
                <View style={styles.handle} />

                <Text style={styles.title}>Add Attachment</Text>

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
                  onPress={handleClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        <GifPickerModal
          visible={showGifPicker}
          onSelectGif={handleGifSelected}
          onClose={() => setShowGifPicker(false)}
        />
      </>
    );
  }
);
