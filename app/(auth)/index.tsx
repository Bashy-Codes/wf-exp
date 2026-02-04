import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";
import { LanguagePicker, LanguagePickerRef } from "@/components/LanguagePicker";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  getCurrentLanguage,
  SupportedLanguageCode,
} from "@/lib/i18n";
import { Button } from "@/components/ui/Button";

const OnboardingScreen = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const languagePickerRef = useRef<LanguagePickerRef>(null);
  const [currentLanguage, setCurrentLanguage] =
    useState<SupportedLanguageCode>(getCurrentLanguage());

  const handleInfoPress = () => {
    router.push("./app-info");
  };

  const handleLanguagePicker = useCallback(() => {
    languagePickerRef.current?.present();
  }, []);

  const handleLanguageChange = useCallback(
    (languageCode: SupportedLanguageCode) => {
      setCurrentLanguage(languageCode);
    }, []
  );

  const handleReadGuidelines = () => {
    router.push("./guidelines");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top", "bottom", "left", "right"]}
    >
      {/* Header with Info and Language Picker */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.headerButton,
            { backgroundColor: theme.colors.surface },
          ]}
          onPress={handleInfoPress}
          activeOpacity={0.7}
        >
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.headerButton,
            { backgroundColor: theme.colors.surface },
          ]}
          onPress={handleLanguagePicker}
          activeOpacity={0.7}
        >
          <Ionicons
            name="language-outline"
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo/Icon Section */}
        <View style={styles.logoContainer}>
          <View style={[styles.logoWrapper, { backgroundColor: theme.colors.primaryLight + "20", borderRadius: theme.borderRadius.full }]}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {[
            {
              icon: "people-outline",
              title: t("onboarding.globalConnections.title"),
              description: t("onboarding.globalConnections.description"),
            },
            {
              icon: "language-outline",
              title: t("onboarding.languageExchange.title"),
              description: t("onboarding.languageExchange.description"),
            },
            {
              icon: "chatbubbles-outline",
              title: t("onboarding.culturalDiscovery.title"),
              description: t("onboarding.culturalDiscovery.description"),
            },
          ].map((feature, index) => (
            <View
              key={index}
              style={[
                styles.featureItem,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: theme.colors.primaryLight + "20" },
                ]}
              >
                <Ionicons
                  name={feature.icon as any}
                  size={28}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.featureContent}>
                <Text
                  style={[styles.featureTitle, { color: theme.colors.text }]}
                >
                  {feature.title}
                </Text>
                <Text
                  style={[
                    styles.featureDescription,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <Button
          iconName="chevron-forward"
          onPress={handleReadGuidelines}
          title={t("onboarding.readGuidelines")}
        />
      </View>

      {/* Language Picker */}
      <LanguagePicker
        ref={languagePickerRef}
        onLanguageChange={handleLanguageChange}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  logoWrapper: {
    width: 140,
    height: 140,
    justifyContent: "center",
    alignItems: "center"
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  featuresContainer: {
    width: "100%",
    gap: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 10,
  },
});

export default OnboardingScreen;
