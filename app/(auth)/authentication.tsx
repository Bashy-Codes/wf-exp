import { useState } from "react"
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useAuthActions } from "@convex-dev/auth/react"
import { Ionicons } from "@expo/vector-icons"
import { signUpSchema, signInSchema, type SignUpFormData, type SignInFormData } from "@/validations/auth"
import { useTheme } from "@/lib/Theme"
import { KeyboardHandler } from "@/components/KeyboardHandler"
import { Button } from "@/components/ui/Button"
import { useTranslation } from "react-i18next"
import { makeRedirectUri } from "expo-auth-session"
import { openAuthSessionAsync } from "expo-web-browser"
import { useConvex } from "convex/react"
import Toast from "react-native-toast-message"

type AuthMode = "login" | "signup"

interface AuthFormData extends SignUpFormData { }

interface FieldValidation {
  email: "none" | "valid" | "error"
  password: "none" | "valid" | "error"
  confirmPassword: "none" | "valid" | "error"
}

export default function AuthenticationScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { signIn } = useAuthActions()
  const convex = useConvex()

  const [mode, setMode] = useState<AuthMode>("login")
  const [formData, setFormData] = useState<AuthFormData>({
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<AuthFormData>>({})
  const [fieldValidation, setFieldValidation] = useState<FieldValidation>({
    email: "none",
    password: "none",
    confirmPassword: "none",
  })
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)

  const isSignupMode = mode === "signup"

  const validateForm = () => {
    try {
      if (isSignupMode) {
        signUpSchema.parse(formData)
      } else {
        const loginData: SignInFormData = {
          email: formData.email,
          password: formData.password,
        }
        signInSchema.parse(loginData)
      }
      setErrors({})
      return true
    } catch (error: any) {
      const fieldErrors: Partial<AuthFormData> = {}
      error.errors?.forEach((err: any) => {
        if (err.path?.[0]) {
          fieldErrors[err.path[0] as keyof AuthFormData] = err.message
        }
      })
      setErrors(fieldErrors)
      return false
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      Toast.show({
        type: "error",
        text1: t("errorToasts.validationError")
      })
      return
    }

    setLoading(true)
    try {
      const formDataObj = new FormData()
      formDataObj.append("email", formData.email)
      formDataObj.append("password", formData.password)
      formDataObj.append("flow", isSignupMode ? "signUp" : "signIn")

      await signIn("password", formDataObj)

      if (isSignupMode) {
        router.push({
          pathname: "./otp-verification",
          params: { email: formData.email }
        })
      } else {
        router.replace("/(tabs)")
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("errorToasts.genericError")
      })
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: keyof AuthFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }

    if (field === "email") {
      updateEmailValidation(value)
    } else if (field === "password") {
      updatePasswordValidation(value)
    } else if (field === "confirmPassword") {
      updateConfirmPasswordValidation(value)
    }
  }

  const updateEmailValidation = (value: string) => {
    if (value.length === 0) {
      setFieldValidation((prev) => ({ ...prev, email: "none" }))
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      setFieldValidation((prev) => ({
        ...prev,
        email: emailRegex.test(value) ? "valid" : "error",
      }))
    }
  }

  const updatePasswordValidation = (value: string) => {
    if (value.length === 0) {
      setFieldValidation((prev) => ({ ...prev, password: "none" }))
    } else {
      const isValid = isSignupMode
        ? value.length >= 6 && !/\s/.test(value)
        : value.length >= 6
      setFieldValidation((prev) => ({
        ...prev,
        password: isValid ? "valid" : "error",
      }))
    }

    if (isSignupMode && formData.confirmPassword.length > 0) {
      setFieldValidation((prev) => ({
        ...prev,
        confirmPassword: value === formData.confirmPassword ? "valid" : "error",
      }))
    }
  }

  const updateConfirmPasswordValidation = (value: string) => {
    if (value.length === 0) {
      setFieldValidation((prev) => ({ ...prev, confirmPassword: "none" }))
    } else {
      setFieldValidation((prev) => ({
        ...prev,
        confirmPassword: value === formData.password ? "valid" : "error",
      }))
    }
  }

  const switchMode = () => {
    setMode(mode === "login" ? "signup" : "login")
    setErrors({})
    setFormData({ email: "", password: "", confirmPassword: "" })
    setFieldValidation({ email: "none", password: "none", confirmPassword: "none" })
  }

  const renderInput = (
    field: keyof AuthFormData,
    placeholder: string,
    keyboardType?: "email-address" | "default",
  ) => {
    const showValidation = fieldValidation[field] !== "none"
    const isValid = fieldValidation[field] === "valid"

    return (
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.background,
                color: theme.colors.text
              },
              errors[field] && styles.inputError,
            ]}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textMuted}
            value={formData[field]}
            onChangeText={(text) => updateField(field, text)}
            keyboardType={keyboardType}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {showValidation && (
            <View style={styles.validationIcon}>
              <Ionicons
                name={isValid ? "checkmark-circle" : "close-circle"}
                size={20}
                color={isValid ? theme.colors.success : theme.colors.error}
              />
            </View>
          )}
        </View>
        {errors[field] && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {errors[field]}
          </Text>
        )}
      </View>
    )
  }

  const handleGoogleAuth = async () => {
    setOauthLoading("google")
    try {
      const redirectTo = makeRedirectUri()
      const { redirect } = await signIn("google", { redirectTo })

      if (Platform.OS === "web") {
        return
      }

      const result = await openAuthSessionAsync(redirect!.toString(), redirectTo)

      if (result.type === "success") {
        const { url } = result
        const code = new URL(url).searchParams.get("code")!
        await signIn("google", { code })
        router.replace("/screens/create-profile")
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t("errorToasts.genericError")
      })
    } finally {
      setOauthLoading(null)
    }
  }

  const handleAppleAuth = () => {
    Toast.show({
      type: "info",
      text1: "Apple Sign-In will be available soon",
    })
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardHandler enabled={true}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {isSignupMode ? t("auth.signupTitle") : t("auth.loginTitle")}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {isSignupMode ? t("auth.signupSubTitle") : t("auth.loginSubTitle")}
            </Text>

            {renderInput("email", t("auth.email"), "email-address")}
            {renderInput("password", t("auth.password"), "default")}
            {isSignupMode && renderInput("confirmPassword", t("auth.confirmPassword"), "default")}

            <Button
              title={t("common.continue")}
              onPress={handleSubmit}
              loading={loading}
            />
          </View>

          <View style={styles.oauthContainer}>
            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              <Text style={[styles.dividerText, { color: theme.colors.textMuted }]}>{t("auth.orContinueWith")}</Text>
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            </View>

            <View style={styles.oauthButtons}>
              <TouchableOpacity
                style={[styles.oauthButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                onPress={handleGoogleAuth}
                disabled={oauthLoading !== null}
              >
                {oauthLoading === "google" ? (
                  <ActivityIndicator />
                ) : (
                  <Ionicons name="logo-google" size={20} color={theme.colors.success} />
                )}
                <Text style={[styles.oauthButtonText, { color: theme.colors.text }]}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.oauthButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, opacity: 0.6 }]}
                onPress={handleAppleAuth}
              >
                <Ionicons name="logo-apple" size={20} color={theme.colors.success} />
                <Text style={[styles.oauthButtonText, { color: theme.colors.text }]}>Apple</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.linkButton}>
            <Text style={[styles.linkText, { color: theme.colors.textSecondary }]}>
              {isSignupMode ? t("auth.alreadyHaveAccountCTA") : t("auth.noAccountCTA")}
              <Text
                style={[styles.linkTextBold, { color: theme.colors.primary }]}
                onPress={switchMode}
              >
                {isSignupMode ? t("auth.signIn") : t("auth.signUp")}
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardHandler>
    </SafeAreaView>
  )
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
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 50,
    fontSize: 16,
    fontWeight: "500",
  },
  validationIcon: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  inputError: {
    borderColor: "#FF3B30",
    backgroundColor: "#FFF5F5",
  },
  errorText: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
    marginLeft: 4,
  },
  linkButton: {
    alignItems: "center",
    paddingVertical: 16,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "400",
  },
  linkTextBold: {
    fontWeight: "600",
  },
  oauthContainer: {
    marginTop: 24,
    marginHorizontal: 8,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: "500",
    marginHorizontal: 12,
  },
  oauthButtons: {
    flexDirection: "row",
    gap: 12,
  },
  oauthButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  oauthButtonText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  }
})
