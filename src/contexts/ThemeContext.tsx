import React, { createContext, useContext, useState, useEffect } from "react";

export interface Theme {
  isDark: boolean;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    card: string;
    notification: string;
    error: string;
    success: string;
    warning: string;
    tabBar: string;
    tabBarActive: string;
    tabBarInactive: string;
  };
  gradients: {
    primary: [string, string];
    secondary: [string, string];
    accent: [string, string];
    header: [string, string];
  };
}

export const lightTheme: Theme = {
  isDark: false,
  colors: {
    primary: "#4f46e5",
    secondary: "#7c3aed",
    background: "#fafafa",
    surface: "#ffffff",
    text: "#1a1a1a",
    textSecondary: "#6b7280",
    border: "#e2e8f0",
    card: "#ffffff",
    notification: "#dc2626",
    error: "#dc2626",
    success: "#059669",
    warning: "#d97706",
    tabBar: "#ffffff",
    tabBarActive: "#4f46e5",
    tabBarInactive: "#94a3b8",
  },
  gradients: {
    primary: ["#4f46e5", "#7c3aed"],
    secondary: ["#7c3aed", "#a855f7"],
    accent: ["#0891b2", "#4f46e5"],
    header: ["#ffffff", "#fafafa"],
  },
};

export const darkTheme: Theme = {
  isDark: true,
  colors: {
    primary: "#6366f1",
    secondary: "#8b5cf6",
    background: "#0f172a",
    surface: "#1e293b",
    text: "#f1f5f9",
    textSecondary: "#94a3b8",
    border: "#334155",
    card: "#1e293b",
    notification: "#ef4444",
    error: "#ef4444",
    success: "#10b981",
    warning: "#f59e0b",
    tabBar: "#1e293b",
    tabBarActive: "#6366f1",
    tabBarInactive: "#64748b",
  },
  gradients: {
    primary: ["#4338ca", "#7c3aed"],
    secondary: ["#7c3aed", "#a855f7"],
    accent: ["#0891b2", "#4338ca"],
    header: ["#0f172a", "#1e293b"],
  },
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    setIsDark(true);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
