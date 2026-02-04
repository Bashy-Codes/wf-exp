import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { DatePickerModal } from "@/components/DatePickerModal";
import { calculateAge } from "@/utils/common";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { useDebounce } from "@/utils/useDebounce";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { api } from "@/convex/_generated/api";
import { ValidationContainer } from "@/components/profile-management/ValidationContainer";

interface BasicInfoProps {
  control: Control<any>;
  errors: FieldErrors<any>;
  onUsernameStatusChange?: (status: string | null) => void;
}

const getGenderOptions = (t: any) => [
  { id: "male", label: t("common.genders.male"), emoji: "👨" },
  { id: "female", label: t("common.genders.female"), emoji: "👩" },
  {
    id: "other",
    label: t("common.genders.other"),
    emoji: "🏳️‍⚧️",
  },
];

export const BasicInfo: React.FC<BasicInfoProps> = ({
  control,
  errors,
  onUsernameStatusChange,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [username, setUsername] = useState("");
  const debouncedUsername = useDebounce(username, 1000);

  // Get translated gender options
  const GENDER_OPTIONS = getGenderOptions(t);

  // Check username availability with debounce
  const isUsernameAvailable = useQuery(
    api.users.queries.checkUsernameAvailability,
    debouncedUsername && debouncedUsername.length >= 3
      ? { userName: debouncedUsername }
      : "skip"
  );

  const getUsernameStatus = () => {
    if (!username || username.length < 3) return null;
    if (debouncedUsername !== username) return "checking";
    if (isUsernameAvailable === undefined) return "checking";
    return isUsernameAvailable ? "available" : "taken";
  };

  const usernameStatus = getUsernameStatus();

  // Notify parent component about username status changes
  React.useEffect(() => {
    if (onUsernameStatusChange) {
      onUsernameStatusChange(usernameStatus);
    }
  }, [usernameStatus, onUsernameStatusChange]);

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
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 14,
      color: theme.colors.text,
    },
    errorText: {
      fontSize: 12,
      color: theme.colors.error,
      marginTop: 4,
    },
    successText: {
      fontSize: 12,
      color: theme.colors.success,
      marginTop: 4,
    },
    genderContainer: {
    },
    genderOption: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: 16,
      marginBottom: 12,
    },
    genderContent: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },
    genderEmoji: {
      fontSize: 20,
      marginRight: 8,
    },
    genderText: {
      fontSize: 16,
      color: theme.colors.text,
    },
    dateButton: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    dateText: {
      fontSize: 14,
      color: theme.colors.text,
    },
    datePlaceholder: {
      color: theme.colors.textMuted,
    },
    usernameContainer: {
      position: "relative",
    },
    usernameStatusContainer: {
      position: "absolute",
      right: 16,
      top: "50%",
      transform: [{ translateY: -12 }],
      zIndex: 1,
    },
    inputWithStatus: {
      paddingRight: 50,
    },
    ageDisplay: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
    },
    ageText: {
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 6,
    },
    ageTextRed: {
      color: theme.colors.error,
    },
    ageTextGreen: {
      color: theme.colors.success,
    },
  });

  return (
    <View style={styles.container}>
      {/* Name Input */}
      <View style={styles.section}>
        <Text style={styles.label}>
          {t("createProfile.basicInfo.name.label")}
        </Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <ValidationContainer hasError={!!errors.name}>
              <TextInput
                style={styles.input}
                placeholder={t("createProfile.basicInfo.name.placeholder")}
                placeholderTextColor={theme.colors.textMuted}
                value={value}
                onChangeText={(text) => onChange(text.replace(/\s+/g, ""))}
                onBlur={onBlur}
                maxLength={12}
              />
            </ValidationContainer>
          )}
        />
      </View>

      {/* Username Input */}
      <View style={styles.section}>
        <Text style={styles.label}>
          {t("createProfile.basicInfo.username.label")}
        </Text>
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, onBlur, value } }) => (
            <ValidationContainer hasError={!!errors.username || usernameStatus === "taken"}>
              <View style={styles.usernameContainer}>
                <TextInput
                  style={[styles.input, styles.inputWithStatus]}
                  placeholder={t("createProfile.basicInfo.username.placeholder")}
                  placeholderTextColor={theme.colors.textMuted}
                  value={value}
                  onChangeText={(text) => {
                    const cleanText = text.replace(/\s+/g, "");
                    onChange(cleanText);
                    setUsername(cleanText);
                  }}
                  onBlur={onBlur}
                  maxLength={12}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <View style={styles.usernameStatusContainer}>
                  {usernameStatus === "checking" && (
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.primary}
                    />
                  )}
                  {usernameStatus === "available" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={theme.colors.success}
                    />
                  )}
                  {usernameStatus === "taken" && (
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={theme.colors.error}
                    />
                  )}
                </View>
              </View>
            </ValidationContainer>
          )}
        />
        {errors.username && (
          <Text style={styles.errorText}>
            {typeof errors.username.message === "string"
              ? errors.username.message
              : "Username is required"}
          </Text>
        )}
        {usernameStatus === "taken" && !errors.username && (
          <Text style={styles.errorText}>
            {t("createProfile.basicInfo.username.taken")}
          </Text>
        )}
        {usernameStatus === "available" && !errors.username && (
          <Text style={styles.successText}>
            {t("createProfile.basicInfo.username.available")}
          </Text>
        )}
      </View>

      {/* Gender Selection */}
      <View style={styles.section}>
        <Text style={styles.label}>
          {t("createProfile.basicInfo.gender.label")}
        </Text>
        <Controller
          control={control}
          name="gender"
          render={({ field: { onChange, value } }) => (
            <View style={styles.genderContainer}>
              {GENDER_OPTIONS.map((option) => {
                const isSelected = value === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={styles.genderOption}
                    onPress={() => onChange(option.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.genderContent}>
                      <Text style={styles.genderEmoji}>
                        {option.emoji}
                      </Text>
                      <Text style={styles.genderText}>
                        {option.label}
                      </Text>
                    </View>
                    <Ionicons
                      name={isSelected ? "radio-button-on" : "radio-button-off"}
                      size={20}
                      color={theme.colors.primary}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        />
      </View>

      {/* Birthdate Picker */}
      <View style={styles.section}>
        <Text style={styles.label}>
          {t("createProfile.basicInfo.birthdate.label")}
        </Text>
        <Controller
          control={control}
          name="birthdate"
          render={({ field: { onChange, value } }) => (
            <>
              <ValidationContainer hasError={!!errors.birthdate}>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.dateText, !value && styles.datePlaceholder]}
                  >
                    {value
                      ? value.toLocaleDateString()
                      : t("createProfile.basicInfo.birthdate.placeholder")}
                  </Text>
                  <Ionicons
                    name="calendar"
                    size={20}
                    color={theme.colors.textMuted}
                  />
                </TouchableOpacity>
              </ValidationContainer>
              <DatePickerModal
                visible={showDatePicker}
                initialDate={value}
                onConfirm={(selectedDate) => {
                  onChange(selectedDate);
                  setShowDatePicker(false);
                }}
                onCancel={() => setShowDatePicker(false)}
              />
            </>
          )}
        />

        <Controller
          control={control}
          name="birthdate"
          render={({ field: { value } }) => {
            if (!value) return <View />;

            const age = calculateAge(value);
            const isUnder13 = age < 13;

            return (
              <View style={styles.ageDisplay}>
                <Ionicons
                  name="gift"
                  size={16}
                  color={isUnder13 ? theme.colors.error : theme.colors.success}
                />
                <Text
                  style={[
                    styles.ageText,
                    isUnder13 ? styles.ageTextRed : styles.ageTextGreen,
                  ]}
                >
                  {age}
                </Text>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
};
