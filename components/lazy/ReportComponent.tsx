import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useMutation } from "convex/react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ImagePickerModal, ImagePickerRef } from "@/components/common/ImagePicker";
import { api } from "@/convex/_generated/api";
import { uploadImageToConvex } from "@/utils/uploadImages";
import { Id } from "@/convex/_generated/dataModel";
import Toast from "react-native-toast-message";
import { InfoSection } from "@/components/common/InfoSection";
import { Button } from "@/components/ui/Button";

type ReportType =
  | "harassment"
  | "hate_speech"
  | "inappropriate_content"
  | "spam"
  | "other";

interface ReportParams {
  type: "user" | "post" | "discussion";
  targetId: string;
  targetName?: string;
}

const getReportTypes = (
  t: any
): { value: ReportType; label: string; description: string }[] => [
    {
      value: "harassment",
      label: t("report.types.harassment.label"),
      description: t("report.types.harassment.description"),
    },
    {
      value: "hate_speech",
      label: t("report.types.hate_speech.label"),
      description: t("report.types.hate_speech.description"),
    },
    {
      value: "inappropriate_content",
      label: t("report.types.inappropriate_content.label"),
      description: t("report.types.inappropriate_content.description"),
    },
    {
      value: "spam",
      label: t("report.types.spam.label"),
      description: t("report.types.spam.description"),
    },
    {
      value: "other",
      label: t("report.types.other.label"),
      description: t("report.types.other.description"),
    },
  ];

export default function ReportComponent() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams() as unknown as ReportParams;

  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [reason, setReason] = useState("");
  const [attachmentUri, setAttachmentUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const REPORT_TYPES = getReportTypes(t);

  const imagePickerRef = useRef<ImagePickerRef>(null);

  const createReport = useMutation(api.moderation.createReport);

  const generateConvexUploadUrl = useMutation(
    api.storage.generateConvexUploadUrl
  );

  const handleImageSelected = useCallback((imageUri: string) => {
    setAttachmentUri(imageUri);
  }, []);

  const handleAddPhoto = useCallback(() => {
    imagePickerRef.current?.present();
  }, []);

  const handleRemovePhoto = useCallback(() => {
    setAttachmentUri(null);
  }, []);

  const validateForm = useCallback(() => {
    if (!selectedType || reason.trim().length < 10 || !attachmentUri) {
      Toast.show({
        type: "error",
        text1: t("errorToasts.validationError")
      });
      return false;
    }

    return true;
  }, [selectedType, reason, attachmentUri, t]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const uploadResult = await uploadImageToConvex(
        attachmentUri!,
        generateConvexUploadUrl
      );
      if (!uploadResult) {
        throw new Error("Failed to upload attachment");
      }

      await createReport({
        targetType: params.type,
        targetId: params.targetId,
        reportType: selectedType!,
        reportReason: reason.trim(),
        attachment: uploadResult.storageId as Id<"_storage">,
      });

      Toast.show({
        type: "success",
        text1: t("successToasts.reportSubmitted")
      });

      router.back();
    } catch (error) {
      console.error("Report submission error:", error);
      Toast.show({
        type: "error",
        text1: t("errorToasts.genericError")
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validateForm,
    attachmentUri,
    generateConvexUploadUrl,
    params.type,
    params.targetId,
    selectedType,
    reason,
    createReport,
    router,
    t,
  ]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      flex: 1,
    },
    content: {
      padding: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 12,
    },
    description: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 16,
      lineHeight: 20,
    },
    reportTypeContainer: {
      marginBottom: 8,
    },
    reportTypeButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    reportTypeButtonSelected: {
      borderColor: theme.colors.primary,
    },
    reportTypeContent: {
      flex: 1,
      marginLeft: 12,
    },
    reportTypeLabel: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.colors.text,
      marginBottom: 2,
    },
    reportTypeDescription: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      lineHeight: 16,
    },
    textInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
      textAlignVertical: "top",
      minHeight: 120,
    },
    textInputFocused: {
      borderColor: theme.colors.primary,
    },
    characterCount: {
      fontSize: 12,
      color: theme.colors.textMuted,
      textAlign: "right",
      marginTop: 4,
    },
    attachmentSection: {
      marginBottom: 24,
    },
    attachmentButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      borderStyle: "dashed",
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    attachmentButtonText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginLeft: 8,
    },
    attachmentPreview: {
      position: "relative",
      borderRadius: 12,
      overflow: "hidden",
    },
    attachmentImage: {
      width: "100%",
      height: 200,
    },
    removeButton: {
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      borderRadius: 20,
      padding: 6,
    },
    submitButton: {
      backgroundColor: theme.colors.primary,
      padding: 16,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 8,
    },
    submitButtonDisabled: {
      backgroundColor: theme.colors.textMuted,
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#FFFFFF",
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <ScreenHeader
        title={`${t("screenTitles.report")} ${params.type === "user" ? t("report.user") : params.type === "post" ? t("report.post") : t("report.discussion")}`}
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <InfoSection infoMessage={t("report.description")} icon="shield-half-outline" />
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("report.sections.issue")}
            </Text>
            {REPORT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[styles.reportTypeContainer]}
                onPress={() => setSelectedType(type.value)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.reportTypeButton,
                    selectedType === type.value &&
                    styles.reportTypeButtonSelected,
                  ]}
                >
                  <Ionicons
                    name={
                      selectedType === type.value
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={20}
                    color={
                      selectedType === type.value
                        ? theme.colors.primary
                        : theme.colors.textMuted
                    }
                  />
                  <View style={styles.reportTypeContent}>
                    <Text style={styles.reportTypeLabel}>{type.label}</Text>
                    <Text style={styles.reportTypeDescription}>
                      {type.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("report.sections.details")}
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder={t("report.detailsPlaceholder")}
              placeholderTextColor={theme.colors.textMuted}
              value={reason}
              onChangeText={setReason}
              multiline
              maxLength={500}
              autoCorrect={true}
            />
            <Text style={styles.characterCount}>{reason.length}/500</Text>
          </View>

          <View style={styles.attachmentSection}>
            <Text style={styles.sectionTitle}>
              {t("report.sections.evidence")}
            </Text>
            <Text style={styles.description}>
              {t("report.evidenceDescription")}
            </Text>

            {attachmentUri ? (
              <View style={styles.attachmentPreview}>
                <Image
                  source={{ uri: attachmentUri }}
                  style={styles.attachmentImage}
                  contentFit="cover"
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={handleRemovePhoto}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.attachmentButton}
                onPress={handleAddPhoto}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="camera"
                  size={24}
                  color={theme.colors.textSecondary}
                />
                <Text style={styles.attachmentButtonText}>
                  {t("report.addScreenshot")}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <Button
            title={t("report.submitReport")}
            onPress={handleSubmit}
            disabled={!selectedType || !reason.trim() || !attachmentUri || isSubmitting}
            loading={isSubmitting}
          />
        </View>
      </ScrollView>

      <ImagePickerModal
        ref={imagePickerRef}
        onImageSelected={handleImageSelected}
      />
    </SafeAreaView>
  );
}