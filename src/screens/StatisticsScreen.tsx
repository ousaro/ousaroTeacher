import React from "react";
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useApp } from "../contexts/AppContext";
import { ThemedCard } from "../components/ThemedComponents";

const { width } = Dimensions.get("window");

interface Props {
  navigation: any;
}

export default function StatisticsScreen({ navigation }: Props) {
  const { theme, isDark } = useTheme();
  const { state } = useApp();
  const { words, user, todayStats, currentStreak } = state;

  const totalWords = words.length;
  const favoriteWords = words.filter((w) => w.isFavorite).length;
  const difficultWords = words.filter((w) => w.isMarkedDifficult).length;
  const averageProgress =
    totalWords > 0
      ? Math.round(
          words.reduce((sum, word) => sum + word.progress, 0) / totalWords,
        )
      : 0;

  const todayWordsLearned = todayStats?.wordsLearned || 0;
  const todayTimeSpent = todayStats?.timeSpent || 0;
  const dailyGoal = user?.dailyGoal || 20;
  const goalProgress = Math.round((todayWordsLearned / dailyGoal) * 100);

  const recentWords = words
    .sort(
      (a, b) =>
        new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
    )
    .slice(0, 5);

  const difficultyDistribution = {
    easy: words.filter((w) => w.difficulty <= 2).length,
    medium: words.filter((w) => w.difficulty === 3).length,
    hard: words.filter((w) => w.difficulty >= 4).length,
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    color,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color: string;
  }) => (
    <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
      <View style={[styles.statIcon, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statValue, { color: theme.colors.text }]}>
          {value}
        </Text>
        <Text style={[styles.statTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[styles.statSubtitle, { color: theme.colors.textSecondary }]}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );

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
          📊 Statistics
        </Text>
        <Text
          style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}
        >
          Your learning progress
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Today's Progress */}
        <ThemedCard
          title="Today's Progress"
          icon="calendar-outline"
          variant="elevated"
        >
          <View style={styles.progressContainer}>
            <View style={styles.progressInfo}>
              <Text
                style={[styles.progressValue, { color: theme.colors.text }]}
              >
                {todayWordsLearned} / {dailyGoal}
              </Text>
              <Text
                style={[
                  styles.progressLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Words learned today
              </Text>
            </View>
            <View
              style={[
                styles.progressCircle,
                { borderColor: theme.colors.border },
              ]}
            >
              <Text
                style={[
                  styles.progressPercent,
                  { color: theme.colors.primary },
                ]}
              >
                {goalProgress}%
              </Text>
            </View>
          </View>

          <View style={styles.todayStats}>
            <View style={styles.todayStat}>
              <Ionicons
                name="time-outline"
                size={16}
                color={theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.todayStatText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {todayTimeSpent} min
              </Text>
            </View>
            <View style={styles.todayStat}>
              <Ionicons name="flame" size={16} color="#f59e0b" />
              <Text
                style={[
                  styles.todayStatText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {currentStreak} day streak
              </Text>
            </View>
          </View>
        </ThemedCard>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Words"
            value={totalWords}
            icon="library-outline"
            color={theme.colors.primary}
          />
          <StatCard
            title="Average Progress"
            value={`${averageProgress}%`}
            icon="trending-up-outline"
            color={theme.colors.success}
          />
          <StatCard
            title="Favorites"
            value={favoriteWords}
            icon="heart-outline"
            color={theme.colors.error}
          />
          <StatCard
            title="Difficult"
            value={difficultWords}
            icon="alert-circle-outline"
            color={theme.colors.warning}
          />
        </View>

        {/* Difficulty Distribution */}
        <ThemedCard
          title="Difficulty Distribution"
          icon="bar-chart-outline"
          variant="elevated"
        >
          <View style={styles.difficultyChart}>
            <View style={styles.difficultyItem}>
              <View
                style={[
                  styles.difficultyBar,
                  { backgroundColor: theme.colors.success },
                ]}
              >
                <View
                  style={[
                    styles.difficultyFill,
                    {
                      backgroundColor: theme.colors.success,
                      width:
                        totalWords > 0
                          ? `${(difficultyDistribution.easy / totalWords) * 100}%`
                          : "0%",
                    },
                  ]}
                />
              </View>
              <Text
                style={[styles.difficultyLabel, { color: theme.colors.text }]}
              >
                Easy ({difficultyDistribution.easy})
              </Text>
            </View>

            <View style={styles.difficultyItem}>
              <View
                style={[
                  styles.difficultyBar,
                  { backgroundColor: theme.colors.warning },
                ]}
              >
                <View
                  style={[
                    styles.difficultyFill,
                    {
                      backgroundColor: theme.colors.warning,
                      width:
                        totalWords > 0
                          ? `${(difficultyDistribution.medium / totalWords) * 100}%`
                          : "0%",
                    },
                  ]}
                />
              </View>
              <Text
                style={[styles.difficultyLabel, { color: theme.colors.text }]}
              >
                Medium ({difficultyDistribution.medium})
              </Text>
            </View>

            <View style={styles.difficultyItem}>
              <View
                style={[
                  styles.difficultyBar,
                  { backgroundColor: theme.colors.error },
                ]}
              >
                <View
                  style={[
                    styles.difficultyFill,
                    {
                      backgroundColor: theme.colors.error,
                      width:
                        totalWords > 0
                          ? `${(difficultyDistribution.hard / totalWords) * 100}%`
                          : "0%",
                    },
                  ]}
                />
              </View>
              <Text
                style={[styles.difficultyLabel, { color: theme.colors.text }]}
              >
                Hard ({difficultyDistribution.hard})
              </Text>
            </View>
          </View>
        </ThemedCard>

        {/* Recent Words */}
        {recentWords.length > 0 && (
          <ThemedCard
            title="Recent Words"
            icon="time-outline"
            variant="elevated"
          >
            {recentWords.map((word, index) => (
              <View key={word.id} style={styles.recentWord}>
                <View style={styles.recentWordInfo}>
                  <Text
                    style={[
                      styles.recentWordText,
                      { color: theme.colors.text },
                    ]}
                  >
                    {word.text}
                  </Text>
                  <Text
                    style={[
                      styles.recentWordDate,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {new Date(word.dateAdded).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.recentWordProgress}>
                  <Text
                    style={[
                      styles.recentWordProgressText,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {Math.round(word.progress)}%
                  </Text>
                </View>
              </View>
            ))}
          </ThemedCard>
        )}

        {/* Achievements Preview */}
        <ThemedCard
          title="Achievements"
          icon="trophy-outline"
          variant="elevated"
          onPress={() => navigation.navigate("Achievements")}
        >
          <View style={styles.achievementPreview}>
            <Text
              style={[
                styles.achievementText,
                { color: theme.colors.textSecondary },
              ]}
            >
              {user?.achievements?.length || 0} achievements unlocked
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textSecondary}
            />
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
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  progressInfo: {
    flex: 1,
  },
  progressValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  progressLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: "bold",
  },
  todayStats: {
    flexDirection: "row",
    gap: 16,
  },
  todayStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  todayStatText: {
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginVertical: 8,
  },
  statCard: {
    width: (width - 44) / 2,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statTitle: {
    fontSize: 12,
    marginTop: 2,
  },
  statSubtitle: {
    fontSize: 10,
    marginTop: 2,
  },
  difficultyChart: {
    gap: 12,
  },
  difficultyItem: {
    gap: 8,
  },
  difficultyBar: {
    height: 8,
    borderRadius: 4,
    opacity: 0.3,
  },
  difficultyFill: {
    height: "100%",
    borderRadius: 4,
  },
  difficultyLabel: {
    fontSize: 14,
  },
  recentWord: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  recentWordInfo: {
    flex: 1,
  },
  recentWordText: {
    fontSize: 16,
    fontWeight: "500",
  },
  recentWordDate: {
    fontSize: 12,
    marginTop: 2,
  },
  recentWordProgress: {
    alignItems: "center",
  },
  recentWordProgressText: {
    fontSize: 12,
  },
  achievementPreview: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  achievementText: {
    fontSize: 14,
  },
});
