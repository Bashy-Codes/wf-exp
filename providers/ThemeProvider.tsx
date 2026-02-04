import React from "react";
import { ThemeProvider as NavigationThemeProvider } from "@react-navigation/native";
import { ThemeProvider, useTheme } from "@/lib/Theme";

interface AppThemeProviderProps {
  children: React.ReactNode;
}

function NavigationThemeWrapper({ children }: { children: React.ReactNode }) {
  const theme = useTheme();

  const navigationTheme = {
    dark: theme.isDark,
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.notification,
    },
    fonts: {
      regular: {
        fontFamily: "System",
        fontWeight: "400" as const,
      },
      medium: {
        fontFamily: "System",
        fontWeight: "500" as const,
      },
      bold: {
        fontFamily: "System",
        fontWeight: "700" as const,
      },
      heavy: {
        fontFamily: "System",
        fontWeight: "900" as const,
      },
    },
  };

  return (
    <NavigationThemeProvider value={navigationTheme}>
      {children}
    </NavigationThemeProvider>
  );
}

export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <NavigationThemeWrapper>
        {children}
      </NavigationThemeWrapper>
    </ThemeProvider>
  );
};
