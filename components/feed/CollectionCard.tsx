import React, { useRef, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useTheme } from "@/lib/Theme";
import type { CollectionTypes } from "@/types/feed";
import { useTranslation } from "react-i18next";
import { Id } from "@/convex/_generated/dataModel";
import { ActionSheet, ActionSheetRef } from "@/components/common/ActionSheet";

interface CollectionCardProps {
  collection: CollectionTypes;
  onViewPress: (collectionId: Id<"collections">) => void;
  onDeletePress?: (collectionId: Id<"collections">) => void;
  showDeleteButton?: boolean;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  onViewPress,
  onDeletePress,
  showDeleteButton = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const actionModalRef = useRef<ActionSheetRef>(null);

  const handlePress = useCallback(() => {
    onViewPress(collection.collectionId);
  }, [collection.collectionId, onViewPress]);

  const handleLongPress = useCallback(() => {
    if (showDeleteButton) {
      actionModalRef.current?.present();
    }
  }, [showDeleteButton]);

  const handleDelete = useCallback(() => {
    onDeletePress?.(collection.collectionId);
  }, [collection.collectionId, onDeletePress]);

  const actionOptions = [
    {
      id: "delete",
      title: t("actions.deleteCollection"),
      icon: "trash-outline",
      color: theme.colors.error,
      onPress: handleDelete,
    },
  ];

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      marginHorizontal: 16,
      marginBottom: 16,
      overflow: "hidden",
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    gradient: {
      height: 180,
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      backgroundColor: `${theme.colors.primary}15`,
    },
    imageWrapper: {
      width: 120,
      height: 120,
      borderRadius: 60,
      justifyContent: "center",
      alignItems: "center",
    },
    collectionImage: {
      width: 120,
      height: 120,
    },
    titleContainer: {
      paddingHorizontal: 20,
      paddingVertical: 20,
      alignItems: "center",
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
      textAlign: "center",
      letterSpacing: 0.3,
    },
  });

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.9}
      >
        <View style={styles.gradient}>
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: "https://storage.worldfriends.app/collections.png", cache: "force-cache" }}
              style={styles.collectionImage}
              resizeMode="contain"
            />
          </View>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {collection.title}
          </Text>
        </View>
      </TouchableOpacity>

      <ActionSheet ref={actionModalRef} options={actionOptions} />
    </>
  );
};
