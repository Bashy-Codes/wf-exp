import React, { useRef, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { ItemPickerModal, PickerItem, ItemPickerModalRef } from "@/components/ItemPickerModal";
import { HOBBIES, getHobbyById } from "@/constants/geographics";
import { Separator } from "@/components/common/Separator";
import { LargeInputContainer } from "@/components/common/LargeInputContainer";
import { ItemSelector } from "@/components/common/ItemSelector";
import { SelectedItem } from "@/components/common/SelectedItem";

interface AboutMeProps {
  control: Control<any>;
  errors: FieldErrors<any>;
}

export const AboutMe: React.FC<AboutMeProps> = ({ control, errors }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const hobbiesSheetRef = useRef<ItemPickerModalRef>(null);

  const hobbyItems: PickerItem[] = useMemo(
    () =>
      HOBBIES.map((hobby) => ({
        id: hobby.id,
        name: hobby.name,
        code: hobby.id,
        emoji: hobby.emoji,
      })),
    []
  );

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
  });

  const renderSelectedHobbies = (
    hobbyIds: string[],
    onRemove: (id: string) => void
  ) => {
    if (hobbyIds.length === 0) return null;

    return (
      <>
        {hobbyIds.map((id) => {
          const hobby = getHobbyById(id);
          if (!hobby) return null;

          return (
            <SelectedItem
              key={id}
              text={hobby.name}
              emoji={hobby.emoji}
              onRemove={() => onRemove(id)}
            />
          );
        })}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>{t("createProfile.aboutMe.bio.label")}</Text>
        <Controller
          control={control}
          name="bio"
          render={({ field: { onChange, onBlur, value } }) => (
            <LargeInputContainer
              minLength={100}
              maxLength={1000}
              value={value || ""}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={t("createProfile.aboutMe.bio.placeholder")}
              placeholderTextColor={theme.colors.textMuted}
              autoCorrect={true}
            />
          )}
        />
      </View>

      <Separator customOptions={["☾ ⋆⁺₊✧ ── ✧₊⁺⋆ ☽"]} />

      <View style={styles.section}>
        <Text style={styles.label}>
          {t("createProfile.aboutMe.hobbies.label")}
        </Text>
        <Controller
          control={control}
          name="hobbies"
          render={({ field: { onChange, value } }) => (
            <>
              <ItemSelector
                placeholder={t("createProfile.aboutMe.hobbies.placeholder")}
                hasError={!!errors.hobbies}
                onPress={() => hobbiesSheetRef.current?.present()}
              >
                {value &&
                  value.length > 0 &&
                  renderSelectedHobbies(value, (id) => {
                    const newValue = value.filter(
                      (hobby: string) => hobby !== id
                    );
                    onChange(newValue);
                  })}
              </ItemSelector>
              <ItemPickerModal
                ref={hobbiesSheetRef}
                items={hobbyItems}
                selectedItems={value || []}
                onSelectionChange={onChange}
                onConfirm={() => hobbiesSheetRef.current?.dismiss()}
                multiSelect={true}
              />
            </>
          )}
        />
      </View>
    </View>
  );
};
