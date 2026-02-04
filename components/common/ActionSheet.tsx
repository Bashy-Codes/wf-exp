import { forwardRef, useImperativeHandle, useState, useCallback } from "react"
import { StyleSheet, Modal, View, TouchableOpacity, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "@/lib/Theme"

export interface ActionSheetOption {
  id: string
  title: string
  icon: string
  color?: string
  onPress: () => void
}

interface ActionSheetProps {
  options: ActionSheetOption[]
}

export interface ActionSheetRef {
  present: () => void
  dismiss: () => void
}

export const ActionSheet = forwardRef<ActionSheetRef, ActionSheetProps>(({ options }, ref) => {
  const theme = useTheme()
  const [visible, setVisible] = useState(false)

  useImperativeHandle(ref, () => ({
    present: () => setVisible(true),
    dismiss: () => setVisible(false),
  }), [])

  const handleClose = useCallback(() => {
    setVisible(false)
  }, [])

  const handleOptionPress = useCallback((option: ActionSheetOption) => {
    option.onPress()
    handleClose()
  }, [handleClose])

  const styles = StyleSheet.create({
    modal: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      justifyContent: "flex-end",
    },
    container: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      padding: 24,
      paddingBottom: 72,
      gap: 12,
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 18,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
      gap: 12,
    },
    optionText: {
      fontSize: 16,
      fontWeight: "500",
    },
  })

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.modal}
        activeOpacity={1}
        onPress={handleClose}
      >
        <View style={styles.container}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.option}
              onPress={() => handleOptionPress(option)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={option.icon as any}
                size={20}
                color={option.color || theme.colors.text}
              />
              <Text
                style={[
                  styles.optionText,
                  { color: option.color || theme.colors.text }
                ]}
              >
                {option.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  )
});