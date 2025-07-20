import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { useTheme } from "../contexts/ThemeContext";
import { useApp } from "../contexts/AppContext";
import { ThemedButton } from "../components/ThemedComponents";

const { width } = Dimensions.get("window");

interface Props {
  navigation: any;
}

export default function StatisticsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { state } = useApp();
  const { words, user, todayStats, currentStreak } = state;

  const [refreshing, setRefreshing] = useState(false);

  // Calculate statistics
  const totalWords = words.length;
  const favoriteWords = words.filter((w) => w.isFavorite).length;
  const masteredWords = words.filter((w) => w.progress >= 80).length;
  const averageProgress =
    totalWords > 0
      ? Math.round(
          words.reduce((sum, word) => sum + word.progress, 0) / totalWords,
        )
      : 0;

  const todayWordsLearned = todayStats?.wordsLearned || 0;
  const todayTimeSpent = todayStats?.timeSpent || 0;
  const dailyGoal = user?.dailyGoal || 20;

  const recentWords = useMemo(() => {
    return words
      .sort(
        (a, b) =>
          new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
      )
      .slice(0, 5);
  }, [words]);

  const difficultyDistribution = useMemo(() => {
    return {
      easy: words.filter((w) => w.difficulty <= 2).length,
      medium: words.filter((w) => w.difficulty === 3).length,
      hard: words.filter((w) => w.difficulty >= 4).length,
    };
  }, [words]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setRefreshing(false);
  }, []);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "#10b981"; // Green - mastered
    if (progress >= 50) return "#f59e0b"; // Orange - progressing
    if (progress > 0) return "#3b82f6"; // Blue - started
    return "#6b7280"; // Gray - not started
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    color,
    onPress,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      style={[styles.statCard, { backgroundColor: theme.colors.surface }]}
    >
      <View style={[styles.statIcon, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statValue, { color: theme.colors.text }]}>
          {value}
        </Text>
        <Text style={[styles.statTitle, { color: theme.colors.textSecondary }]}>
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
      {onPress && (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={theme.colors.textSecondary}
        />
      )}
    </TouchableOpacity>
  );

  const ProgressCard = ({ title, current, goal, unit, icon, color }: {
    title: string;
    current: number;
    goal: number;
    unit: string;
    icon: string;
    color: string;
  }) => (
    <Animatable.View
      animation="fadeInUp"
      style={[styles.progressCard, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.progressHeader}>
        <View style={styles.progressTitleSection}>
          <View style={[styles.progressIcon, { backgroundColor: color + "20" }]}>
            <Ionicons name={icon as any} size={20} color={color} />
          </View>
          <Text style={[styles.progressTitle, { color: theme.colors.text }]}>
            {title}
          </Text>
        </View>
        <Text style={[styles.progressPercentage, { color }]}>
          {goal > 0 ? Math.round((current / goal) * 100) : 0}%
        </Text>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarBackground, { backgroundColor: theme.colors.border }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: color,
                width: goal > 0 ? `${Math.min((current / goal) * 100, 100)}%` : "0%",
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.progressFooter}>
        <Text style={[styles.progressCurrent, { color: theme.colors.text }]}>
          {current} / {goal} {unit}
        </Text>
        <Text style={[styles.progressRemaining, { color: theme.colors.textSecondary }]}>
          {Math.max(goal - current, 0)} remaining
        </Text>
      </View>
    </Animatable.View>
  );

  const DifficultyChart = () => (
    <Animatable.View
      animation="fadeInUp"
      delay={100}
      style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.chartHeader}>
        <View style={styles.chartTitleSection}>
          <View style={[styles.chartIcon, { backgroundColor: theme.colors.primary + "20" }]}>
            <Ionicons name="bar-chart-outline" size={20} color={theme.colors.primary} />
          </View>
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
            Difficulty Distribution
          </Text>
        </View>
      </View>

      <View style={styles.difficultyChart}>
        <View style={styles.difficultyItem}>
          <View style={styles.difficultyItemHeader}>
            <View style={[styles.difficultyDot, { backgroundColor: "#10b981" }]} />
            <Text style={[styles.difficultyLabel, { color: theme.colors.text }]}>
              Easy
            </Text>
            <Text style={[styles.difficultyCount, { color: theme.colors.textSecondary }]}>
              {difficultyDistribution.easy}
            </Text>
          </View>
          <View style={[styles.difficultyBar, { backgroundColor: theme.colors.border }]}>
            <View
              style={[
                styles.difficultyFill,
                {
                  backgroundColor: "#10b981",
                  width: totalWords > 0 ? `${(difficultyDistribution.easy / totalWords) * 100}%` : "0%",
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.difficultyItem}>
          <View style={styles.difficultyItemHeader}>
            <View style={[styles.difficultyDot, { backgroundColor: "#f59e0b" }]} />
            <Text style={[styles.difficultyLabel, { color: theme.colors.text }]}>
              Medium
            </Text>
            <Text style={[styles.difficultyCount, { color: theme.colors.textSecondary }]}>
              {difficultyDistribution.medium}
            </Text>
          </View>
          <View style={[styles.difficultyBar, { backgroundColor: theme.colors.border }]}>
            <View
              style={[
                styles.difficultyFill,
                {
                  backgroundColor: "#f59e0b",
                  width: totalWords > 0 ? `${(difficultyDistribution.medium / totalWords) * 100}%` : "0%",
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.difficultyItem}>
          <View style={styles.difficultyItemHeader}>
            <View style={[styles.difficultyDot, { backgroundColor: "#ef4444" }]} />
            <Text style={[styles.difficultyLabel, { color: theme.colors.text }]}>
              Hard
            </Text>
            <Text style={[styles.difficultyCount, { color: theme.colors.textSecondary }]}>
              {difficultyDistribution.hard}
            </Text>
          </View>
          <View style={[styles.difficultyBar, { backgroundColor: theme.colors.border }]}>
            <View
              style={[
                styles.difficultyFill,
                {
                  backgroundColor: "#ef4444",
                  width: totalWords > 0 ? `${(difficultyDistribution.hard / totalWords) * 100}%` : "0%",
                },
              ]}
            />
          </View>
        </View>
      </View>
    </Animatable.View>
  );

  const RecentWordItem = ({ word, index }: { word: any; index: number }) => (
    <Animatable.View
      animation="fadeInRight"
      delay={index * 50}
      style={styles.recentWordItem}
    >
      <TouchableOpacity
        onPress={() => navigation.navigate("WordDetails", { wordId: word.id })}
        style={styles.recentWordContent}
        activeOpacity={0.7}
      >
        <View style={styles.recentWordInfo}>
          <Text style={[styles.recentWordText, { color: theme.colors.text }]}>
            {word.translation}
          </Text>
          <Text style={[styles.recentWordTranslation, { color: theme.colors.primary }]}>
            {word.text}
          </Text>
          <Text style={[styles.recentWordDate, { color: theme.colors.textSecondary }]}>
            {new Date(word.dateAdded).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.recentWordProgress}>
          <View style={[styles.progressDot, { backgroundColor: getProgressColor(word.progress) }]} />
          <Text style={[styles.recentWordProgressText, { color: theme.colors.textSecondary }]}>
            {word.progress >= 80 ? 'Mastered' : word.progress > 0 ? `${word.progress}%` : 'New'}
          </Text>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Statistics
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
          >
            <Ionicons name="analytics-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          Your learning progress overview
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Today's Progress */}
        <ProgressCard
          title="Daily Goal"
          current={todayWordsLearned}
          goal={dailyGoal}
          unit="words"
          icon="calendar-outline"
          color={theme.colors.primary}
        />

        {/* Current Streak */}
        <Animatable.View
          animation="fadeInUp"
          delay={50}
          style={[styles.streakCard, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.streakContent}>
            <View style={styles.streakLeft}>
              <View style={[styles.streakIcon, { backgroundColor: "#f59e0b20" }]}>
                <Ionicons name="flame" size={24} color="#f59e0b" />
              </View>
              <View>
                <Text style={[styles.streakValue, { color: theme.colors.text }]}>
                  {currentStreak} days
                </Text>
                <Text style={[styles.streakLabel, { color: theme.colors.textSecondary }]}>
                  Current streak
                </Text>
              </View>
            </View>
            
            <View style={styles.streakRight}>
              <View style={styles.streakStat}>
                <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.streakStatText, { color: theme.colors.textSecondary }]}>
                  {todayTimeSpent} min today
                </Text>
              </View>
            </View>
          </View>
        </Animatable.View>

        {/* Quick Stats Grid */}
        <Animatable.View
          animation="fadeInUp"
          delay={100}
          style={styles.statsGrid}
        >
            <StatCard
              title="Total Words"
              value={totalWords}
              icon="library-outline"
              color={theme.colors.primary}
            />
            <StatCard
              title="Mastered"
              value={masteredWords}
              subtitle={`${totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0}% complete`}
              icon="checkmark-circle-outline"
              color="#10b981"
            />
            <StatCard
              title="Favorites"
              value={favoriteWords}
              icon="heart-outline"
              color="#ef4444"
            />
            <StatCard
              title="Avg Progress"
              value={`${averageProgress}%`}
              icon="trending-up-outline"
              color="#3b82f6"
            />

        </Animatable.View>


        {/* Difficulty Distribution */}
        <DifficultyChart />

        {/* Recent Words */}
        {recentWords.length > 0 && (
          <Animatable.View
            animation="fadeInUp"
            delay={150}
            style={[styles.recentWordsCard, { backgroundColor: theme.colors.surface }]}
          >
            <View style={styles.recentWordsHeader}>
              <View style={styles.recentWordsTitleSection}>
                <View style={[styles.recentWordsIcon, { backgroundColor: theme.colors.primary + "20" }]}>
                  <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
                </View>
                <Text style={[styles.recentWordsTitle, { color: theme.colors.text }]}>
                  Recent Words
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate("Library")}
                activeOpacity={0.7}
              >
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
                  See all
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.recentWordsList}>
              {recentWords.map((word, index) => (
                <RecentWordItem key={word.id} word={word} index={index} />
              ))}
            </View>
          </Animatable.View>
        )}

        {/* Empty State */}
        {totalWords === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="bar-chart-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No statistics yet
            </Text>
            <Text style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}>
              Start adding words to see your learning progress
            </Text>
            <ThemedButton
              title="Add Your First Word"
              onPress={() => navigation.navigate("AddWord")}
              variant="primary"
              size="md"
              style={styles.emptyButton}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  achievementsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  progressCard: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: "700",
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
    minWidth: 2,
  },
  progressFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressCurrent: {
    fontSize: 14,
    fontWeight: "600",
  },
  progressRemaining: {
    fontSize: 12,
  },
  streakCard: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  streakContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  streakLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  streakIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  streakValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  streakLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  streakRight: {
    alignItems: "flex-end",
  },
  streakStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  streakStatText: {
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 8,
  },
  statCard: {
    width: (width - 40) / 2,
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginVertical: 4,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  statTitle: {
    fontSize: 11,
    marginTop: 2,
  },
  statSubtitle: {
    fontSize: 10,
    marginTop: 2,
  },
  chartCard: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  chartTitleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chartIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  difficultyChart: {
    gap: 12,
  },
  difficultyItem: {
    gap: 6,
  },
  difficultyItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  difficultyLabel: {
    fontSize: 14,
    flex: 1,
    marginLeft: 8,
  },
  difficultyCount: {
    fontSize: 12,
    fontWeight: "500",
  },
  difficultyBar: {
    height: 6,
    borderRadius: 3,
  },
  difficultyFill: {
    height: "100%",
    borderRadius: 3,
    minWidth: 2,
  },
  recentWordsCard: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recentWordsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  recentWordsTitleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recentWordsIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  recentWordsTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "600",
  },
  recentWordsList: {
    gap: 2,
  },
  recentWordItem: {
    borderRadius: 8,
  },
  recentWordContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  recentWordInfo: {
    flex: 1,
  },
  recentWordText: {
    fontSize: 14,
    fontWeight: "600",
  },
  recentWordTranslation: {
    fontSize: 12,
    marginTop: 2,
    fontStyle: "italic",
  },
  recentWordDate: {
    fontSize: 11,
    marginTop: 2,
  },
  recentWordProgress: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  recentWordProgressText: {
    fontSize: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
  },
});