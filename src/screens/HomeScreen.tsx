import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { useApp } from "../contexts/AppContext";
import { useTheme } from "../contexts/ThemeContext";
import { formatTime } from "../utils/helpers";

interface Props {
  navigation: any;
}

export default function HomeScreen({ navigation }: Props) {
  const { state, actions } = useApp();
  const { theme } = useTheme();
  const { user, words, todayStats, currentStreak } = state;

  useEffect(() => {
    // Update today's stats when component mounts
    if (!todayStats) {
      actions.updateTodayStats({
        wordsLearned: 0,
        timeSpent: 0,
        gamesPlayed: 0,
        flashcardsReviewed: 0,
        streakDay: currentStreak + 1,
      });
    }
  }, []);

  const recentWords = words
    .sort(
      (a, b) =>
        new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    )
    .slice(0, 5);

  const progressToday = todayStats
    ? Math.round((todayStats.wordsLearned / (user?.dailyGoal || 20)) * 100)
    : 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Progress */}
        <LinearGradient
          colors={theme.gradients.primary}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <Animatable.View animation="fadeInLeft" duration={800}>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>
                {user?.name || "Language Learner"}
              </Text>
            </Animatable.View>
            <Animatable.View animation="fadeInRight" duration={800}>
              <TouchableOpacity
                onPress={() => navigation.navigate("Settings")}
                style={styles.settingsButton}
              >
                <Ionicons name="settings-outline" size={24} color="white" />
              </TouchableOpacity>
            </Animatable.View>
          </View>

          {/* Progress Card */}
          <Animatable.View animation="fadeInUp" duration={1000} delay={200}>
            <View
              style={[
                styles.progressCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <View style={styles.progressHeader}>
                <Ionicons
                  name="trophy-outline"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text
                  style={[styles.progressTitle, { color: theme.colors.text }]}
                >
                  Today's Progress
                </Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Goal
                  </Text>
                  <Text
                    style={[styles.statValue, { color: theme.colors.text }]}
                  >
                    {todayStats?.wordsLearned || 0}/{user?.dailyGoal || 20}
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Streak
                  </Text>
                  <View style={styles.streakContainer}>
                    <Ionicons name="flame" size={20} color="#f59e0b" />
                    <Text
                      style={[styles.statValue, { color: theme.colors.text }]}
                    >
                      {currentStreak}
                    </Text>
                  </View>
                </View>

                <View style={styles.statItem}>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Time
                  </Text>
                  <Text
                    style={[styles.statValue, { color: theme.colors.text }]}
                  >
                    {formatTime(todayStats?.timeSpent || 0)}
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={[styles.progressBarContainer, { backgroundColor: theme.colors.border }]}>
                <Animatable.View
                  animation="slideInLeft"
                  duration={1200}
                  delay={500}
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(progressToday, 100)}%`,
                      backgroundColor: theme.colors.success,
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
                {progressToday}% completed • Keep going!
              </Text>
            </View>
          </Animatable.View>
        </LinearGradient>

        {/* Statistics Cards */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Your Journey
          </Text>
          <View style={styles.statsCards}>
            <Animatable.View
              animation="bounceIn"
              delay={300}
              style={[
                styles.statsCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <View style={[styles.cardIcon, { backgroundColor: "#667eea" }]}>
                <Ionicons name="library" size={24} color="white" />
              </View>
              <Text
                style={[
                  styles.cardLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Words
              </Text>
              <Text style={[styles.cardValue, { color: theme.colors.text }]}>
                {words.length}
              </Text>
            </Animatable.View>

            <Animatable.View
              animation="bounceIn"
              delay={400}
              style={[
                styles.statsCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <View style={[styles.cardIcon, { backgroundColor: "#f093fb" }]}>
                <Ionicons name="game-controller" size={24} color="white" />
              </View>
              <Text
                style={[
                  styles.cardLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Games
              </Text>
              <Text style={[styles.cardValue, { color: theme.colors.text }]}>
                {todayStats?.gamesPlayed || 0}
              </Text>
            </Animatable.View>

            <Animatable.View
              animation="bounceIn"
              delay={500}
              style={[
                styles.statsCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <View style={[styles.cardIcon, { backgroundColor: "#4facfe" }]}>
                <Ionicons name="card" size={24} color="white" />
              </View>
              <Text
                style={[
                  styles.cardLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Cards
              </Text>
              <Text style={[styles.cardValue, { color: theme.colors.text }]}>
                {todayStats?.flashcardsReviewed || 0}
              </Text>
            </Animatable.View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Quick Actions
            </Text>
          </View>

          <View style={styles.quickActions}>
            <Animatable.View
              animation="fadeInLeft"
              delay={600}
              style={styles.actionRow}
            >
              <TouchableOpacity
                onPress={() => navigation.navigate("Practice")}
                style={[
                  styles.actionCard,
                  { backgroundColor: theme.colors.surface },
                ]}
              >
                <View
                  style={[styles.actionIcon, { backgroundColor: "#667eea" }]}
                >
                  <Ionicons
                    name="game-controller-outline"
                    size={24}
                    color="white"
                  />
                </View>
                <View style={styles.actionContent}>
                  <Text
                    style={[styles.actionText, { color: theme.colors.text }]}
                  >
                    Practice
                  </Text>
                  <Text
                    style={[
                      styles.actionSubtext,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Mini-games & quizzes
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </Animatable.View>

            <Animatable.View
              animation="fadeInLeft"
              delay={700}
              style={styles.actionRow}
            >
              <TouchableOpacity
                onPress={() => navigation.navigate("Library")}
                style={[
                  styles.actionCard,
                  { backgroundColor: theme.colors.surface },
                ]}
              >
                <View
                  style={[styles.actionIcon, { backgroundColor: "#4facfe" }]}
                >
                  <Ionicons name="library-outline" size={24} color="white" />
                </View>
                <View style={styles.actionContent}>
                  <Text
                    style={[styles.actionText, { color: theme.colors.text }]}
                  >
                    Library
                  </Text>
                  <Text
                    style={[
                      styles.actionSubtext,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Manage your words and sentences
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </Animatable.View>
          </View>
        </View>

        {/* Japanese Learning Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Japanese Basics
          </Text>
          <View style={styles.quickActions}>
            <Animatable.View
              animation="fadeInLeft"
              delay={800}
              style={styles.actionRow}
            >
              <TouchableOpacity
                onPress={() => navigation.navigate("Japanese")}
                style={[
                  styles.actionCard,
                  { backgroundColor: theme.colors.surface },
                ]}
              >
                <View
                  style={[styles.actionIcon, { backgroundColor: "#f093fb" }]}
                >
                  <Ionicons name="text-outline" size={24} color="white" />
                </View>
                <View style={styles.actionContent}>
                  <Text
                    style={[styles.actionText, { color: theme.colors.text }]}
                  >
                    Hiragana
                  </Text>
                  <Text
                    style={[
                      styles.actionSubtext,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Learn Japanese characters
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </Animatable.View>
          </View>
        </View>

        {/* Empty State or Recent Words */}
        {words.length !== 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Recent Words
              </Text>

              <TouchableOpacity
                onPress={() => navigation.navigate("Library")}
                style={[
                  styles.viewAllButton,
                  { backgroundColor: theme.colors.primary + "20" },
                ]}
              >
                <Text
                  style={[styles.viewAllText, { color: theme.colors.primary }]}
                >
                  View All
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            </View>
            {recentWords.map((word, index) => (
              <Animatable.View
                key={word.id}
                animation="fadeInUp"
                delay={800 + index * 100}
                style={styles.actionRow}
              >
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("WordDetails", { wordId: word.id })
                  }
                  style={[
                    styles.actionCard,
                    { backgroundColor: theme.colors.surface },
                  ]}
                >
                  <View
                    style={[
                      styles.actionIcon,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  >
                    <Ionicons name="library" size={24} color="white" />
                  </View>
                  <View style={styles.actionContent}>
                    <Text
                      style={[styles.actionText, { color: theme.colors.text }]}
                    >
                      {word.text}
                    </Text>
                   
                    <Text
                        style={[
                          styles.actionSubtext,
                          { color: theme.colors.primary },
                        ]}
                        numberOfLines={1}
                      >
                        {word.translation}
                      </Text>
                     {word.definition && (
                      <Text
                      style={[
                        styles.actionSubtext,
                        { color: theme.colors.textSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {word.definition}
                    </Text>
                     )}
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* floating Add Word Button  always visible */}
      <TouchableOpacity
        onPress={() => navigation.navigate("AddWord")}
        style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  greeting: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  userName: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
    marginTop: 5,
  },
  settingsButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  progressCard: {
    borderRadius: 24,
    padding: 24,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    gap: 8,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 6,
    marginBottom: 12,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  statsCards: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statsCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "600",
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  quickActions: {
    gap: 12,
  },
  actionRow: {
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  actionSubtext: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 50,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
    maxWidth: 300,
  },
  emptyButton: {
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  emptyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  actionButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
