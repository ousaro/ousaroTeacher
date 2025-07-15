import React from "react";
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

interface Props {
  navigation: any;
}

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  theme: any;
}

interface SettingsItem {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  rightElement,
  theme,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.settingItem,
      {
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.card,
      },
    ]}
  >
    <View
      style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}
    >
      <Ionicons name={icon as any} size={20} color={theme.colors.primary} />
    </View>
    <View style={styles.textContainer}>
      <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
        {title}
      </Text>
      {subtitle && (
        <Text
          style={[styles.itemSubtitle, { color: theme.colors.textSecondary }]}
        >
          {subtitle}
        </Text>
      )}
    </View>
    {rightElement || (
      <Ionicons
        name="chevron-forward"
        size={20}
        color={theme.colors.textSecondary}
      />
    )}
  </TouchableOpacity>
);

export default function SettingsScreen({ navigation }: Props) {
  const { theme, toggleTheme, isDark } = useTheme();

  const settingsSections: Array<{
    title: string;
    items: SettingsItem[];
  }> = [
    {
      title: "Appearance",
      items: [
        {
          icon: "moon",
          title: "Dark Mode",
          subtitle: "Switch between light and dark theme",
          rightElement: (
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={isDark ? "#ffffff" : "#f4f3f4"}
            />
          ),
        },
      ],
    },
    {
      title: "Learning",
      items: [
        {
          icon: "flag",
          title: "Daily Goal",
          subtitle: "Set your daily learning target",
          onPress: () => {
            // TODO: Navigate to daily goal settings
          },
        },
        {
          icon: "notifications",
          title: "Notifications",
          subtitle: "Manage your learning reminders",
          onPress: () => {
            // TODO: Navigate to notifications settings
          },
        },
      ],
    },
    {
      title: "Data",
      items: [
        {
          icon: "download",
          title: "Export Data",
          subtitle: "Export your words and progress",
          onPress: () => {
            // TODO: Implement data export
          },
        },
        {
          icon: "trash",
          title: "Reset Progress",
          subtitle: "Clear all learning data",
          onPress: () => {
            // TODO: Implement data reset with confirmation
          },
        },
      ],
    },
    {
      title: "About",
      items: [
        {
          icon: "information-circle",
          title: "About OusaroTeacher",
          subtitle: "Version 1.0.0",
          onPress: () => {
            // TODO: Navigate to about screen
          },
        },
        {
          icon: "help-circle",
          title: "Help & Support",
          subtitle: "Get help and contact support",
          onPress: () => {
            // TODO: Navigate to help screen
          },
        },
      ],
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            borderBottomColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Settings
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            {/* Section Header */}
            <Text
              style={[
                styles.sectionHeader,
                { color: theme.colors.textSecondary },
              ]}
            >
              {section.title}
            </Text>

            {/* Section Items */}
            <View
              style={[
                styles.sectionContent,
                { backgroundColor: theme.colors.card },
              ]}
            >
              {section.items.map((item, itemIndex) => (
                <SettingItem
                  key={itemIndex}
                  icon={item.icon}
                  title={item.title}
                  subtitle={item.subtitle}
                  onPress={item.onPress}
                  rightElement={item.rightElement}
                  theme={theme}
                />
              ))}
            </View>
          </View>
        ))}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerSpacer: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 16,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionContent: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
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
  itemTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  itemSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  bottomSpacing: {
    height: 32,
  },
});
