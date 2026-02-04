import React from "react";
import { View, Text, StyleSheet, ScrollView, Linking, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/lib/Theme";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";

export const AppInfoComponent = () => {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["left", "right", "bottom"]}>
      <ScreenHeader title="Platform Information" />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.primary}15` }]}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            WorldFriends
          </Text>
        </View>

        {/* Convex Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Proudly Sponsered By
          </Text>
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.imageContainer, { backgroundColor: "#eeeeeeff" }]}>
              <Image
                source={{ uri: "https://storage.worldfriends.app/convex-logo.png" }}
                style={styles.convexImage}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.cardText, { color: theme.colors.text }]}>
              Reactive Backend as a Service Platform
            </Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={20} color={theme.colors.error} />
              <Text style={[styles.locationText, { color: theme.colors.textMuted }]}>
                San Francisco, California 🇺🇸
              </Text>
            </View>
            <Button
              iconName="arrow-forward"
              onPress={() => Linking.openURL("https://convex.dev")}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            About This Platform
          </Text>
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.cardText, { color: theme.colors.text }]}>
              WorldFriends is a passion project built by a dedicated student who believes in the power of global connections. This platform brings together people from different cultures, languages, and backgrounds.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
            Made with ❤️ by a student
          </Text>
          <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
            © 2025 WorldFriends • Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "center",
    paddingVertical: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoImage: {
    width: 56,
    height: 56,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    alignItems: "center",
    borderRadius: 48,
    padding: 10,
    marginBottom: 12,
  },
  convexImage: {
    width: 180,
    height: 80,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 4,
  },
});
