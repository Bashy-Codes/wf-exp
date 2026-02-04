import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { useQuery } from "convex/react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { EditProfileData } from "@/validations/profile";
import { api } from "@/convex/_generated/api";
import { InfoSection } from "../common/InfoSection";

interface EditBasicInfoProps {
  control: Control<EditProfileData>;
  errors: FieldErrors<EditProfileData>;
}

export const EditBasicInfo: React.FC<EditBasicInfoProps> = ({
  control,
  errors,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const profileData = useQuery(api.users.queries.getCurrentProfile);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTranslatedGender = (gender: string) => {
    switch (gender) {
      case "male":
        return t("common.genders.male");
      case "female":
        return t("common.genders.female");
      case "other":
        return t("common.genders.other");
      default:
        return gender;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 20,
    },
    section: {
      marginBottom: 24,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    inputError: {
      borderColor: theme.colors.error,
      backgroundColor: `${theme.colors.error}08`,
    },
    infoContainer: {
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
    },
    infoText: {
      fontSize: 14,
      color: theme.colors.textMuted,
      lineHeight: 14,
      textAlign: "center",
    },
    readOnlySection: {
      marginBottom: 24,
    },
    readOnlyLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.textMuted,
      marginBottom: 8,
    },
    readOnlyValue: {
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: theme.colors.textMuted,
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
    },
  });

  return (
    <View style={styles.container}>
      <InfoSection
        icon="lock-closed"
        infoMessage={t("editProfile.basicInfo.infoMessage")}
      />

      <View style={styles.section}>
        <Text style={styles.label}>
          {t("createProfile.basicInfo.name.label")}
        </Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder={t("createProfile.basicInfo.name.placeholder")}
              placeholderTextColor={theme.colors.textMuted}
              value={value}
              onChangeText={(text) => onChange(text.replace(/\s+/g, ""))}
              onBlur={onBlur}
              maxLength={12}
            />
          )}
        />
      </View>

      <View style={styles.readOnlySection}>
        <Text style={styles.readOnlyLabel}>
          {t("createProfile.basicInfo.username.label")}
        </Text>
        <Text style={styles.readOnlyValue}>
          @{profileData?.userName || t("common.loading")}
        </Text>
      </View>

      <View style={styles.readOnlySection}>
        <Text style={styles.readOnlyLabel}>
          {t("createProfile.basicInfo.gender.label")}
        </Text>
        <Text style={styles.readOnlyValue}>
          {profileData?.gender
            ? getTranslatedGender(profileData.gender)
            : t("common.loading")}
        </Text>
      </View>

      <View style={styles.readOnlySection}>
        <Text style={styles.readOnlyLabel}>
          {t("createProfile.basicInfo.birthdate.label")}
        </Text>
        <Text style={styles.readOnlyValue}>
          {profileData?.birthDate
            ? formatDate(profileData.birthDate)
            : t("common.loading")}
        </Text>
      </View>
    </View>
  );
};
