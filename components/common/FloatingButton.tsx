import React from "react";
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";

interface FloatingButtonProps {
    onPress: () => void;
    iconName: keyof typeof Ionicons.glyphMap;
    position?: {
        bottom?: number;
        right?: number;
        top?: number;
        left?: number;
    };
    backgroundColor?: string;
    iconColor?: string;
    size?: number;
    style?: ViewStyle;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({
    onPress,
    iconName,
    position = { bottom: 12, right: 20 },
    backgroundColor,
    iconColor,
    size = 24,
    style,
}) => {
    const theme = useTheme();

    const styles = StyleSheet.create({
        button: {
            position: "absolute",
            width: 60,
            height: 60,
            borderRadius: 28,
            marginBottom: 20,
            backgroundColor: backgroundColor || theme.colors.primary,
            justifyContent: "center",
            alignItems: "center",
            ...position,
        },
    });

    return (
        <TouchableOpacity
            style={[styles.button, style]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Ionicons
                name={iconName}
                size={24}
                color={iconColor || theme.colors.white}
            />
        </TouchableOpacity>
    );
};