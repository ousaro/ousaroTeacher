import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../contexts/AppContext";
import { useTheme } from "../contexts/ThemeContext";
import { handleExportData, handleImportData } from "../utils";
import { useAlert } from "../contexts/AlertContext";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";

interface Props {
  navigation: any;
}

interface SettingsItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  jpTitle?: string;
  jpSubtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

export default function SettingsScreen({ navigation }: Props) {
  const { state, actions } = useApp();
  const { theme, toggleTheme, isDark } = useTheme();
  const { words } = state;

  const settingsSections: Array<{
    title: string;
    jpTitle: string;
    items: SettingsItem[];
  }> = [
    {
      title: "Appearance",
      jpTitle: "外観",
      items: [
        {
          icon: "moon",
          title: "Dark Mode",
          subtitle: "Switch between light and dark theme",
          jpTitle: "ダークモード",
          jpSubtitle: "ライトテーマとダークテーマの切り替え",
          rightElement: (
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={isDark ? theme.colors.surface : "#f4f3f4"}
            />
          ),
        },
      ],
    },
    {
      title: "Data",
      jpTitle: "データ",
      items: [
        {
          icon: "download",
          title: "Export Data",
          subtitle: "Export your words and progress",
          jpTitle: "データのエクスポート",
          jpSubtitle: "単語と進捗をエクスポート",
          onPress: async () => {
            await handleExportData();
          },
        },
        {
          icon: "cloud-upload-outline",
          title: "Import Data",
          subtitle: "Restore from a backup file",
          jpTitle: "データのインポート",
          jpSubtitle: "バックアップファイルから復元",
          onPress: async () => {
            await handleImportData();
            actions.loadInitialData();
          },
        },
      ],
    },
    {
      title: "About",
      jpTitle: "概要",
      items: [
        {
          icon: "information-circle",
          title: "About OusaroTeacher",
          subtitle: "App version and information",
          jpTitle: "オウサロティーチャーについて",
          jpSubtitle: "アプリのバージョンと情報",
          onPress: () => navigation.navigate("AboutApp"),
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
      <ScrollView style={styles.scrollView}>
      {/* Header */}
      <LinearGradient
        colors={theme.isDark ? ["#1f2937", "#374151"] : ["#667eea", "#764ba2"]}
      style={[styles.header,{borderBottomLeftRadius: 16, borderBottomRightRadius: 16}]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Ionicons
              name="settings-outline"
              size={24}
              color="white"
              style={styles.headerIcon}
            />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Settings</Text>
              <Text style={styles.jpHeaderTitle}>設定</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {section.title}
              </Text>
              <Text style={styles.jpSectionTitle}>
                {section.jpTitle}
              </Text>
            </View>
            <View style={styles.actionsList}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={item.title}
                  onPress={item.onPress}
                  style={[
                    styles.actionItem,
                    { backgroundColor: theme.colors.card },
                  ]}
                  disabled={!item.onPress}
                >
                  <View
                    style={[
                      styles.actionIconContainer,
                      { backgroundColor: theme.colors.surface },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={24}
                      color={theme.colors.primary}
                    />
                  </View>
                  <View style={styles.actionContent}>
                    <Text
                      style={[styles.actionTitle, { color: theme.colors.text }]}
                    >
                      {item.title}
                    </Text>
                    {item.jpTitle && (
                      <Text style={styles.jpActionTitle}>
                        {item.jpTitle}
                      </Text>
                    )}
                    <Text
                      style={[
                        styles.actionSubtitle,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {item.subtitle}
                    </Text>
                    {item.jpSubtitle && (
                      <Text style={styles.jpActionSubtitle}>
                        {item.jpSubtitle}
                      </Text>
                    )}
                  </View>
                  {item.rightElement || (
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  userInfo: {
    fontSize: 16,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  statCard: {
    width: "50%",
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  statCardContent: {
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  statDescription: {
    fontSize: 12,
    textAlign: "center",
  },
  actionsList: {
    gap: 12,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
  },
 headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerIcon: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    lineHeight: 24,
  },
  headerTextContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  jpHeaderTitle: {
    fontSize: 14,
    color: "#ddd",
    marginTop: 2,
    letterSpacing: 1,
    textAlign: "center",
  },
  sectionTitleContainer: {
    marginBottom: 16,
  },
  jpSectionTitle: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  jpActionTitle: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
    marginBottom: 2,
  },
  jpActionSubtitle: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
});
