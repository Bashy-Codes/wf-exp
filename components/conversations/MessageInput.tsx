import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/Theme";
import { MessageData } from "@/types/conversations";
import { GifPickerModal } from "@/components/conversations/GifPickerModal";
import { AttachmentModal } from "@/components/conversations/AttachmentModal";
import { AttachmentOptionsSheet } from "@/components/conversations/AttachmentOptionsSheet";

interface MessageInputProps {
  replyingTo: MessageData | null;
  onCancelReply: () => void;
  isSending: boolean;
  messagePlaceholder: string;
  onSendMessage: (content: string) => void;
  onSendAttachment: (uri: string, type: "image" | "gif", gifUrl?: string) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  replyingTo,
  onCancelReply,
  isSending,
  messagePlaceholder,
  onSendMessage,
  onSendAttachment,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [message, setMessage] = useState("");
  const [gifPickerVisible, setGifPickerVisible] = useState(false);
  const [optionsSheetVisible, setOptionsSheetVisible] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState<{
    uri: string;
    type: "image" | "gif";
    gifUrl?: string;
  } | null>(null);

  const imageButtonWidth = useRef(new Animated.Value(44)).current;
  const sendButtonWidth = useRef(new Animated.Value(0)).current;

  const getReplyPreview = () => {
    if (!replyingTo) return "";

    if (replyingTo.type === "image") {
      return "📷";
    }
    if (replyingTo.type === "gif") {
      return "🎬";
    }

    return replyingTo.content || "Message";
  };

  const handleImagePress = () => {
    Keyboard.dismiss();
    setOptionsSheetVisible(true);
  };

  const handleSelectGifFromSheet = () => {
    setGifPickerVisible(true);
  };

  const handleGifSelected = (gifUrl: string, gifId: string) => {
    setAttachmentPreview({ uri: gifUrl, type: "gif", gifUrl });
    setGifPickerVisible(false);
  };

  const handleSend = () => {
    if (!message.trim() || isSending) return;

    onSendMessage(message);
    setMessage("");
  };

  useEffect(() => {
    const keyboardShowListener = Keyboard.addListener("keyboardDidShow", () => {
      Animated.parallel([
        Animated.timing(imageButtonWidth, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(sendButtonWidth, {
          toValue: 44,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    });

    const keyboardHideListener = Keyboard.addListener("keyboardDidHide", () => {
      if (!message.trim()) {
        Animated.parallel([
          Animated.timing(imageButtonWidth, {
            toValue: 44,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(sendButtonWidth, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }),
        ]).start();
      }
    });

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, [message, imageButtonWidth, sendButtonWidth]);

  const handleImageSelected = async (imageUri: string) => {
    setAttachmentPreview({ uri: imageUri, type: "image" });
  };

  const handleConfirmAttachment = async () => {
    if (!attachmentPreview) return;

    onSendAttachment(
      attachmentPreview.uri,
      attachmentPreview.type,
      attachmentPreview.gifUrl
    );
    setMessage("");
    setAttachmentPreview(null);
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: insets.bottom + 12,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
    },
    replyContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.primary,
    },
    replyHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    replyAuthorRow: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    cancelButton: {
      padding: 4,
    },
    replyAuthor: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.colors.text,
      marginBottom: 2,
    },
    replyContent: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 8,
    },
    inputContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      minHeight: 44,
    },
    textInput: {
      fontSize: 16,
      color: theme.colors.text,
      maxHeight: 100,
      paddingVertical: 4,
    },
    imageButton: {
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    gifButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    sendButton: {
      height: 44,
      borderRadius: 22,
      backgroundColor: message.trim()
        ? theme.colors.primary
        : theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
  });

  return (
    <>
      <View style={styles.container}>
        {replyingTo && (
          <View style={styles.replyContainer}>
            <View style={styles.replyHeader}>
              <View style={styles.replyAuthorRow}>
                <Text style={styles.replyAuthor}>
                  ↪️ {replyingTo.sender.senderName}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onCancelReply}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close"
                  size={16}
                  color={theme.colors.error}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.replyContent} numberOfLines={1}>
              {getReplyPreview()}
            </Text>
          </View>
        )}

        <View style={styles.inputRow}>
          <Animated.View
            style={{
              width: imageButtonWidth,
              overflow: "hidden",
            }}
          >
            <TouchableOpacity
              style={styles.imageButton}
              onPress={handleImagePress}
              activeOpacity={0.7}
              disabled={isSending}
            >
              <Ionicons
                name="add"
                size={24}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={styles.gifButton}
            onPress={handleSelectGifFromSheet}
            activeOpacity={0.7}
            disabled={isSending}
          >
            <Ionicons
              name="happy"
              size={20}
              color={theme.colors.primary}
            />
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder={messagePlaceholder}
              placeholderTextColor={theme.colors.textMuted}
              value={message}
              onChangeText={setMessage}
              multiline
              textAlignVertical="center"
              autoCorrect={true}
            />
          </View>

          <Animated.View
            style={{
              width: sendButtonWidth,
              overflow: "hidden",
            }}
          >
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSend}
              activeOpacity={0.7}
              disabled={!message.trim() || isSending}
            >
              <Ionicons
                name="send"
                size={18}
                color={
                  message.trim() ? theme.colors.white : theme.colors.textMuted
                }
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      <AttachmentOptionsSheet
        visible={optionsSheetVisible}
        onClose={() => setOptionsSheetVisible(false)}
        onImageSelected={handleImageSelected}
        onSelectGif={handleSelectGifFromSheet}
      />

      <GifPickerModal
        visible={gifPickerVisible}
        onSelectGif={handleGifSelected}
        onClose={() => setGifPickerVisible(false)}
      />

      {attachmentPreview && (
        <AttachmentModal
          visible={true}
          attachmentUri={attachmentPreview.uri}
          attachmentType={attachmentPreview.type}
          onConfirm={handleConfirmAttachment}
          onCancel={() => setAttachmentPreview(null)}
          isSending={isSending}
        />
      )}
    </>
  );
};
