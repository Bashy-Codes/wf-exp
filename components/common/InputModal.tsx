import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useTheme } from '@/lib/Theme';
import { WFModal } from '../ui/WFModal';
import { getCounterColor } from '@/utils/common';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardHandler } from '../KeyboardHandler';

interface InputModalProps {
  visible: boolean;
  title: string;
  headerIcon?: keyof typeof Ionicons.glyphMap;
  inputPlaceholder: string;
  maxCharacters: number;
  onSubmit: (text: string) => void;
  onCancel: () => void;
  initialValue?: string;
  loading?: boolean;
}

export const InputModal: React.FC<InputModalProps> = ({
  visible,
  title,
  headerIcon,
  inputPlaceholder,
  maxCharacters,
  onSubmit,
  onCancel,
  initialValue = '',
  loading = false,
}) => {
  const theme = useTheme();
  const [inputText, setInputText] = useState(initialValue);
  const inputRef = useRef<TextInput>(null);

  const characterCount = inputText.length;
  const canSubmit = inputText.trim().length > 0 && characterCount <= maxCharacters;

  useEffect(() => {
    if (visible) {
      // Reset input text
      setInputText(initialValue);
      // Focus input after animation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 360);
    }
  }, [visible, initialValue]);

  const handleSubmit = () => {
    if (canSubmit) {
      onSubmit(inputText.trim());
      setInputText('');
    }
  };

  const handleCancel = () => {
    setInputText('');
    onCancel();
  };



  const styles = StyleSheet.create({
    inputContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      minHeight: 120,
      position: 'relative',
    },
    textInput: {
      fontSize: 16,
      color: theme.colors.text,
      textAlignVertical: 'top',
      flex: 1,
    },
    counter: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      fontSize: 12,
      fontWeight: '500',
      color: getCounterColor(characterCount, 0, maxCharacters, theme),
    },
  });

  return (
    <WFModal
      visible={visible}
      onClose={handleCancel}
      onConfirm={handleSubmit}
      title={title}
      headerIcon={headerIcon}
      confirmIcon='send'
      loading={loading}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder={inputPlaceholder}
          placeholderTextColor={theme.colors.textMuted}
          selectionColor={theme.colors.primary}
          maxLength={maxCharacters}
          multiline
          textAlignVertical="top"
        />
        <Text style={styles.counter}>
          {characterCount}/{maxCharacters}
        </Text>
      </KeyboardAvoidingView>
    </WFModal>
  );
};
