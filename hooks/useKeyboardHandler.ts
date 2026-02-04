import { useEffect, useState, useRef } from 'react';
import {
  Keyboard,
  Platform,
  KeyboardEvent,
  EmitterSubscription
} from 'react-native';

interface KeyboardInfo {
  keyboardHeight: number;
  isKeyboardVisible: boolean;
  keyboardAnimationDuration: number;
}

/**
 * Custom hook to handle keyboard events properly without the bottom gap issue
 * This is a native React Native solution that doesn't rely on third-party packages
 */
export const useKeyboardHandler = (): KeyboardInfo => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardAnimationDuration, setKeyboardAnimationDuration] = useState(250);

  // Use refs to prevent stale closures
  const keyboardHeightRef = useRef(0);
  const isKeyboardVisibleRef = useRef(false);

  useEffect(() => {
    let keyboardWillShowListener: EmitterSubscription;
    let keyboardWillHideListener: EmitterSubscription;
    let keyboardDidShowListener: EmitterSubscription;
    let keyboardDidHideListener: EmitterSubscription;

    const handleKeyboardWillShow = (event: KeyboardEvent) => {
      const { height } = event.endCoordinates;
      const { duration } = event;
      setKeyboardAnimationDuration(duration || 250);

      // Only update if height actually changed to prevent unnecessary re-renders
      if (keyboardHeightRef.current !== height) {
        keyboardHeightRef.current = height;
        setKeyboardHeight(height);
      }

      if (!isKeyboardVisibleRef.current) {
        isKeyboardVisibleRef.current = true;
        setIsKeyboardVisible(true);
      }
    };

    const handleKeyboardWillHide = (event: KeyboardEvent) => {
      const { duration } = event;
      setKeyboardAnimationDuration(duration || 250);

      // Immediately set height to 0 to prevent gap
      keyboardHeightRef.current = 0;
      setKeyboardHeight(0);

      if (isKeyboardVisibleRef.current) {
        isKeyboardVisibleRef.current = false;
        setIsKeyboardVisible(false);
      }
    };

    const handleKeyboardDidShow = (event: KeyboardEvent) => {
      const { height } = event.endCoordinates;

      // Ensure state is consistent
      if (keyboardHeightRef.current !== height) {
        keyboardHeightRef.current = height;
        setKeyboardHeight(height);
      }

      if (!isKeyboardVisibleRef.current) {
        isKeyboardVisibleRef.current = true;
        setIsKeyboardVisible(true);
      }
    };

    const handleKeyboardDidHide = () => {
      // Force reset to prevent any lingering padding
      keyboardHeightRef.current = 0;
      setKeyboardHeight(0);

      if (isKeyboardVisibleRef.current) {
        isKeyboardVisibleRef.current = false;
        setIsKeyboardVisible(false);
      }
    };

    if (Platform.OS === 'ios') {
      // iOS has reliable will/did events
      keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', handleKeyboardWillShow);
      keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', handleKeyboardWillHide);
      keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
      keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);
    } else {
      // Android only has did events reliably
      keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
      keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);
    }

    return () => {
      keyboardWillShowListener?.remove();
      keyboardWillHideListener?.remove();
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  return {
    keyboardHeight,
    isKeyboardVisible,
    keyboardAnimationDuration,
  };
};

/**
 * Alternative hook that provides a safe keyboard height that prevents bottom gaps
 */
export const useSafeKeyboardHeight = (): number => {
  const [safeKeyboardHeight, setSafeKeyboardHeight] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const handleKeyboardShow = (event: KeyboardEvent) => {
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setSafeKeyboardHeight(event.endCoordinates.height);
    };

    const handleKeyboardHide = () => {
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Immediately reset to prevent gap
      setSafeKeyboardHeight(0);
    };

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showListener = Keyboard.addListener(showEvent, handleKeyboardShow);
    const hideListener = Keyboard.addListener(hideEvent, handleKeyboardHide);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return safeKeyboardHeight;
};
