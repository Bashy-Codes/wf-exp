import React, { ReactNode } from 'react';
import {
  View,
  Platform,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useSafeKeyboardHeight } from '@/hooks/useKeyboardHandler';

interface KeyboardHandlerProps {
  children: ReactNode;
  style?: ViewStyle;
  enabled?: boolean;
  behavior?: 'padding' | 'height' | 'position';
  keyboardVerticalOffset?: number;
}

/**
 *  Wrapper that handles keyboard for Android and iOS
 */
export const KeyboardHandler: React.FC<KeyboardHandlerProps> = ({
  children,
  style,
  enabled = true,
  keyboardVerticalOffset = 0,
}) => {
  const keyboardHeight = useSafeKeyboardHeight();

  if (!enabled) {
    return <View style={style}>{children}</View>;
  }

  const containerStyle: ViewStyle = {
    flex: 1,
    ...StyleSheet.flatten(style),
    ...(Platform.OS === 'ios' && keyboardHeight > 0
      ? { paddingBottom: Math.max(0, keyboardHeight - keyboardVerticalOffset) }
      : {}),
    ...(Platform.OS === 'android' && keyboardHeight > 0
      ? { marginBottom: Math.max(0, keyboardHeight - keyboardVerticalOffset) }
      : {}),
  };

  return <View style={containerStyle}>{children}</View>;
};
