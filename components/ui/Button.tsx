import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";

interface ButtonProps {
    onPress: () => void;
    title?: string;
    loading?: boolean;
    iconName?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    iconSize?: number;
    bgColor?: string;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
    onPress,
    title,
    loading = false,
    iconName,
    iconColor,
    iconSize,
    bgColor,
    disabled = false,
    style,
    textStyle,
}) => {
    const theme = useTheme();

    return (
        <TouchableOpacity
            style={[
                styles.button,
                { backgroundColor: disabled ? theme.colors.textMuted : (bgColor || theme.colors.primary) },
                disabled && styles.buttonDisabled,
                style,
            ]}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={disabled || loading}
        >
            {loading ? (
                <ActivityIndicator size="small" color={theme.colors.text} />
            ) : (
                <>
                    {title && (
                        <Text
                            style={[
                                styles.buttonText,
                                { color: theme.colors.text },
                                textStyle,
                            ]}
                        >
                            {title}
                        </Text>
                    )}
                    {iconName && (
                        <Ionicons
                            name={iconName}
                            size={iconSize || 20}
                            color={iconColor || theme.colors.text}
                        />
                    )}
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 24,
        gap: 8,
    },
    buttonDisabled: {
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "600",
    },
});