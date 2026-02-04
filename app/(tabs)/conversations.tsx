import { useState, useCallback } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/lib/Theme";
import { TabView, TabBar } from "react-native-tab-view";
import { useTranslation } from "react-i18next";

import { TabHeader } from "@/components/TabHeader";
import { ConversationsSection } from "@/components/conversations/ConversationsSection";
import { GroupsSection } from "@/components/conversations/GroupsSection";

export default function ConversationsTab() {
  const theme = useTheme();
  const { t } = useTranslation();
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "conversations", title: t("sectionsTitles.conversations") },
    { key: "groups", title: t("sectionsTitles.groups") },
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

  const renderScene = useCallback(({ route }: any) => {
    switch (route.key) {
      case "conversations":
        return <ConversationsSection />;
      case "groups":
        return <GroupsSection />;
      default:
        return null;
    }
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <TabHeader title={t("screenTitles.conversations")} />

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
        swipeEnabled={true}
      />
    </SafeAreaView>
  );
}