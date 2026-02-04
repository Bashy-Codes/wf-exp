import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuthActions } from "@convex-dev/auth/react";
import Toast from "react-native-toast-message";
import { OtpInput } from "@/components/ui/OtpInput";
import { useTheme } from "@/lib/Theme";
import { useTranslation } from "react-i18next";
import { KeyboardHandler } from "@/components/KeyboardHandler";
import { Button } from "@/components/ui/Button";

const { width } = Dimensions.get("window");

export default function OtpVerificationScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { signIn } = useAuthActions();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (code.length < 6) {
      Toast.show({
        type: "error",
        text1: t("errorToasts.invalidOTP")
      });
      return;
    }

    setLoading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("code", code);
      formDataObj.append("flow", "email-verification");
      formDataObj.append("email", email || "");

      await signIn("password", formDataObj);
      router.replace("/screens/create-profile");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("errorToasts.invalidOTP")
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardHandler>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{t("auth.verifyEmail")}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {t("auth.enterCode")} {email}
            </Text>

            <View style={styles.otpContainer}>
              <OtpInput
                numberOfDigits={6}
                onTextChange={setCode}
                autoFocus={true}
              />
            </View>

            <Button
              iconName="checkmark"
              onPress={handleVerify}
              disabled={code.length < 6}
              loading={loading}
            />
          </View>
        </ScrollView>
      </KeyboardHandler>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    marginBottom: 24,
  },
  otpContainer: {
    marginBottom: 24,
  },

  button: {
    borderRadius: 26,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: "#A0A0A0",
    shadowOpacity: 0,
    elevation: 0,
  },
});
