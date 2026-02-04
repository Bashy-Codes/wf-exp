import { Authenticated } from "convex/react";
import { Stack } from "expo-router";

export default function ScreensLayout() {
  return (
    <Authenticated>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="create-profile" />
        <Stack.Screen name="create-post" />

        <Stack.Screen name="notifications" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="report" />
        <Stack.Screen name="user-profile/[id]" />
        <Stack.Screen name="post/[id]" />
        <Stack.Screen name="conversation/[id]" />
        <Stack.Screen name="group/[id]" />
        <Stack.Screen name="collection/[id]" />
      </Stack>
    </Authenticated>
  );
}
