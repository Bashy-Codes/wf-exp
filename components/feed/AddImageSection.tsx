import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { ImageViewer } from "@/components/common/ImageViewer";
import { Button } from "../ui/Button";

interface AddImageSectionProps {
  images: string[];
  onAddImage: () => void;
  onRemoveImage: (index: number) => void;
  maxImages?: number;
}

export const AddImageSection: React.FC<AddImageSectionProps> = ({
  images,
  onAddImage,
  onRemoveImage,
  maxImages = 3,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImageViewer, setShowImageViewer] = useState(false);

  const canAddMore = images.length < maxImages;

  const handleImagePress = (imageUri: string) => {
    setSelectedImage(imageUri);
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
    imagesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    imageContainer: {
      position: "relative",
      width: 80,
      height: 80,
      borderRadius: 8,
      overflow: "hidden",
    },
    image: {
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

      {images.length > 0 && (
        <View style={styles.imagesContainer}>
          {images.map((imageUri, index) => (
            <View key={index} style={styles.imageContainer}>
              <TouchableOpacity
                onPress={() => handleImagePress(imageUri)}
                activeOpacity={0.7}
              >
                <Image source={{ uri: imageUri }} style={styles.image} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => onRemoveImage(index)}
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
          onPress={onAddImage}
          title={images.length === 0
            ? t("createPost.sections.addImages")
            : `(${images.length}/${maxImages})`}
          bgColor={theme.colors.primary + "15"}
          style={styles.addButton}
          textStyle={{ color: theme.colors.primary }}
        />
      )}
      <ImageViewer
        images={images.map((uri) => ({ uri }))}
        imageIndex={selectedImage ? images.indexOf(selectedImage) : 0}
        visible={showImageViewer}
        onRequestClose={() => setShowImageViewer(false)}
      />
    </View>
  );
};
