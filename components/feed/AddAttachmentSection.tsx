import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { ImageViewer } from "@/components/common/ImageViewer";
import { Button } from "../ui/Button";

interface Attachment {
  type: "image" | "gif";
  uri: string;
}

interface AddAttachmentSectionProps {
  attachments: Attachment[];
  onAddAttachment: () => void;
  onRemoveAttachment: (index: number) => void;
  maxAttachments?: number;
}

export const AddAttachmentSection: React.FC<AddAttachmentSectionProps> = ({
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  maxAttachments = 3,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [selectedAttachment, setSelectedAttachment] = useState<string | null>(null);
  const [showImageViewer, setShowImageViewer] = useState(false);

  const canAddMore = attachments.length < maxAttachments;

  const handleAttachmentPress = (uri: string) => {
    setSelectedAttachment(uri);
    setShowImageViewer(true);
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginTop: 16,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    headerIcon: {
      marginRight: 8,
    },
    headerText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
    addButton: {
      borderWidth: 2,
      borderColor: theme.colors.primary + "30",
      borderStyle: "dashed",
      opacity: canAddMore ? 1 : 0.5,
    },
    attachmentsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    attachmentContainer: {
      position: "relative",
      width: 80,
      height: 80,
      borderRadius: 8,
      overflow: "hidden",
      marginBottom: 8,
    },
    attachment: {
      width: "100%",
      height: "100%",
    },
    removeButton: {
      position: "absolute",
      top: 4,
      right: 4,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.error,
      alignItems: "center",
      justifyContent: "center",
    },
    gifBadge: {
      position: "absolute",
      bottom: 4,
      left: 4,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    gifText: {
      fontSize: 10,
      fontWeight: "600",
      color: theme.colors.white,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name="images"
          size={20}
          color={theme.colors.primary}
          style={styles.headerIcon}
        />
        <Text style={styles.headerText}>
          {t("createPost.sections.addImages")}
        </Text>
      </View>

      {attachments.length > 0 && (
        <View style={styles.attachmentsContainer}>
          {attachments.map((attachment, index) => (
            <View key={index} style={styles.attachmentContainer}>
              <TouchableOpacity
                onPress={() => handleAttachmentPress(attachment.uri)}
                activeOpacity={0.7}
              >
                <Image source={{ uri: attachment.uri }} style={styles.attachment} />
              </TouchableOpacity>
              {attachment.type === "gif" && (
                <View style={styles.gifBadge}>
                  <Text style={styles.gifText}>GIF</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => onRemoveAttachment(index)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close"
                  size={16}
                  color={theme.colors.white}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {canAddMore && (
        <Button
          iconName="add"
          iconColor={theme.colors.primary}
          onPress={onAddAttachment}
          title={attachments.length === 0
            ? t("createPost.sections.addImages")
            : `(${attachments.length}/${maxAttachments})`}
          bgColor={theme.colors.primary + "15"}
          style={styles.addButton}
          textStyle={{ color: theme.colors.primary }}
        />
      )}
      <ImageViewer
        images={attachments.filter(a => a.type === "image").map((a) => ({ uri: a.uri }))}
        imageIndex={selectedAttachment ? attachments.findIndex(a => a.uri === selectedAttachment) : 0}
        visible={showImageViewer}
        onRequestClose={() => setShowImageViewer(false)}
      />
    </View>
  );
};
