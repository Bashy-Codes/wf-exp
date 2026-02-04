import React, { useRef, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { ItemPickerModal, PickerItem, ItemPickerModalRef } from "@/components/ItemPickerModal";
import {
  COUNTRIES,
  LANGUAGES,
  getCountryByCode,
  getLanguageByCode,
} from "@/constants/geographics";
import { Separator } from "@/components/common/Separator";
import { KeyboardHandler } from "@/components/KeyboardHandler";
import { ItemSelector } from "@/components/common/ItemSelector";
import { SelectedItem } from "@/components/common/SelectedItem";

interface LanguagesCountryProps {
  control: Control<any>;
  errors: FieldErrors<any>;
}

export const LanguagesCountry: React.FC<LanguagesCountryProps> = ({
  control,
  errors,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const countryModalRef = useRef<ItemPickerModalRef>(null);
  const languagesSpokenModalRef = useRef<ItemPickerModalRef>(null);
  const languagesLearningModalRef = useRef<ItemPickerModalRef>(null);

  const countryItems: PickerItem[] = useMemo(
    () =>
      COUNTRIES.map((country) => ({
        id: country.code,
        name: country.name,
        code: country.code,
        emoji: country.flag,
      })),
    []
  );

  const languageItems: PickerItem[] = useMemo(
    () =>
      LANGUAGES.map((language) => ({
        id: language.code,
        name: language.name,
        code: language.code,
        emoji: "🌍",
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

  const renderSelectedCountryText = (countryCode: string) => {
    const country = getCountryByCode(countryCode);
    if (!country) return "";
    return `${country.flag} ${country.name}`;
  };

  const renderSelectedLanguages = (
    languageCodes: string[],
    onRemove: (code: string) => void
  ) => {
    if (languageCodes.length === 0) return null;

    return (
      <>
        {languageCodes.map((code) => {
          const language = getLanguageByCode(code);
          if (!language) return null;

          return (
            <SelectedItem
              key={code}
              text={language.name}
              emoji="🌍"
              onRemove={() => onRemove(code)}
            />
          );
        })}
      </>
    );
  };

  return (
    <KeyboardHandler enabled style={{ paddingHorizontal: 20 }}>
      <View style={styles.section}>
        <Text style={styles.label}>
          {t("createProfile.languagesCountry.country.label")}
        </Text>
        <Controller
          control={control}
          name="country"
          render={({ field: { onChange, value } }) => (
            <>
              <ItemSelector
                placeholder={value ? renderSelectedCountryText(value) : t("createProfile.languagesCountry.country.placeholder")}
                hasError={!!errors.country}
                onPress={() => countryModalRef.current?.present()}
              />
              <ItemPickerModal
                ref={countryModalRef}
                items={countryItems}
                selectedItems={value ? [value] : []}
                onSelectionChange={(selected) => onChange(selected[0] || "")}
                onConfirm={() => countryModalRef.current?.dismiss()}
                multiSelect={false}
              />
            </>
          )}
        />
      </View>

      <Separator customOptions={["☾ ⋆⁺₊✧ ── ✧₊⁺⋆ ☽"]} />

      <View style={styles.section}>
        <Text style={styles.label}>
          {t("createProfile.languagesCountry.spokenLanguages.label")}
        </Text>
        <Controller
          control={control}
          name="languagesSpoken"
          render={({ field: { onChange, value } }) => (
            <>
              <ItemSelector
                placeholder={t("createProfile.languagesCountry.spokenLanguages.placeholder")}
                hasError={!!errors.languagesSpoken}
                onPress={() => languagesSpokenModalRef.current?.present()}
              >
                {value &&
                  value.length > 0 &&
                  renderSelectedLanguages(value, (code) => {
                    const newValue = value.filter(
                      (lang: string) => lang !== code
                    );
                    onChange(newValue);
                  })}
              </ItemSelector>
              <ItemPickerModal
                ref={languagesSpokenModalRef}
                items={languageItems}
                selectedItems={value || []}
                onSelectionChange={onChange}
                onConfirm={() => languagesSpokenModalRef.current?.dismiss()}
                multiSelect={true}
              />
            </>
          )}
        />
      </View>

      <Separator customOptions={["☾ ⋆⁺₊✧ ── ✧₊⁺⋆ ☽"]} />

      <View style={styles.section}>
        <Text style={styles.label}>
          {t("createProfile.languagesCountry.learningLanguages.label")}
        </Text>
        <Controller
          control={control}
          name="languagesLearning"
          render={({ field: { onChange, value } }) => (
            <>
              <ItemSelector
                placeholder={t("createProfile.languagesCountry.learningLanguages.placeholder")}
                hasError={!!errors.languagesLearning}
                onPress={() => languagesLearningModalRef.current?.present()}
              >
                {value &&
                  value.length > 0 &&
                  renderSelectedLanguages(value, (code) => {
                    const newValue = value.filter(
                      (lang: string) => lang !== code
                    );
                    onChange(newValue);
                  })}
              </ItemSelector>
              <ItemPickerModal
                ref={languagesLearningModalRef}
                items={languageItems}
                selectedItems={value || []}
                onSelectionChange={onChange}
                onConfirm={() => languagesLearningModalRef.current?.dismiss()}
                multiSelect={true}
              />
            </>
          )}
        />
      </View>
    </KeyboardHandler>
  );
};
