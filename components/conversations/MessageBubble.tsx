import React, { useMemo, useState, useCallback, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import ReanimatedSwipeable, { SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/Theme";
import { ImageViewer } from "@/components/common/ImageViewer";
import { Message } from "@/types/conversations";
import { Ionicons } from "@expo/vector-icons";

interface MessageBubbleProps {
  message: Message;
  dateHeader?: string;
  timeLabel?: string;
  onLongPress: (message: Message) => void;
  onSwipeReply: (message: Message) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  dateHeader,
  timeLabel,
  onLongPress,
  onSwipeReply,
}) => {
  const theme = useTheme();
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  const swipeableRef = useRef<SwipeableMethods>(null);

  const handleSwipeableWillOpen = useCallback(() => {
    if (onSwipeReply) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      onSwipeReply(message);
      swipeableRef.current?.close();
    }
  }, [message, onSwipeReply]);

  const getReplyPreview = () => {
    if (!message.replyParent) return null;

    const { replyParent } = message;
    if (replyParent.type === "image") {
      return "📷 Photo";
    }
    if (replyParent.type === "gif") {
      return "🎬 GIF";
    }

    return replyParent.content || "Message";
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrapper: {
          marginBottom: 12,
        },
        dateHeader: {
          alignItems: "center",
          marginVertical: 12,
        },
        dateHeaderText: {
          fontSize: 12,
          color: theme.colors.textMuted,
          backgroundColor: theme.colors.surface,
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: 12,
          overflow: "hidden",
        },
        timeLabel: {
          alignItems: "center",
          marginBottom: 8,
        },
        timeLabelText: {
          fontSize: 11,
          color: theme.colors.textMuted,
        },
        container: {
          marginHorizontal: 16,
          alignItems: message.isOwner ? "flex-end" : "flex-start",
        },
        bubble: {
          maxWidth: "80%",
          minWidth: message.replyParent ? "32%" : "16%",
          borderTopRightRadius: 20,
          borderTopLeftRadius: 20,
          borderBottomLeftRadius: message.isOwner ? 20 : 0,
          borderBottomRightRadius: message.isOwner ? 0 : 20,
          padding: 12,
          backgroundColor: message.isOwner
            ? theme.colors.primary
            : theme.colors.surface,
          shadowColor: theme.colors.shadow,
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        },
        imageContainer: {
          maxWidth: "80%",
          backgroundColor: theme.colors.surface,
          padding: 4,
          borderTopRightRadius: 20,
          borderTopLeftRadius: 20,
          borderBottomLeftRadius: message.isOwner ? 20 : 0,
          borderBottomRightRadius: message.isOwner ? 0 : 20,
        },
        gifContainer: {
          maxWidth: "70%",
          overflow: "hidden"
        },
        replyContainer: {
          backgroundColor: message.isOwner
            ? theme.colors.background + "40"
            : theme.colors.border + "60",
          borderRadius: 8,
          padding: 8,
          marginBottom: 8,
          borderLeftWidth: 6,
          borderLeftColor: message.isOwner
            ? theme.colors.background + "40"
            : theme.colors.info,
        },
        replyHeader: {
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 2,
        },
        replyAuthor: {
          fontSize: 14,
          fontWeight: "600",
          color: message.isOwner
            ? theme.colors.white + "CC"
            : theme.colors.textSecondary,
        },
        replyContent: {
          fontSize: 12,
          color: message.isOwner
            ? theme.colors.white + "AA"
            : theme.colors.textMuted,
        },
        messageContent: {
          flexDirection: "row",
          alignItems: "flex-end",
          flexWrap: "wrap"
        },
        messageText: {
          fontSize: 16,
          color: message.isOwner ? theme.colors.white : theme.colors.text,
        },
        senderName: {
          fontSize: 11,
          fontWeight: "600",
          color: message.isOwner
            ? theme.colors.white + "DD"
            : theme.colors.primary,
          marginBottom: 2,
          letterSpacing: 0.3,
        },
        correctionContainer: {
          flexDirection: "row",
          gap: 10,
          alignItems: "center"
        },
        correctedText: {
          fontSize: 16,
          color: "#FF0000",
          textDecorationLine: "line-through"
        },
        correctionText: {
          fontSize: 16,
          color: "#00FF00",
          fontWeight: "500",
        },
        messageImage: {
          width: 200,
          height: 150,
          borderTopRightRadius: 20,
          borderTopLeftRadius: 20,
          borderBottomLeftRadius: message.isOwner ? 20 : 0,
          borderBottomRightRadius: message.isOwner ? 0 : 20,
          margin: 4,
        },
        messageGif: {
          width: 180,
          height: 180,
          borderTopRightRadius: 20,
          borderTopLeftRadius: 20,
          borderBottomLeftRadius: message.isOwner ? 20 : 0,
          borderBottomRightRadius: message.isOwner ? 0 : 20,
        },
        timeText: {
          fontSize: 10,
          color: message.isOwner ? theme.colors.white + "80" : theme.colors.textMuted,
          marginLeft: 8,
          marginBottom: -2,
          alignSelf: "flex-end",
        },
        imageTimeText: {
          position: "absolute",
          bottom: 8,
          right: 8,
          backgroundColor: "rgba(0,0,0,0.3)",
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 10,
          overflow: "hidden",
        },
        imageTimeTextContent: {
          fontSize: 10,
          color: "#FFFFFF",
        },
        swipeAction: {
          width: 80
        },
      }),
    [theme, message.isOwner]
  );

  const content = (
    <View style={styles.wrapper}>
      {dateHeader && (
        <View style={styles.dateHeader}>
          <Text style={styles.dateHeaderText}>{dateHeader}</Text>
        </View>
      )}

      {timeLabel && (
        <View style={styles.timeLabel}>
          <Text style={styles.timeLabelText}>{timeLabel}</Text>
        </View>
      )}

      <View style={styles.container}>
        {message.type === "gif" && message.attachmentUrl ? (
          <TouchableOpacity
            style={styles.gifContainer}
            onPress={() => setImageViewerVisible(true)}
            onLongPress={() => onLongPress(message)}
            activeOpacity={0.9}
            delayLongPress={500}
          >
            <Image
              source={{ uri: message.attachmentUrl }}
              style={styles.messageGif}
              contentFit="cover"
              priority="normal"
            />
          </TouchableOpacity>
        ) : message.type === "image" && message.attachmentUrl ? (
          <TouchableOpacity
            style={styles.imageContainer}
            onLongPress={() => onLongPress(message)}
            activeOpacity={0.8}
            delayLongPress={500}
            onPress={() => setImageViewerVisible(true)}
          >
            <Image
              source={{ uri: message.attachmentUrl }}
              style={styles.messageImage}
              contentFit="cover"
              priority="normal"
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.bubble}
            onLongPress={() => onLongPress(message)}
            activeOpacity={0.9}
            delayLongPress={500}
          >
            {!message.isOwner && (
              <Text style={styles.senderName}>{message.sender.senderName}</Text>
            )}
            {message.replyParent && (
              <View style={styles.replyContainer}>
                <View style={styles.replyHeader}>
                  <Text style={styles.replyAuthor}>
                    {message.replyParent.senderName}
                  </Text>
                </View>
                <Text style={styles.replyContent} numberOfLines={1}>
                  {getReplyPreview()}
                </Text>
              </View>
            )}
            <View style={styles.messageContent}>
              {message.correction ? (
                <View>
                  <View style={styles.correctionContainer}>
                    <Ionicons
                      name="close"
                      size={16}
                      color={"#FF0000"}
                    />
                    <Text style={styles.correctedText}>
                      {message.content}
                    </Text>
                  </View>
                  <View style={styles.correctionContainer}>
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={"#00FF00"}
                    />
                    <Text style={styles.correctionText}>
                      {message.correction}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.messageText}>
                  {message.content}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>

      {message.attachmentUrl && (
        <ImageViewer
          images={[{ uri: message.attachmentUrl }]}
          imageIndex={0}
          visible={imageViewerVisible}
          onRequestClose={() => setImageViewerVisible(false)}
        />
      )}
    </View>
  );

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      friction={2}
      overshootRight={false}
      renderRightActions={() => <View style={styles.swipeAction} />}
      onSwipeableWillOpen={handleSwipeableWillOpen}
    >
      {content}
    </ReanimatedSwipeable>
  );
};

