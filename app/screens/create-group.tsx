import { useState, useCallback, useRef } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Toast from "react-native-toast-message";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { uploadImageToConvex } from "@/utils/uploadImages";

import { ScreenHeader } from "@/components/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { LoadingModal } from "@/components/common/LoadingModal";
import { ImagePickerModal, ImagePickerRef } from "@/components/common/ImagePicker";
import { FriendsPickerModal, FriendsPickerModalRef } from "@/components/friends/FriendsPickerModal";

export default function CreateGroupScreen() {
  const theme = useTheme();
  const { t } = useTranslation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [bannerUri, setBannerUri] = useState<string | null>(null);
  const [selectedFriends, setSelectedFriends] = useState<Id<"users">[]>([]);

  const imagePickerRef = useRef<ImagePickerRef>(null);
  const friendsPickerRef = useRef<FriendsPickerModalRef>(null);

  const createGroupMutation = useMutation(api.groups.mutations.createGroup);
  const generateUploadUrl = useMutation(api.storage.generateConvexUploadUrl);

  const handleCreateGroup = useCallback(async () => {
    if (!title.trim() || !description.trim()) {
      Toast.show({
        type: "error",
        text1: "Please fill all fields",
      });
      return;
    }

    try {
      setIsCreating(true);
      
      let bannerId: Id<"_storage"> | undefined;
      if (bannerUri) {
        const result = await uploadImageToConvex(bannerUri, generateUploadUrl);
        bannerId = result?.storageId as Id<"_storage">;
      }

      const groupId = await createGroupMutation({
        title: title.trim(),
        description: description.trim(),
        banner: bannerId,
        memberIds: selectedFriends,
      });

      Toast.show({
        type: "success",
        text1: "Group created successfully",
      });

      router.replace(`/screens/group/${groupId}` as any);
    } catch (error) {
      console.error("Failed to create group:", error);
      Toast.show({
        type: "error",
        text1: "Failed to create group",
      });
    } finally {
      setIsCreating(false);
    }
  }, [title, description, bannerUri, selectedFriends, createGroupMutation, generateUploadUrl]);

  const handleImageSelected = useCallback((uri: string) => {
    setBannerUri(uri);
  }, []);

  const handleFriendsSelected = useCallback((friends: any[]) => {
    setSelectedFriends(friends.map(f => f.userId));
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: 12,
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: 16,
    },
    textArea: {
      height: 100,
      textAlignVertical: "top",
    },
    bannerSection: {
      marginBottom: 16,
    },
    bannerButton: {
      height: 120,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderStyle: "dashed",
      overflow: "hidden",
    },
    bannerImage: {
      width: "100%",
      height: "100%",
    },
    bannerPlaceholder: {
      alignItems: "center",
    },
    bannerText: {
      marginTop: 8,
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    addFriendsButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      marginBottom: 16,
    },
    addFriendsText: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.colors.primary,
      marginLeft: 8,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <ScreenHeader title="Create Group" />

      <ScrollView style={styles.content}>
        <Text style={styles.label}>Group Banner</Text>
        <View style={styles.bannerSection}>
          <TouchableOpacity
            style={styles.bannerButton}
            onPress={() => imagePickerRef.current?.present()}
            activeOpacity={0.7}
          >
            {bannerUri ? (
              <Image source={{ uri: bannerUri }} style={styles.bannerImage} contentFit="cover" />
            ) : (
              <View style={styles.bannerPlaceholder}>
                <Ionicons name="image-outline" size={32} color={theme.colors.textMuted} />
                <Text style={styles.bannerText}>Add Banner Image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Group Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter group title"
          placeholderTextColor={theme.colors.textMuted}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter group description"
          placeholderTextColor={theme.colors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          maxLength={500}
        />

        <Text style={styles.label}>Add Friends ({selectedFriends.length})</Text>
        <TouchableOpacity
          style={styles.addFriendsButton}
          onPress={() => friendsPickerRef.current?.present()}
          activeOpacity={0.7}
        >
          <Ionicons name="person-add" size={20} color={theme.colors.primary} />
          <Text style={styles.addFriendsText}>Select Friends</Text>
        </TouchableOpacity>

        <Button
          title="Create Group"
          onPress={handleCreateGroup}
          disabled={isCreating}
        />
      </ScrollView>

      <ImagePickerModal
        ref={imagePickerRef}
        onImageSelected={handleImageSelected}
      />

      <FriendsPickerModal
        ref={friendsPickerRef}
        onMultiSelect={handleFriendsSelected}
        multiSelect={true}
      />

      <LoadingModal visible={isCreating} state="loading" />
    </SafeAreaView>
  );
}
