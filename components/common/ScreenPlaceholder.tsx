import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "@/lib/Theme"
import { SafeAreaView } from "react-native-safe-area-context"
import { ScreenHeader } from "../ScreenHeader"

interface ScreenPlaceholderProps {
  title: string
  description?: string
  icon: keyof typeof Ionicons.glyphMap;
  showButton?: boolean
  onButtonPress?: () => void
  buttonText?: string
}

export const ScreenPlaceholder: React.FC<ScreenPlaceholderProps> = ({
  title,
  description,
  icon,
  showButton = false,
  onButtonPress,
  buttonText,
}) => {
  const theme = useTheme()

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      paddingHorizontal: 40,
      justifyContent: "center",
      alignItems: "center",
      flex: 1,
    },
    icon: {
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.primary,
      textAlign: "center",
      marginBottom: description ? 12 : 30,
    },
    description: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginBottom: 30,
      lineHeight: 24,
    },
    Button: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: theme.borderRadius.lg,
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    createButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.white,
      textAlign: "center",
    },
  })

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <ScreenHeader title={title} />
      <View style={styles.contentContainer}>
        <Ionicons
          name={icon}
          size={64}
          color={theme.colors.primary}
          style={styles.icon}
        />
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}

        {showButton && onButtonPress && (
          <TouchableOpacity style={styles.Button} onPress={onButtonPress} activeOpacity={0.8}>
            <Text style={styles.createButtonText}>{buttonText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  )
}
