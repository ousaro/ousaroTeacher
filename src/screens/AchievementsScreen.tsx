import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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

export default function AchievementsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { state } = useApp();
  const { user, words, currentStreak } = state;

  const [refreshing, setRefreshing] = useState(false);

  // Sample achievements data with enhanced structure
  const achievements = useMemo(() => [
    {
      id: "1",
      title: "First Steps",
      description: "Add your first word to your vocabulary",
      icon: "footsteps-outline",
      progress: words.length > 0 ? 100 : 0,
      current: Math.min(words.length, 1),
      target: 1,
      unlocked: words.length > 0,
      color: "#10b981",
      category: "vocabulary",
    },
    {
      id: "2",
      title: "Word Collector",
      description: "Build your vocabulary with 10 words",
      icon: "library-outline",
      progress: Math.min((words.length / 10) * 100, 100),
      current: Math.min(words.length, 10),
      target: 10,
      unlocked: words.length >= 10,
      color: theme.colors.primary,
      category: "vocabulary",
    },
    {
      id: "3",
      title: "Vocabulary Master",
      description: "Achieve mastery with 50 words in your collection",
      icon: "school-outline",
      progress: Math.min((words.length / 50) * 100, 100),
      current: Math.min(words.length, 50),
      target: 50,
      unlocked: words.length >= 50,
      color: "#8b5cf6",
      category: "vocabulary",
    },
    {
      id: "4",
      title: "Streak Starter",
      description: "Maintain consistent learning for 3 days",
      icon: "flame-outline",
      progress: Math.min((currentStreak / 3) * 100, 100),
      current: Math.min(currentStreak, 3),
      target: 3,
      unlocked: currentStreak >= 3,
      color: "#f59e0b",
      category: "streak",
    },
    {
      id: "5",
      title: "Consistent Learner",
      description: "Build a strong learning habit with 7 days",
      icon: "medal-outline",
      progress: Math.min((currentStreak / 7) * 100, 100),
      current: Math.min(currentStreak, 7),
      target: 7,
      unlocked: currentStreak >= 7,
      color: "#ef4444",
      category: "streak",
    },
    {
      id: "6",
      title: "Dedication Master",
      description: "Show ultimate commitment with 30 days streak",
      icon: "trophy-outline",
      progress: Math.min((currentStreak / 30) * 100, 100),
      current: Math.min(currentStreak, 30),
      target: 30,
      unlocked: currentStreak >= 30,
      color: "#f59e0b",
      category: "streak",
    },
  ], [words.length, currentStreak, theme.colors.primary]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalProgress = Math.round((unlockedCount / achievements.length) * 100);
  
  const categoryStats = useMemo(() => {
    const stats = {
      vocabulary: achievements.filter(a => a.category === "vocabulary"),
      streak: achievements.filter(a => a.category === "streak"),
    };
    
    return {
      vocabulary: {
        total: stats.vocabulary.length,
        unlocked: stats.vocabulary.filter(a => a.unlocked).length,
      },
      streak: {
        total: stats.streak.length,
        unlocked: stats.streak.filter(a => a.unlocked).length,
      }
    };
  }, [achievements]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setRefreshing(false);
  }, []);

  const OverviewCard = () => (
    <Animatable.View
      animation="fadeInUp"
      style={[styles.overviewCard, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.overviewHeader}>
        <View style={styles.overviewTitleSection}>
          <View style={[styles.overviewIcon, { backgroundColor: theme.colors.primary + "20" }]}>
            <Ionicons name="trophy" size={24} color={theme.colors.primary} />
          </View>
          <View>
            <Text style={[styles.overviewTitle, { color: theme.colors.text }]}>
              Achievement Progress
            </Text>
            <Text style={[styles.overviewSubtitle, { color: theme.colors.textSecondary }]}>
              {unlockedCount} of {achievements.length} unlocked
            </Text>
          </View>
        </View>
        <Text style={[styles.overviewPercentage, { color: theme.colors.primary }]}>
          {totalProgress}%
        </Text>
      </View>

      <View style={styles.overviewProgressContainer}>
        <View style={[styles.overviewProgressBar, { backgroundColor: theme.colors.border }]}>
          <View
            style={[
              styles.overviewProgressFill,
              {
                backgroundColor: theme.colors.primary,
                width: `${totalProgress}%`,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.overviewStats}>
        <View style={styles.overviewStatItem}>
          <Text style={[styles.overviewStatValue, { color: theme.colors.text }]}>
            {unlockedCount}
          </Text>
          <Text style={[styles.overviewStatLabel, { color: theme.colors.textSecondary }]}>
            Unlocked
          </Text>
        </View>
        <View style={styles.overviewStatItem}>
          <Text style={[styles.overviewStatValue, { color: theme.colors.text }]}>
            {achievements.length - unlockedCount}
          </Text>
          <Text style={[styles.overviewStatLabel, { color: theme.colors.textSecondary }]}>
            Remaining
          </Text>
        </View>
        <View style={styles.overviewStatItem}>
          <Text style={[styles.overviewStatValue, { color: theme.colors.text }]}>
            {Math.round(achievements.reduce((sum, a) => sum + a.progress, 0) / achievements.length)}%
          </Text>
          <Text style={[styles.overviewStatLabel, { color: theme.colors.textSecondary }]}>
            Avg Progress
          </Text>
        </View>
      </View>
    </Animatable.View>
  );

  const CategoryCard = ({ category, title, icon, color }: {
    category: keyof typeof categoryStats;
    title: string;
    icon: string;
    color: string;
  }) => {
    const stats = categoryStats[category];
    const progress = stats.total > 0 ? Math.round((stats.unlocked / stats.total) * 100) : 0;
    
    return (
      <Animatable.View
        animation="fadeInUp"
        delay={50}
        style={[styles.categoryCard, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.categoryHeader}>
          <View style={[styles.categoryIcon, { backgroundColor: color + "20" }]}>
            <Ionicons name={icon as any} size={20} color={color} />
          </View>
          <View style={styles.categoryInfo}>
            <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>
              {title}
            </Text>
            <Text style={[styles.categorySubtitle, { color: theme.colors.textSecondary }]}>
              {stats.unlocked}/{stats.total} achievements
            </Text>
          </View>
          <Text style={[styles.categoryProgress, { color }]}>
            {progress}%
          </Text>
        </View>
        
        <View style={styles.categoryProgressContainer}>
          <View style={[styles.categoryProgressBar, { backgroundColor: theme.colors.border }]}>
            <View
              style={[
                styles.categoryProgressFill,
                {
                  backgroundColor: color,
                  width: `${progress}%`,
                },
              ]}
            />
          </View>
        </View>
      </Animatable.View>
    );
  };

  const AchievementItem = ({ achievement, index }: {
    achievement: typeof achievements[0];
    index: number;
  }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 50}
      style={[
        styles.achievementItem,
        {
          backgroundColor: theme.colors.surface,
          opacity: achievement.unlocked ? 1 : 0.8,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.achievementContent}
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
            <View style={styles.achievementTitleRow}>
              <Text
                style={[
                  styles.achievementTitle,
                  { color: theme.colors.text },
                ]}
              >
                {achievement.title}
              </Text>
              {achievement.unlocked && (
                <View style={[styles.unlockedBadge, { backgroundColor: achievement.color }]}>
                  <Ionicons name="checkmark-circle" size={12} color="white" />
                </View>
              )}
            </View>
            <Text
              style={[
                styles.achievementDescription,
                { color: theme.colors.textSecondary },
              ]}
            >
              {achievement.description}
            </Text>
            
            <View style={styles.achievementProgress}>
              <Text
                style={[
                  styles.achievementProgressText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {achievement.current}/{achievement.target}
              </Text>
            </View>
          </View>

          <View style={styles.achievementRight}>
            <Text
              style={[
                styles.achievementPercentage,
                { color: achievement.color },
              ]}
            >
              {Math.round(achievement.progress)}%
            </Text>
          </View>
        </View>

        <View style={styles.achievementProgressContainer}>
          <View
            style={[
              styles.achievementProgressBar,
              { backgroundColor: theme.colors.border },
            ]}
          >
            <View
              style={[
                styles.achievementProgressFill,
                {
                  width: `${achievement.progress}%`,
                  backgroundColor: achievement.color,
                },
              ]}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
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
            Achievements
          </Text>
          
          <TouchableOpacity
            style={styles.statsButton}
            activeOpacity={0.7}
          >
            <Ionicons name="medal" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          Track your learning milestones
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
        {/* Overall Progress */}
        <OverviewCard />

        {/* Category Stats */}
        <View style={styles.categoryGrid}>
          <CategoryCard
            category="vocabulary"
            title="Vocabulary"
            icon="library-outline"
            color="#10b981"
          />
          <CategoryCard
            category="streak"
            title="Streaks"
            icon="flame-outline"
            color="#f59e0b"
          />
        </View>

        {/* Achievements List */}
        <Animatable.View
          animation="fadeInUp"
          delay={100}
          style={[styles.achievementsList, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.achievementsHeader}>
            <View style={styles.achievementsTitleSection}>
              <View style={[styles.achievementsIcon, { backgroundColor: theme.colors.primary + "20" }]}>
                <Ionicons name="trophy-outline" size={20} color={theme.colors.primary} />
              </View>
              <Text style={[styles.achievementsTitle, { color: theme.colors.text }]}>
                All Achievements
              </Text>
            </View>
          </View>

          <View style={styles.achievementsContent}>
            {achievements.map((achievement, index) => (
              <AchievementItem
                key={achievement.id}
                achievement={achievement}
                index={index}
              />
            ))}
          </View>
        </Animatable.View>

        {/* Motivational Message */}
        <Animatable.View
          animation="fadeInUp"
          delay={200}
          style={[styles.motivationCard, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.motivationContent}>
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
            
            {achievements.length - unlockedCount > 0 && (
              <ThemedButton
                title="Continue Learning"
                onPress={() => navigation.navigate("AddWord")}
                variant="primary"
                size="sm"
                style={styles.motivationButton}
              />
            )}
          </View>
        </Animatable.View>

        {/* Empty State */}
        {words.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="trophy-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              Start Your Journey
            </Text>
            <Text style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}>
              Add your first word to unlock achievements and track your progress
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
  statsButton: {
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
  overviewCard: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  overviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  overviewTitleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  overviewIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  overviewSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  overviewPercentage: {
    fontSize: 18,
    fontWeight: "700",
  },
  overviewProgressContainer: {
    marginBottom: 12,
  },
  overviewProgressBar: {
    height: 8,
    borderRadius: 4,
  },
  overviewProgressFill: {
    height: "100%",
    borderRadius: 4,
    minWidth: 2,
  },
  overviewStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  overviewStatItem: {
    alignItems: "center",
  },
  overviewStatValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  overviewStatLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  categoryGrid: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 4,
  },
  categoryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  categorySubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  categoryProgress: {
    fontSize: 14,
    fontWeight: "700",
  },
  categoryProgressContainer: {
    marginTop: 4,
  },
  categoryProgressBar: {
    height: 4,
    borderRadius: 2,
  },
  categoryProgressFill: {
    height: "100%",
    borderRadius: 2,
    minWidth: 2,
  },
  achievementsList: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  achievementsTitleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  achievementsIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  achievementsTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  achievementsContent: {
    gap: 2,
  },
  achievementItem: {
    borderRadius: 8,
    marginVertical: 2,
  },
  achievementContent: {
    padding: 12,
  },
  achievementHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  unlockedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  achievementDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  achievementProgress: {
    marginTop: 2,
  },
  achievementProgressText: {
    fontSize: 11,
  },
  achievementRight: {
    alignItems: "flex-end",
    marginLeft: 8,
  },
  achievementPercentage: {
    fontSize: 14,
    fontWeight: "700",
  },
  achievementProgressContainer: {
    marginTop: 4,
  },
  achievementProgressBar: {
    height: 4,
    borderRadius: 2,
  },
  achievementProgressFill: {
    height: "100%",
    borderRadius: 2,
    minWidth: 2,
  },
  motivationCard: {
    borderRadius: 12,
    padding: 20,
    marginVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  motivationContent: {
    alignItems: "center",
  },
  motivationText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 12,
  },
  motivationSubtext: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 16,
  },
  motivationButton: {
    marginTop: 12,
    paddingHorizontal: 20,
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