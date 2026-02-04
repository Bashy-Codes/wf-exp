// Theme interface definitions
export interface Theme {
  isDark: boolean;
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    borderLight: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    white: string;
    black: string;
    overlay: string;
    tabBar: string;
    tabBarActive: string;
    notification: string;
    shadow: string;
    surfaceSecondary: string;
    textTertiary: string;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
}


export const darkTheme: Theme = {
  isDark: true,
  colors: {
    primary: "#818CF8",
    primaryLight: "#A5B4FC",
    primaryDark: "#6366F1",
    secondary: "#F472B6",
    background: "#0F172A",
    surface: "#1E293B",
    card: "#334155",
    text: "#F1F5F9",
    textSecondary: "#CBD5E1",
    textMuted: "#94A3B8",
    border: "#475569",
    borderLight: "#334155",
    success: "#34D399",
    warning: "#FBBF24",
    error: "#F87171",
    info: "#60A5FA",
    white: "#FFFFFF",
    black: "#000000",
    overlay: "rgba(0, 0, 0, 0.7)",
    tabBar: "#1E293B",
    tabBarActive: "#818CF8",
    notification: "#F87171",
    shadow: "#000000",
    surfaceSecondary: "#334155",
    textTertiary: "#64748B",
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
};

export const threadsTheme: Theme = {
  isDark: true,
  colors: {
    primary: "#0095F6",
    primaryLight: "#1DA1F2",
    primaryDark: "#0077CC",
    secondary: "#EC4899",
    background: "#101010",
    surface: "#181818",
    card: "#242424",
    text: "#F5F5F5",
    textSecondary: "#A0A0A0",
    textMuted: "#777777",
    border: "#2A2A2A",
    borderLight: "#1F1F1F",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
    white: "#FFFFFF",
    black: "#000000",
    overlay: "rgba(0, 0, 0, 0.8)",
    tabBar: "#181818",
    tabBarActive: "#0095F6",
    notification: "#EF4444",
    shadow: "#000000",
    surfaceSecondary: "#242424",
    textTertiary: "#666666",
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
};

export const midnightTheme: Theme = {
  isDark: true,
  colors: {
    primary: "#8B5CF6",
    primaryLight: "#A78BFA",
    primaryDark: "#7C3AED",
    secondary: "#EC4899",
    background: "#0A0A0A",
    surface: "#1A1A1A",
    card: "#252525",
    text: "#FFFFFF",
    textSecondary: "#B0B0B0",
    textMuted: "#808080",
    border: "#2F2F2F",
    borderLight: "#222222",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
    white: "#FFFFFF",
    black: "#000000",
    overlay: "rgba(0, 0, 0, 0.85)",
    tabBar: "#1A1A1A",
    tabBarActive: "#8B5CF6",
    notification: "#EF4444",
    shadow: "#000000",
    surfaceSecondary: "#252525",
    textTertiary: "#707070",
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
};

export const oceanTheme: Theme = {
  isDark: true,
  colors: {
    primary: "#06B6D4",
    primaryLight: "#22D3EE",
    primaryDark: "#0891B2",
    secondary: "#EC4899",
    background: "#0C1821",
    surface: "#1A2632",
    card: "#243442",
    text: "#F0F9FF",
    textSecondary: "#BAE6FD",
    textMuted: "#7DD3FC",
    border: "#2D3E4F",
    borderLight: "#1F2D3A",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
    white: "#FFFFFF",
    black: "#000000",
    overlay: "rgba(12, 24, 33, 0.85)",
    tabBar: "#1A2632",
    tabBarActive: "#06B6D4",
    notification: "#EF4444",
    shadow: "#000000",
    surfaceSecondary: "#243442",
    textTertiary: "#67E8F9",
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
};

export const forestTheme: Theme = {
  isDark: true,
  colors: {
    primary: "#22C55E",
    primaryLight: "#4ADE80",
    primaryDark: "#16A34A",
    secondary: "#EC4899",
    background: "#0A1409",
    surface: "#162318",
    card: "#1F2F1E",
    text: "#F0FDF4",
    textSecondary: "#BBF7D0",
    textMuted: "#86EFAC",
    border: "#2A3F29",
    borderLight: "#1A2819",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
    white: "#FFFFFF",
    black: "#000000",
    overlay: "rgba(10, 20, 9, 0.85)",
    tabBar: "#162318",
    tabBarActive: "#22C55E",
    notification: "#EF4444",
    shadow: "#000000",
    surfaceSecondary: "#1F2F1E",
    textTertiary: "#6EE7B7",
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
};

export type ThemeMode = 'dark' | 'threads' | 'midnight' | 'ocean' | 'forest';

export const themes: Record<ThemeMode, Theme> = {
  dark: darkTheme,
  threads: threadsTheme,
  midnight: midnightTheme,
  ocean: oceanTheme,
  forest: forestTheme,
};
