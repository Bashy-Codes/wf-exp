import React, { forwardRef, useMemo, useCallback, useImperativeHandle, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import {
  SUPPORTED_LANGUAGES,
  SupportedLanguageCode,
  changeLanguage,
  getCurrentLanguage,
} from "@/lib/i18n";
import { WFModal } from "./ui/WFModal";



// Language flag mapping based on language codes
const LANGUAGE_FLAGS: Record<SupportedLanguageCode, string> = {
  en: "🇺🇸", // English - US flag
  fr: "🇫🇷", // French - France flag
  es: "🇪🇸", // Spanish - Spain flag
  de: "🇩🇪", // German - Germany flag
  it: "🇮🇹", // Italian - Italy flag
  tr: "🇹🇷", // Turkish - Turkey flag
  ru: "🇷🇺", // Russian - Russia flag
  ja: "🇯🇵", // Japanese - Japan flag
  ko: "🇰🇷", // Korean - South Korea flag
  zh: "🇨🇳", // Chinese - China flag
};

interface LanguageItem {
  code: SupportedLanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export interface LanguagePickerRef {
  present: () => void;
  dismiss: () => void;
}

interface LanguagePickerProps {
  onLanguageChange?: (languageCode: SupportedLanguageCode) => void;
}

export const LanguagePicker = forwardRef<LanguagePickerRef, LanguagePickerProps>(
  ({ onLanguageChange }, ref) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);
    const [tempSelectedLanguage, setTempSelectedLanguage] = useState<SupportedLanguageCode | null>(null);
    const currentLanguage = getCurrentLanguage();

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      present: () => {
        setVisible(true);
        setTempSelectedLanguage(currentLanguage);
      },
      dismiss: () => {
        setVisible(false);
        setTempSelectedLanguage(null);
      },
    }), [currentLanguage]);

    const languageItems: LanguageItem[] = useMemo(() => {
      return SUPPORTED_LANGUAGES.map((lang) => ({
        code: lang.code,
        name: lang.name,
        nativeName: lang.nativeName,
        flag: LANGUAGE_FLAGS[lang.code],
      }));
    }, []);

    const handleLanguageSelect = useCallback(
      (languageCode: SupportedLanguageCode) => {
        setTempSelectedLanguage(languageCode);
      },
      []
    );

    const handleClose = useCallback(() => {
      setVisible(false);
      setTempSelectedLanguage(null);
    }, []);

    const handleConfirm = useCallback(async () => {
      if (tempSelectedLanguage && tempSelectedLanguage !== currentLanguage) {
        try {
          await changeLanguage(tempSelectedLanguage);
          onLanguageChange?.(tempSelectedLanguage);
        } catch (error) {
          console.error("Error changing language:", error);
        }
      }
      setVisible(false);
      setTempSelectedLanguage(null);
    }, [tempSelectedLanguage, currentLanguage, onLanguageChange]);

    const styles = StyleSheet.create({
      listContainer: {
        height: 400,
        marginHorizontal: -8,
        marginVertical: -16,
      },
      itemContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderRadius: theme.borderRadius.xl,
        marginVertical: 6,
        backgroundColor: theme.colors.background
      },
      selectedItem: {
        backgroundColor: theme.colors.primary,
        shadowColor: theme.colors.primary,
        shadowOpacity: 0.3,
        elevation: 8,
      },
      itemContent: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
      },
      flag: {
        fontSize: 28,
        marginRight: 18,
      },
      textContainer: {
        flex: 1,
      },
      itemName: {
        fontSize: 18,
        color: theme.colors.text,
        fontWeight: "700",
        marginBottom: 3,
      },
      selectedItemName: {
        color: theme.colors.white,
        fontWeight: "800",
      },
      itemNativeName: {
        fontSize: 14,
        color: theme.colors.textMuted,
        fontWeight: "500",
      },
      selectedItemNativeName: {
        color: theme.colors.white + "90",
      },
    });

    const renderItem = useCallback(
      ({ item }: { item: LanguageItem }) => {
        const isSelected = tempSelectedLanguage === item.code;

        return (
          <TouchableOpacity
            style={[
              styles.itemContainer,
              isSelected && styles.selectedItem,
            ]}
            onPress={() => handleLanguageSelect(item.code)}
            activeOpacity={0.8}
          >
            <View style={styles.itemContent}>
              <Text style={styles.flag}>{item.flag}</Text>
              <View style={styles.textContainer}>
                <Text
                  style={[
                    styles.itemName,
                    isSelected && styles.selectedItemName,
                  ]}
                >
                  {item.name}
                </Text>
                <Text
                  style={[
                    styles.itemNativeName,
                    isSelected && styles.selectedItemNativeName,
                  ]}
                >
                  {item.nativeName}
                </Text>
              </View>
            </View>
            {isSelected && (
              <Ionicons
                name="checkmark-circle"
                size={28}
                color={theme.colors.white}
              />
            )}
          </TouchableOpacity>
        );
      },
      [tempSelectedLanguage, handleLanguageSelect, styles, theme]
    );

    const keyExtractor = useCallback((item: LanguageItem) => item.code, []);

    return (
      <WFModal
        visible={visible}
        onClose={handleClose}
        onConfirm={handleConfirm}
        headerIcon="language"
      >
        <View style={styles.listContainer}>
          <FlatList
            data={languageItems}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingVertical: 8,
            }}
          />
        </View>
      </WFModal>
    );
  }
);