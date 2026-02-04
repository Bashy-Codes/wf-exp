import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";
import { getCommunityGuidelines } from "@/constants/guidelines";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Button } from "@/components/ui/Button";

const GuidelinesScreen = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [isAccepted, setIsAccepted] = useState(false);

  const COMMUNITY_GUIDELINES = getCommunityGuidelines(t);

  const handleSignup = () => {
    router.push("./authentication");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["bottom", "left", "right"]}
    >
      <ScreenHeader title={t("screenTitles.communityGuidelines")} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.introContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <View style={styles.introContent}>
            <Ionicons
              name="shield-checkmark"
              size={48}
              color={theme.colors.primary}
            />
            <Text style={[styles.introTitle, { color: theme.colors.text }]}>
              {t("guidelinesScreen.safeCommunityStandards")}
            </Text>
            <Text
              style={[
                styles.introDescription,
                { color: theme.colors.textSecondary },
              ]}
            >
              {t("guidelinesScreen.introDescription")}
            </Text>
          </View>
        </View>

        <View style={styles.guidelinesContainer}>
          {COMMUNITY_GUIDELINES.map((guideline) => (
            <View
              key={guideline.id}
              style={[
                styles.guidelineItem,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <View
                style={[
                  styles.guidelineIcon,
                  { backgroundColor: theme.colors.primary + "15" },
                ]}
              >
                <Ionicons
                  name={guideline.icon as any}
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.guidelineContent}>
                <Text
                  style={[styles.guidelineTitle, { color: theme.colors.text }]}
                >
                  {guideline.title}
                </Text>
                <Text
                  style={[
                    styles.guidelineDescription,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {guideline.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setIsAccepted(!isAccepted)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: isAccepted
                    ? theme.colors.primary
                    : "transparent",
                  borderColor: theme.colors.primary,
                },
              ]}
            >
              {isAccepted && (
                <Ionicons
                  name="checkmark"
                  size={18}
                  color={theme.colors.white}
                />
              )}
            </View>
            <Text style={[styles.checkboxText, { color: theme.colors.text }]}>
              {t("guidelinesScreen.agreement")}
            </Text>
          </TouchableOpacity>

          <Button
            iconName="arrow-forward"
            title={t("common.continue")}
            onPress={handleSignup}
            disabled={!isAccepted}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  introContainer: {
    borderRadius: 20,
    marginBottom: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  introContent: {
    padding: 24,
    alignItems: "center",
  },
  introTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  introDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    opacity: 0.8,
  },
  guidelinesContainer: {
    gap: 12,
  },
  guidelineItem: {
    flexDirection: "row",
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
  guidelineIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  guidelineContent: {
    flex: 1,
  },
  guidelineTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    lineHeight: 22,
  },
  guidelineDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  bottomContainer: {
    paddingVertical: 20,
    marginTop: 20,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkboxText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
});

export default GuidelinesScreen;
