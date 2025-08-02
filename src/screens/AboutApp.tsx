import React from "react";
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

interface Props {
  navigation: any;
}

export default function AboutApp({ navigation }: Props) {
  const { theme, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
        {/* English + Japanese */}
        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            About
          </Text>
          <Text style={styles.jpHeaderTitle}>概要</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>
      {/* Content */}
      <ScrollView style={styles.scrollView}>
        <View
          style={[
            styles.sectionContent,
            { backgroundColor: theme.colors.card, marginTop: 24 },
          ]}
        >
          {/* App Icon */}
          <View style={styles.iconSection}>
            <Ionicons name="school-outline" size={48} color={theme.colors.primary} />
          </View>
          {/* App Name */}
          <View style={{ alignItems: "center", marginBottom: 4 }}>
            <Text style={[styles.appName, { color: theme.colors.text }]}>
              OusaroTeacher
            </Text>
            <Text style={styles.jpAppName}>オウサロティーチャー</Text>
          </View>
          {/* Version */}
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <Text style={[styles.version, { color: theme.colors.textSecondary }]}>
              Version 1.0.0
            </Text>
            <Text style={styles.jpVersion}>バージョン 1.0.0</Text>
          </View>
          {/* Description */}
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            OusaroTeacher is designed to help you learn and master new vocabulary efficiently. Track your daily progress, customize your learning goals, and never lose your words with backup and restore.
          </Text>
          <Text style={[styles.jpDescription, { color: theme.colors.textSecondary }]}>
            オウサロティーチャーは、新しい語彙を効率的に学び、習得するために設計されています。日々の進捗を追跡し、学習目標をカスタマイズし、バックアップと復元で単語を失うことはありません。
          </Text>
          {/* Credits */}
          <View style={styles.credits}>
            <Text style={[styles.creditsTitle, { color: theme.colors.text }]}>
              Credits
            </Text>
            <Text style={styles.jpCreditsTitle}>クレジット</Text>
            <Text style={[styles.creditText, { color: theme.colors.textSecondary }]}>
              Developed by Ousaro
            </Text>
            <Text style={styles.jpCreditText}>
              開発者: オウサロ
            </Text>
          </View>
        </View>
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
  headerTextContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    lineHeight: 24,
  },
  jpHeaderTitle: {
    fontSize: 14,
    color: "#888",
    marginTop: 2,
    letterSpacing: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  sectionContent: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    padding: 24,
  },
  iconSection: {
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 0,
  },
  jpAppName: {
    fontSize: 14,
    color: "#888",
    marginTop: 2,
    marginBottom: 2,
    fontWeight: "500",
  },
  version: {
    fontSize: 14,
    marginBottom: 0,
  },
  jpVersion: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
    marginBottom: 2,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  jpDescription: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    color: "#888",
  },
  credits: {
    alignItems: "center",
  },
  creditsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 0,
  },
  jpCreditsTitle: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
    marginBottom: 4,
  },
  creditText: {
    fontSize: 14,
    marginBottom: 0,
  },
  jpCreditText: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
    marginTop: 2,
  },
  link: {
    fontSize: 15,
    textDecorationLine: "underline",
    marginBottom: 4,
  },
  jpLink: {
    fontSize: 13,
    color: "#555FAA",
    textDecorationLine: "underline",
    marginBottom: 0,
  },
  bottomSpacing: {
    height: 32,
  },
});
