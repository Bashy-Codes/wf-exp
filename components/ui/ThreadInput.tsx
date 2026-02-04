import React, { useState, useCallback, memo } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/Theme";
import { useTranslation } from "react-i18next";
import { GifPickerModal } from "@/components/conversations/GifPickerModal";

interface ReplyPreview {
  authorName: string;
  content: string;
}

export interface ThreadInputProps {
  onSubmit: (text: string, gifUrl?: string) => void;
  onCancelReply?: () => void;
  replyPreview?: ReplyPreview | null;
}

export const ThreadInput: React.FC<ThreadInputProps> = memo(({
  onSubmit,
  onCancelReply,
  replyPreview,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState("");
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [gifPickerVisible, setGifPickerVisible] = useState(false);

  const handleSubmit = useCallback(() => {
    if (text.trim() || selectedGif) {
      onSubmit(text.trim(), selectedGif || undefined);
      setText("");
      setSelectedGif(null);
    }
  }, [text, selectedGif, onSubmit]);

  const handleGifSelected = useCallback((gifUrl: string) => {
    setSelectedGif(gifUrl);
    setGifPickerVisible(false);
  }, []);

  const handleRemoveGif = useCallback(() => {
    setSelectedGif(null);
  }, []);

  const isSubmitDisabled = !text.trim() && !selectedGif;

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: insets.bottom + 12,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
      backgroundColor: theme.colors.background,
      borderRadius: 22,
      paddingHorizontal: 16,
      paddingVertical: 8,
      minHeight: 44,
      gap: 8,
    },
    gifButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    textInput: {
      flex: 1,
      fontSize: 16,
      lineHeight: 20,
      color: theme.colors.text,
      maxHeight: 80,
      paddingVertical: 8,
    },
    sendButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 18,
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 6,
    },
    sendButtonDisabled: {
      backgroundColor: theme.colors.textMuted,
      opacity: 0.5,
    },
    replyPreviewContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    replyPreviewContent: {
      flex: 1,
      marginRight: 8,
    },
    replyPreviewTitle: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.primary,
      marginBottom: 2,
    },
    replyPreviewText: {
      fontSize: 13,
      color: theme.colors.textMuted,
    },
    replyPreviewCloseButton: {
      padding: 4,
    },
    gifPreviewContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      padding: 8,
      marginBottom: 8,
      position: "relative",
    },
    gifPreview: {
      width: "100%",
      height: 180,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
    },
    removeGifButton: {
      position: "absolute",
      top: 12,
      right: 12,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.error,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  return (
    <>
      <View style={styles.container}>
        {replyPreview && (
          <View style={styles.replyPreviewContainer}>
            <View style={styles.replyPreviewContent}>
              <Text style={styles.replyPreviewTitle}>
                {`Replying to ${replyPreview.authorName}`}
              </Text>
              <Text style={styles.replyPreviewText} numberOfLines={1}>
                {replyPreview.content}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.replyPreviewCloseButton}
              onPress={onCancelReply}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {selectedGif && (
          <View style={styles.gifPreviewContainer}>
            <Image
              source={{ uri: selectedGif }}
              style={styles.gifPreview}
              contentFit="cover"
            />
            <TouchableOpacity
              style={styles.removeGifButton}
              onPress={handleRemoveGif}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={16} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.gifButton}
            onPress={() => setGifPickerVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="happy" size={20} color={theme.colors.primary} />
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            value={text}
            onChangeText={setText}
            placeholder={t("threads.writeReply")}
            placeholderTextColor={theme.colors.textMuted}
            multiline
            returnKeyType="send"
            onSubmitEditing={handleSubmit}
            maxLength={1000}
            autoCorrect={true}
          />
          <TouchableOpacity
            style={[styles.sendButton, isSubmitDisabled && styles.sendButtonDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.7}
            disabled={isSubmitDisabled}
          >
            <Ionicons name="send" size={16} color={theme.colors.surface} />
          </TouchableOpacity>
        </View>
      </View>

      <GifPickerModal
        visible={gifPickerVisible}
        onSelectGif={handleGifSelected}
        onClose={() => setGifPickerVisible(false)}
      />
    </>
  );
});