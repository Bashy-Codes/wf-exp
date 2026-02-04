import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { Redirect } from "expo-router";
import { StyleSheet, View, ActivityIndicator, Image, Text } from "react-native";
import { useTheme } from "@/lib/Theme";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

export default function Index() {
  const theme = useTheme();

  useEffect(() => {
    SplashScreen.hide();
  }, []);

  const AppLoading = () => (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}>
      <View style={[styles.logoContainer, { backgroundColor: theme.colors.surface }]}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
        />
      </View>
      <Text style={[styles.appName, { color: theme.colors.text }]}>WorldFriends</Text>
      <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
    </View>
  );

  return (
    <>
      <AuthLoading>
        <AppLoading />
      </AuthLoading>

      <Unauthenticated>
        <Redirect href="/(auth)" />
      </Unauthenticated>

      <Authenticated>
        <Redirect href="/(tabs)" />
      </Authenticated>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    width: 120,
    height: 120,
  },
  appName: {
    fontSize: 32,
    fontWeight: "600",
    marginBottom: 32,
  },
  loader: {
    marginTop: 8,
  },
});
