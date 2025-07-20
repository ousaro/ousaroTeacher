import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../contexts/AppContext";
import { useTheme } from "../contexts/ThemeContext";

interface Props {
  navigation: any;
}

export default function ProfileScreen({ navigation }: Props) {
  const { state } = useApp();
  const { theme, isDark } = useTheme();
  const { user, words, todayStats, currentStreak } = state;

  const stats = [
    {
      title: "Total Words",
      value: words.length.toString(),
      description: "Total vocabulary",
      icon: "library-outline",
      color: theme.colors.primary,
    },
    {
      title: "Current Streak",
      value: currentStreak.toString(),
      description: "Days in a row",
      icon: "flame-outline",
      color: theme.colors.warning,
    },
    {
      title: "Games Played",
      value: (todayStats?.gamesPlayed || 0).toString(),
      description: "Practice sessions",
      icon: "game-controller-outline",
      color: theme.colors.secondary,
    },
  ];

  const quickActions = [
    {
      title: "Settings",
      subtitle: "Customize your experience",
      icon: "settings-outline",
      onPress: () => navigation.navigate("Settings"),
    },
    {
      title: "Statistics",
      subtitle: "View detailed analytics",
      icon: "analytics-outline",
      onPress: () => navigation.navigate("Statistics"),
    },
    {
      title: "Achievements",
      subtitle: "View your accomplishments",
      icon: "trophy-outline",
      onPress: () => navigation.navigate("Achievements"),
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
        <View
          style={[styles.header, { backgroundColor: theme.colors.surface }]}
        >
          <View
            style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0) || "U"}
            </Text>
          </View>
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {user?.name || "User"}
          </Text>
          <Text
            style={[styles.userInfo, { color: theme.colors.textSecondary }]}
          >
            Learning {user?.learningLanguages?.join(", ") || "Languages"}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Your Stats
          </Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={stat.title} style={styles.statCard}>
                <View
                  style={[
                    styles.statCardContent,
                    { backgroundColor: theme.colors.card },
                  ]}
                >
                  <View
                    style={[
                      styles.statIconContainer,
                      { backgroundColor: `${stat.color}20` },
                    ]}
                  >
                    <Ionicons
                      name={stat.icon as any}
                      size={24}
                      color={stat.color}
                    />
                  </View>
                  <Text
                    style={[styles.statValue, { color: theme.colors.text }]}
                  >
                    {stat.value}
                  </Text>
                  <Text
                    style={[styles.statTitle, { color: theme.colors.text }]}
                  >
                    {stat.title}
                  </Text>
                  <Text
                    style={[
                      styles.statDescription,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {stat.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Quick Actions
          </Text>
          <View style={styles.actionsList}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={action.title}
                onPress={action.onPress}
                style={[
                  styles.actionItem,
                  { backgroundColor: theme.colors.card },
                ]}
              >
                <View
                  style={[
                    styles.actionIconContainer,
                    { backgroundColor: theme.colors.surface },
                  ]}
                >
                  <Ionicons
                    name={action.icon as any}
                    size={24}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={styles.actionContent}>
                  <Text
                    style={[styles.actionTitle, { color: theme.colors.text }]}
                  >
                    {action.title}
                  </Text>
                  <Text
                    style={[
                      styles.actionSubtitle,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {action.subtitle}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
});
