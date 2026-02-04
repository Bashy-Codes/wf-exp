import { Tabs } from "expo-router";
import { Authenticated } from "convex/react";
import { BottomTabBar } from "@/components/BottomTabBar";

export default function TabLayout() {
  return (
    <Authenticated>
      <Tabs tabBar={(props) => <BottomTabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="discover" />
        <Tabs.Screen name="friends" />
        <Tabs.Screen name="conversations" />

        <Tabs.Screen name="profile" />
      </Tabs>
    </Authenticated>
  );
}
