import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

interface ThemedCardProps {
  title: string;
  subtitle?: string;
  icon?: string;
  onPress?: () => void;
  children?: React.ReactNode;
  variant?: "default" | "elevated" | "outlined";
}

export const ThemedCard: React.FC<ThemedCardProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  children,
  variant = "default",
}) => {
  const { theme } = useTheme();

  const getVariantStyles = () => {
    const baseStyle = {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      padding: 16,
    };

    switch (variant) {
      case "elevated":
        return {
          ...baseStyle,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme.isDark ? 0.3 : 0.1,
          shadowRadius: 8,
          elevation: 4,
        };
      case "outlined":
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      default:
        return baseStyle;
    }
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent onPress={onPress} style={getVariantStyles()}>
      {/* Header */}
      <View style={styles.cardHeader}>
        {icon && (
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Ionicons
              name={icon as any}
              size={20}
              color={theme.colors.primary}
            />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                styles.cardSubtitle,
                { color: theme.colors.textSecondary },
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>
        {onPress && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textSecondary}
          />
        )}
      </View>

      {/* Content */}
      {children}
    </CardComponent>
  );
};

interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: string;
  disabled?: boolean;
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  icon,
  disabled = false,
}) => {
  const { theme } = useTheme();

  const getVariantStyles = () => {
    const baseStyle = {
      borderRadius: 12,
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    };

    switch (variant) {
      case "primary":
        return {
          ...baseStyle,
          backgroundColor: disabled
            ? theme.colors.border
            : theme.colors.primary,
        };
      case "secondary":
        return {
          ...baseStyle,
          backgroundColor: disabled
            ? theme.colors.border
            : theme.colors.secondary,
        };
      case "outline":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: theme.colors.primary,
        };
      case "ghost":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: theme.colors.primary,
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "outline":
        return theme.colors.primary;
      case "ghost":
        return theme.colors.text;
      default:
        return "#ffffff";
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return { paddingHorizontal: 12, paddingVertical: 8 };
      case "lg":
        return { paddingHorizontal: 24, paddingVertical: 16 };
      default:
        return { paddingHorizontal: 16, paddingVertical: 12 };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "sm":
        return 14;
      case "lg":
        return 18;
      default:
        return 16;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        getVariantStyles(),
        getSizeStyles(),
        { opacity: disabled ? 0.6 : 1 },
      ]}
    >
      {icon && (
        <Ionicons
          name={icon as any}
          size={20}
          color={getTextColor()}
          style={{ marginRight: title ? 8 : 0 }}
        />
      )}
      <Text
        style={[
          styles.buttonText,
          {
            color: getTextColor(),
            fontSize: getTextSize(),
            fontWeight: "600",
          },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  buttonText: {
    fontWeight: "600",
  },
});
