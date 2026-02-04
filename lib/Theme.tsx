import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, themes, ThemeMode } from '@/constants/themes';

// Theme context interface
interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  isLoading: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

// Create theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Storage key for theme persistence
const THEME_STORAGE_KEY = 'theme-storage';

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode;
}

// Theme provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Get current theme based on themeMode state
  const theme = themes[themeMode];

  // Load theme preference from storage on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme) {
          const parsed = JSON.parse(storedTheme);
          if (parsed.themeMode && themes[parsed.themeMode as ThemeMode]) {
            setThemeModeState(parsed.themeMode);
          }
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };

    loadThemePreference();
  }, []);

  // Save theme preference to storage
  const saveThemePreference = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(
        THEME_STORAGE_KEY,
        JSON.stringify({ themeMode: mode })
      );
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Toggle theme function
  const toggleTheme = () => {
    const newMode = themeMode === 'dark' ? 'threads' : 'dark';
    setThemeModeState(newMode);
    saveThemePreference(newMode);
  };

  // Set theme function
  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    saveThemePreference(mode);
  };

  const contextValue: ThemeContextType = {
    theme,
    themeMode,
    isLoading,
    toggleTheme,
    setThemeMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

// Individual hooks for backward compatibility
export const useTheme = (): Theme => {
  const { theme } = useThemeContext();
  return theme;
};

export const useIsDark = (): boolean => {
  const { theme } = useThemeContext();
  return theme.isDark;
};

export const useThemeLoading = (): boolean => {
  const { isLoading } = useThemeContext();
  return isLoading;
};

export const useThemeActions = () => {
  const { toggleTheme, setThemeMode } = useThemeContext();
  return { toggleTheme, setThemeMode };
};

// Export theme objects for direct access if needed
export { darkTheme, threadsTheme, midnightTheme, oceanTheme, forestTheme } from '@/constants/themes';
export type { Theme } from '@/constants/themes';
