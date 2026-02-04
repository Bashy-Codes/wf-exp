import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="guidelines" />
      <Stack.Screen name="authentication" />
      <Stack.Screen name="otp-verification" />
      <Stack.Screen name="app-info" />
    </Stack>
  );
}
