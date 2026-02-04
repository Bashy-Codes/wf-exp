import React, { forwardRef, useMemo, useCallback, useState, useImperativeHandle, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import {
  COUNTRIES,
  LANGUAGES,
  getCountryByCode,
  getLanguageByCode,
} from "@/constants/geographics";
import { ItemPickerModal, ItemPickerModalRef, PickerItem } from "@/components/ItemPickerModal";
import { Button } from "../ui/Button";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Filter state interface
interface FilterState {
  country: string | null;
  spokenLanguage: string | null;
  learningLanguage: string | null;
}

export interface FilterModalRef {
  present: () => void;
  dismiss: () => void;
}

interface FilterModalProps {
  currentFilters: FilterState;
  onFiltersConfirm: (filters: FilterState) => void;
  onFiltersReset: () => void;
}

export const FilterModal = forwardRef<FilterModalRef, FilterModalProps>(
  ({ currentFilters, onFiltersConfirm, onFiltersReset }, ref) => {
    const theme = useTheme();
    const { t } = useTranslation();

    // states
    const [visible, setVisible] = useState(false);
    const [tempCountry, setTempCountry] = useState<string | null>(null);
    const [tempLanguageSpoken, setTempLanguageSpoken] = useState<string | null>(null);
    const [tempLanguageLearning, setTempLanguageLearning] = useState<string | null>(null);

    // Refs for pickers
    const countryPickerRef = useRef<ItemPickerModalRef>(null);
    const languageSpokenPickerRef = useRef<ItemPickerModalRef>(null);
    const languageLearningPickerRef = useRef<ItemPickerModalRef>(null);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      present: () => {
        setVisible(true);
        // Initialize temp values with current selections
        setTempCountry(currentFilters.country);
        setTempLanguageSpoken(currentFilters.spokenLanguage);
        setTempLanguageLearning(currentFilters.learningLanguage);
      },
      dismiss: () => {
        setVisible(false);
        setTempCountry(null);
        setTempLanguageSpoken(null);
        setTempLanguageLearning(null);
      },
    }), [currentFilters]);

    // Convert data to PickerItem format
    const countryItems: PickerItem[] = useMemo(
      () =>
        COUNTRIES.map((country) => ({
          id: country.code,
          name: country.name,
          emoji: country.flag,
        })),
      []
    );

    const languageItems: PickerItem[] = useMemo(
      () =>
        LANGUAGES.map((language) => ({
          id: language.code,
          name: language.name,
          emoji: "🌍",
        })),
      []
    );

    // Get display names for selected items
    const getSelectedCountryName = () => {
      if (!tempCountry) return null;
      const country = getCountryByCode(tempCountry);
      return country ? `${country.flag} ${country.name}` : null;
    };

    const getSelectedLanguageSpokenName = () => {
      if (!tempLanguageSpoken) return null;
      const language = getLanguageByCode(tempLanguageSpoken);
      return language ? `${language.name}` : null;
    };

    const getSelectedLanguageLearningName = () => {
      if (!tempLanguageLearning) return null;
      const language = getLanguageByCode(tempLanguageLearning);
      return language ? `${language.name}` : null;
    };

    // Handlers for opening pickers
    const handleOpenCountryPicker = useCallback(() => {
      countryPickerRef.current?.present();
    }, []);

    const handleOpenLanguageSpokenPicker = useCallback(() => {
      languageSpokenPickerRef.current?.present();
    }, []);

    const handleOpenLanguageLearningPicker = useCallback(() => {
      languageLearningPickerRef.current?.present();
    }, []);

    // Handlers for picker selections
    const handleCountrySelection = useCallback((selectedIds: string[]) => {
      setTempCountry(selectedIds[0] || null);
    }, []);

    const handleLanguageSpokenSelection = useCallback((selectedIds: string[]) => {
      setTempLanguageSpoken(selectedIds[0] || null);
    }, []);

    const handleLanguageLearningSelection = useCallback((selectedIds: string[]) => {
      setTempLanguageLearning(selectedIds[0] || null);
    }, []);

    // Modal handlers
    const handleClose = useCallback(() => {
      setVisible(false);
      onFiltersReset(); // Reset filters when closing
      setTempCountry(null);
      setTempLanguageSpoken(null);
      setTempLanguageLearning(null);
    }, [onFiltersReset]);

    const handleConfirm = useCallback(() => {
      // Check if at least one filter is selected
      const hasAtLeastOneFilter = !!(tempCountry || tempLanguageSpoken || tempLanguageLearning);

      if (hasAtLeastOneFilter) {
        // Apply the temporary selections
        onFiltersConfirm({
          country: tempCountry,
          spokenLanguage: tempLanguageSpoken,
          learningLanguage: tempLanguageLearning,
        });
      }

      setVisible(false);
      setTempCountry(null);
      setTempLanguageSpoken(null);
      setTempLanguageLearning(null);
    }, [tempCountry, tempLanguageSpoken, tempLanguageLearning, onFiltersConfirm]);

    // Check if at least one filter is selected
    const hasSelection = tempCountry || tempLanguageSpoken || tempLanguageLearning;

    // Category Item Component
    const CategoryItem: React.FC<{
      title: string;
      selectedValue: string | null;
      onPress: () => void;
    }> = ({ title, selectedValue, onPress }) => (
      <TouchableOpacity
        style={styles.categoryItem}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.categoryContent}>
          <Text style={styles.categoryTitle}>{title}</Text>
          <Text style={styles.categoryValue}>
            {selectedValue || "🔵 🟣 🟢"}
          </Text>
        </View>
        <Ionicons
          name="add"
          size={20}
          color={theme.colors.textMuted}
        />
      </TouchableOpacity>
    );

    const styles = StyleSheet.create({
      overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
      },
      container: {
        backgroundColor: theme.colors.surface,
        borderRadius: 24,
        width: screenWidth * 0.9,
        height: screenHeight * 0.7,
        maxWidth: 500,
        maxHeight: 600,
        shadowColor: theme.colors.shadow,
        shadowOffset: {
          width: 0,
          height: 12,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 20,
        overflow: 'hidden',
      },
      header: {
        alignItems: 'center',
        paddingTop: 24,
        paddingHorizontal: 24,
        paddingBottom: 16,
      },
      headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
        textAlign: 'center',
      },
      content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingVertical: 16,
      },
      categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginVertical: 4,
        backgroundColor: theme.colors.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.primary,
      },
      categoryContent: {
        flex: 1,
      },
      categoryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 4,
      },
      categoryValue: {
        fontSize: 14,
        color: theme.colors.textMuted,
      },
      actionsContainer: {
        backgroundColor: theme.colors.background,
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 24,
        gap: 12,
      },
    });

    return (
      <>
        <Modal
          visible={visible}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={handleClose}
        >
          <Pressable style={styles.overlay} onPress={handleClose}>
            <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>{t("filterModal.title")}</Text>
              </View>

              {/* Content */}
              <View style={styles.content}>
                {/* Country Category */}
                <CategoryItem
                  title={t("filterModal.country")}
                  selectedValue={getSelectedCountryName()}
                  onPress={handleOpenCountryPicker}
                />

                {/* Language Spoken Category */}
                <CategoryItem
                  title={t("filterModal.languageSpoken")}
                  selectedValue={getSelectedLanguageSpokenName()}
                  onPress={handleOpenLanguageSpokenPicker}
                />

                {/* Language Learning Category */}
                <CategoryItem
                  title={t("filterModal.languageLearning")}
                  selectedValue={getSelectedLanguageLearningName()}
                  onPress={handleOpenLanguageLearningPicker}
                />
              </View>

              {/* Bottom Actions */}
              <View style={styles.actionsContainer}>
                <Button
                  iconName="close"
                  bgColor={theme.colors.error}
                  onPress={handleClose}
                  style={{ flex: 1 }}
                />
                <Button
                  iconName="checkmark-sharp"
                  onPress={handleConfirm}
                  disabled={!hasSelection}
                  style={{ flex: 1 }}
                />
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Item Picker Sheets */}
        <ItemPickerModal
          ref={countryPickerRef}
          items={countryItems}
          selectedItems={tempCountry ? [tempCountry] : []}
          onSelectionChange={handleCountrySelection}
          onConfirm={() => countryPickerRef.current?.dismiss()}
          multiSelect={false}
        />

        <ItemPickerModal
          ref={languageSpokenPickerRef}
          items={languageItems}
          selectedItems={tempLanguageSpoken ? [tempLanguageSpoken] : []}
          onSelectionChange={handleLanguageSpokenSelection}
          onConfirm={() => languageSpokenPickerRef.current?.dismiss()}
          multiSelect={false}
        />

        <ItemPickerModal
          ref={languageLearningPickerRef}
          items={languageItems}
          selectedItems={tempLanguageLearning ? [tempLanguageLearning] : []}
          onSelectionChange={handleLanguageLearningSelection}
          onConfirm={() => languageLearningPickerRef.current?.dismiss()}
          multiSelect={false}
        />
      </>
    );
  });
