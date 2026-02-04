import { useState, useCallback } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { TabView, TabBar } from "react-native-tab-view";

import { TabHeader } from "@/components/TabHeader";
import { FriendsSection } from "@/components/friends/FriendsSection";
import { RequestsSection } from "@/components/friends/RequestsSection";

export default function FriendsTab() {
  const theme = useTheme();
  const { t } = useTranslation();
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "friends", title: t("sectionsTitles.friends") },
    { key: "requests", title: t("sectionsTitles.requests") },
  ]);

  const renderTabBar = useCallback(
    (props: any) => (
      <TabBar
        {...props}
        indicatorStyle={{ backgroundColor: theme.colors.primary }}
        style={{ backgroundColor: theme.colors.background }}
        activeColor={theme.colors.primary}
        inactiveColor={theme.colors.textSecondary}
        labelStyle={{ fontWeight: "600", textTransform: "none" }}
      />
    ),
    [theme]
  );

  const renderScene = useCallback(
    ({ route }: any) => {
      switch (route.key) {
        case "friends":
          return <FriendsSection />;
        case "requests":
          return <RequestsSection />;
        default:
          return null;
      }
    },
    []
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <TabHeader title={t("screenTitles.friends")} />
      <View style={styles.content}>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={renderTabBar}
        />
      </View>
    </SafeAreaView>
  );
}
