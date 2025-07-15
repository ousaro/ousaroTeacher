import React from "react";
import { View, Text, StatusBar, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useApp } from "../contexts/AppContext";
import { ThemedCard } from "../components/ThemedComponents";

interface Props {
  navigation: any;
}

export default function AchievementsScreen({ navigation }: Props) {
  const { theme, isDark } = useTheme();
  const { state } = useApp();
  const { user, words, currentStreak } = state;

  // Sample achievements data
  const achievements = [
    {
      id: "1",
      title: "First Steps",
      description: "Add your first word",
      icon: "footsteps-outline",
      progress: words.length > 0 ? 100 : 0,
      target: 1,
      unlocked: words.length > 0,
      color: theme.colors.success,
    },
    {
      id: "2",
      title: "Word Collector",
      description: "Add 10 words to your vocabulary",
      icon: "library-outline",
      progress: Math.min((words.length / 10) * 100, 100),
      target: 10,
      unlocked: words.length >= 10,
      color: theme.colors.primary,
    },
    {
      id: "3",
      title: "Vocabulary Master",
      description: "Add 50 words to your vocabulary",
      icon: "school-outline",
      progress: Math.min((words.length / 50) * 100, 100),
      target: 50,
      unlocked: words.length >= 50,
      color: theme.colors.secondary,
    },
    {
      id: "4",
      title: "Streak Starter",
      description: "Maintain a 3-day learning streak",
      icon: "flame-outline",
      progress: Math.min((currentStreak / 3) * 100, 100),
      target: 3,
      unlocked: currentStreak >= 3,
      color: theme.colors.warning,
    },
    {
      id: "5",
      title: "Consistent Learner",
      description: "Maintain a 7-day learning streak",
      icon: "medal-outline",
      progress: Math.min((currentStreak / 7) * 100, 100),
      target: 7,
      unlocked: currentStreak >= 7,
      color: theme.colors.error,
    },
    {
      id: "6",
      title: "Dedication Master",
      description: "Maintain a 30-day learning streak",
      icon: "trophy-outline",
      progress: Math.min((currentStreak / 30) * 100, 100),
      target: 30,
      unlocked: currentStreak >= 30,
      color: "#f59e0b",
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          🏆 Achievements
        </Text>
        <Text
          style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}
        >
          {unlockedCount} of {achievements.length} unlocked
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Overview */}
        <ThemedCard
          title="Progress Overview"
          icon="analytics-outline"
          variant="elevated"
        >
          <View style={styles.progressGrid}>
            <View style={styles.progressItem}>
              <Text
                style={[styles.progressValue, { color: theme.colors.text }]}
              >
                {unlockedCount}
              </Text>
              <Text
                style={[
                  styles.progressLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Unlocked
              </Text>
            </View>
            <View style={styles.progressItem}>
              <Text
                style={[styles.progressValue, { color: theme.colors.text }]}
              >
                {Math.round((unlockedCount / achievements.length) * 100)}%
              </Text>
              <Text
                style={[
                  styles.progressLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Complete
              </Text>
            </View>
            <View style={styles.progressItem}>
              <Text
                style={[styles.progressValue, { color: theme.colors.text }]}
              >
                {achievements.length - unlockedCount}
              </Text>
              <Text
                style={[
                  styles.progressLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Remaining
              </Text>
            </View>
          </View>
        </ThemedCard>

        {/* Achievements List */}
        <View style={styles.achievementsList}>
          {achievements.map((achievement) => (
            <View
              key={achievement.id}
              style={[
                styles.achievementCard,
                {
                  backgroundColor: theme.colors.card,
                  opacity: achievement.unlocked ? 1 : 0.6,
                },
              ]}
            >
              <View style={styles.achievementHeader}>
                <View
                  style={[
                    styles.achievementIcon,
                    { backgroundColor: achievement.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={
                      achievement.unlocked
                        ? (achievement.icon.replace("-outline", "") as any)
                        : (achievement.icon as any)
                    }
                    size={24}
                    color={achievement.color}
                  />
                </View>

                <View style={styles.achievementInfo}>
                  <Text
                    style={[
                      styles.achievementTitle,
                      { color: theme.colors.text },
                    ]}
                  >
                    {achievement.title}
                    {achievement.unlocked && (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={theme.colors.success}
                        style={{ marginLeft: 8 }}
                      />
                    )}
                  </Text>
                  <Text
                    style={[
                      styles.achievementDescription,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {achievement.description}
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { backgroundColor: theme.colors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${achievement.progress}%`,
                        backgroundColor: achievement.color,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.progressText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {Math.round(achievement.progress)}%
                </Text>
              </View>

              {achievement.unlocked && (
                <View
                  style={[
                    styles.unlockedBadge,
                    { backgroundColor: achievement.color },
                  ]}
                >
                  <Ionicons name="trophy" size={12} color="white" />
                  <Text style={styles.unlockedText}>Unlocked!</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Motivational Message */}
        <ThemedCard title="" variant="outlined">
          <View style={styles.motivationContainer}>
            <Ionicons name="star" size={32} color={theme.colors.warning} />
            <Text style={[styles.motivationText, { color: theme.colors.text }]}>
              Keep learning to unlock more achievements!
            </Text>
            <Text
              style={[
                styles.motivationSubtext,
                { color: theme.colors.textSecondary },
              ]}
            >
              Every word you learn brings you closer to your goals.
            </Text>
          </View>
        </ThemedCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  progressGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  progressItem: {
    alignItems: "center",
  },
  progressValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  progressLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  achievementsList: {
    marginTop: 8,
    gap: 12,
  },
  achievementCard: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  achievementHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "500",
    minWidth: 35,
  },
  unlockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 8,
    gap: 4,
  },
  unlockedText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  motivationContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  motivationText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
  },
  motivationSubtext: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 20,
  },
});
