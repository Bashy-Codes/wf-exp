import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import {
  getCountryByCode,
  getLanguageByCode,
  getHobbyById,
} from "@/constants/geographics";


interface ProfileItemProps {
  type: "about" | "languages" | "travel" | "hobbies" | "books";
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  data?: {
    aboutMe?: string;
    spokenLanguages?: string[];
    learningLanguages?: string[];
    visitedCountries?: string[];
    wantToVisitCountries?: string[];
    hobbies?: string[];
    books?: string[];
  };
}

export const ProfileItem = memo<ProfileItemProps>(
  ({ type, title, icon, data }) => {
    const theme = useTheme();
    const { t } = useTranslation();

    const styles = StyleSheet.create({
      container: {
        backgroundColor: theme.colors.card,
        borderRadius: 20,
        marginHorizontal: 20,
        marginBottom: 16,
        padding: 16,
      },
      header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
      },
      iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.primary + "15",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
      },
      title: {
        fontSize: 18,
        fontWeight: "700",
        color: theme.colors.text,
      },
      aboutText: {
        fontSize: 15,
        lineHeight: 22,
        color: theme.colors.textSecondary,
        marginTop: 4,
      },
      subsection: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
      },
      subsectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
      },
      subsectionIcon: {
        marginRight: 8,
      },
      subsectionTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: theme.colors.text,
      },
      chipsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
      },
      chip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: theme.colors.border,
      },
      chipText: {
        fontSize: 13,
        fontWeight: "500",
        color: theme.colors.text,
      },
      bookChip: {
        maxWidth: 200,
      },
      bookTitle: {
        fontSize: 13,
        fontWeight: "600",
        color: theme.colors.text,
      },
    });

    const renderChips = useMemo(() => {
      switch (type) {
        case "languages":
          return (
            <>
              {data?.spokenLanguages && data.spokenLanguages.length > 0 && (
                <View style={styles.subsection}>
                  <View style={styles.subsectionHeader}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={theme.colors.success}
                      style={styles.subsectionIcon}
                    />
                    <Text style={styles.subsectionTitle}>
                      {t("profile.subsections.speaking")}
                    </Text>
                  </View>
                  <View style={styles.chipsContainer}>
                    {data.spokenLanguages.map((langCode) => {
                      const language = getLanguageByCode(langCode);
                      return language ? (
                        <View key={langCode} style={styles.chip}>
                          <Text style={styles.chipText}>
                            💬 {language.name}
                          </Text>
                        </View>
                      ) : null;
                    })}
                  </View>
                </View>
              )}
              {data?.learningLanguages && data.learningLanguages.length > 0 && (
                <View style={styles.subsection}>
                  <View style={styles.subsectionHeader}>
                    <Ionicons
                      name="school"
                      size={16}
                      color={theme.colors.warning}
                      style={styles.subsectionIcon}
                    />
                    <Text style={styles.subsectionTitle}>
                      {t("profile.subsections.learning")}
                    </Text>
                  </View>
                  <View style={styles.chipsContainer}>
                    {data.learningLanguages.map((langCode) => {
                      const language = getLanguageByCode(langCode);
                      return language ? (
                        <View key={langCode} style={styles.chip}>
                          <Text style={styles.chipText}>
                            📚 {language.name}
                          </Text>
                        </View>
                      ) : null;
                    })}
                  </View>
                </View>
              )}
            </>
          );

        case "travel":
          return (
            <>
              {data?.visitedCountries && data.visitedCountries.length > 0 && (
                <View style={styles.subsection}>
                  <View style={styles.subsectionHeader}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={theme.colors.success}
                      style={styles.subsectionIcon}
                    />
                    <Text style={styles.subsectionTitle}>
                      {t("profile.subsections.visited")}
                    </Text>
                  </View>
                  <View style={styles.chipsContainer}>
                    {data.visitedCountries.map((countryCode) => {
                      const country = getCountryByCode(countryCode);
                      return country ? (
                        <View key={countryCode} style={styles.chip}>
                          <Text style={styles.chipText}>
                            {country.flag} {country.name}
                          </Text>
                        </View>
                      ) : null;
                    })}
                  </View>
                </View>
              )}
              {data?.wantToVisitCountries &&
                data.wantToVisitCountries.length > 0 && (
                  <View style={styles.subsection}>
                    <View style={styles.subsectionHeader}>
                      <Ionicons
                        name="heart"
                        size={16}
                        color={theme.colors.error}
                        style={styles.subsectionIcon}
                      />
                      <Text style={styles.subsectionTitle}>
                        {t("profile.subsections.wantToVisit")}
                      </Text>
                    </View>
                    <View style={styles.chipsContainer}>
                      {data.wantToVisitCountries.map((countryCode) => {
                        const country = getCountryByCode(countryCode);
                        return country ? (
                          <View key={countryCode} style={styles.chip}>
                            <Text style={styles.chipText}>
                              {country.flag} {country.name}
                            </Text>
                          </View>
                        ) : null;
                      })}
                    </View>
                  </View>
                )}
            </>
          );

        case "hobbies":
          return data?.hobbies && data.hobbies.length > 0 ? (
            <View style={styles.chipsContainer}>
              {data.hobbies.map((hobbyId) => {
                const hobby = getHobbyById(hobbyId);
                return hobby ? (
                  <View key={hobbyId} style={styles.chip}>
                    <Text style={styles.chipText}>
                      {hobby.emoji} {hobby.name}
                    </Text>
                  </View>
                ) : null;
              })}
            </View>
          ) : null;

        case "books":
          return data?.books && data.books.length > 0 ? (
            <View style={styles.chipsContainer}>
              {data.books.map((book, index) => (
                <View
                  key={`book-${index}`}
                  style={[styles.chip, styles.bookChip]}
                >
                  <View>
                    <Text
                      style={styles.bookTitle}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      📚 {book}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null;

        default:
          return null;
      }
    }, [type, data, theme, styles]);

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={icon}
              size={18}
              color={theme.colors.primary}
            />
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>

        {type === "about" && data?.aboutMe ? (
          <Text style={styles.aboutText}>{data.aboutMe}</Text>
        ) : (
          renderChips
        )}
      </View>
    );
  }
);
