import React from "react";
import { View, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "@/lib/Theme";

interface PostAttachmentsProps {
  attachments: Array<{ type: "image" | "gif"; url: string }>;
  onAttachmentPress: (index: number) => void;
}

export const PostAttachments: React.FC<PostAttachmentsProps> = ({ attachments, onAttachmentPress }) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginVertical: 12,
      paddingHorizontal: 16,
    },
    scrollView: {
      flexDirection: "row",
    },
    attachment: {
      width: 200,
      height: 150,
      borderRadius: 12,
      marginRight: 12,
      backgroundColor: theme.colors.surface
    },
    singleAttachment: {
      width: "100%",
      height: 200,
      borderRadius: 12,
      backgroundColor: theme.colors.surface
    },
  });

  if (attachments.length === 1) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => onAttachmentPress(0)} activeOpacity={0.9}>
          <Image
            source={{ uri: attachments[0].url }}
            style={styles.singleAttachment}
            contentFit="cover"
            transition={{ duration: 300, effect: "cross-dissolve" }}
            cachePolicy="memory-disk"
            priority="high"
          />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {attachments.map((attachment, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onAttachmentPress(index)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: attachment.url }}
              style={styles.attachment}
              contentFit="cover"
              transition={{ duration: 300, effect: "cross-dissolve" }}
              cachePolicy="memory-disk"
              priority="high"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
