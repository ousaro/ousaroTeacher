import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  RefreshControl,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { useTheme } from "../contexts/ThemeContext";
import { ThemedButton } from "../components/ThemedComponents";

interface Props {
  navigation: any;
}

interface GrammarLesson {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  progress: number;
  category: string;
  duration: string;
  isCompleted: boolean;
  isFavorite: boolean;
}

export default function GrammarScreen({ navigation }: Props) {
  const { theme } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Mock data for grammar lessons
  const grammarLessons: GrammarLesson[] = [
    {
      id: "1",
      title: "Parts of Speech",
      description: "Learn about nouns, verbs, adjectives, and more fundamental building blocks of language.",
      difficulty: 1,
      progress: 85,
      category: "basics",
      duration: "15 min",
      isCompleted: false,
      isFavorite: true,
    },
    {
      id: "2",
      title: "Present Tense Mastery",
      description: "Master all forms of present tense including simple, continuous, and perfect.",
      difficulty: 2,
      progress: 60,
      category: "tenses",
      duration: "20 min",
      isCompleted: false,
      isFavorite: false,
    },
    {
      id: "3",
      title: "Past Tense Forms",
      description: "Explore simple past, past continuous, and past perfect tenses with examples.",
      difficulty: 2,
      progress: 100,
      category: "tenses",
      duration: "18 min",
      isCompleted: true,
      isFavorite: false,
    },
    {
      id: "4",
      title: "Future Tense Patterns",
      description: "Understand will, going to, and present continuous for future expressions.",
      difficulty: 3,
      progress: 30,
      category: "tenses",
      duration: "22 min",
      isCompleted: false,
      isFavorite: true,
    },
    {
      id: "5",
      title: "Conditional Sentences",
      description: "Master zero, first, second, and third conditional sentence structures.",
      difficulty: 4,
      progress: 0,
      category: "advanced",
      duration: "25 min",
      isCompleted: false,
      isFavorite: false,
    },
    {
      id: "6",
      title: "Passive Voice",
      description: "Learn when and how to use passive voice effectively in your writing.",
      difficulty: 3,
      progress: 45,
      category: "advanced",
      duration: "20 min",
      isCompleted: false,
      isFavorite: false,
    },
  ];

  const categories = [
    { key: "all", label: "All Lessons" },
    { key: "basics", label: "Basics" },
    { key: "tenses", label: "Tenses" },
    { key: "advanced", label: "Advanced" },
  ];

  const filteredLessons = grammarLessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || lesson.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLessonPress = useCallback((lesson: GrammarLesson) => {
    navigation.navigate("LessonDetails", { lessonId: lesson.id });
  }, [navigation]);

  const toggleFavorite = useCallback((lessonId: string) => {
    // Implementation for toggling favorite
    console.log("Toggle favorite for lesson:", lessonId);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setRefreshing(false);
  }, []);

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "#10b981"; // Green - completed
    if (progress >= 50) return "#f59e0b"; // Orange - progressing
    if (progress > 0) return "#3b82f6"; // Blue - started
    return "#6b7280"; // Gray - not started
  };

  const getDifficultyColor = (difficulty: number) => {
    const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#dc2626"];
    return colors[difficulty - 1] || "#6b7280";
  };

  const getDifficultyLabel = (difficulty: number) => {
    const labels = ["Beginner", "Elementary", "Intermediate", "Advanced", "Expert"];
    return labels[difficulty - 1] || "Unknown";
  };

  const renderCategoryChip = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => setSelectedCategory(item.key)}
      style={[
        styles.categoryChip,
        {
          backgroundColor: selectedCategory === item.key ? theme.colors.primary : theme.colors.surface,
          borderColor: theme.colors.primary,
        }
      ]}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.categoryChipText,
          {
            color: selectedCategory === item.key ? "white" : theme.colors.primary,
          }
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderLessonCard = ({ item: lesson, index }: { item: GrammarLesson; index: number }) => {
    return (
      <Animatable.View
        animation="fadeInUp"
        delay={index * 30}
        style={[
          styles.lessonCard,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleLessonPress(lesson)}
          style={styles.lessonContent}
          activeOpacity={0.8}
        >
          <View style={styles.lessonMain}>
            <View style={styles.lessonInfo}>
              <View style={styles.lessonHeader}>
                <Text style={[styles.lessonTitle, { color: theme.colors.text }]}>
                  {lesson.title}
                </Text>
                {lesson.isCompleted && (
                  <View style={[styles.completedBadge, { backgroundColor: "#10b981" }]}>
                    <Ionicons name="checkmark" size={12} color="white" />
                  </View>
                )}
              </View>
              <Text
                style={[styles.lessonDescription, { color: theme.colors.textSecondary }]}
                numberOfLines={2}
              >
                {lesson.description}
              </Text>
            </View>

            <View style={styles.lessonActions}>
              <TouchableOpacity
                onPress={() => toggleFavorite(lesson.id)}
                style={styles.actionButton}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={lesson.isFavorite ? "heart" : "heart-outline"}
                  size={20}
                  color={lesson.isFavorite ? "#ef4444" : theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.lessonBottom}>
            <View style={styles.progressSection}>
              <View style={[styles.progressDot, { backgroundColor: getProgressColor(lesson.progress) }]} />
              <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
                {lesson.progress >= 100 ? 'Completed' : lesson.progress > 0 ? `${lesson.progress}%` : 'Not Started'}
              </Text>
            </View>

            <View style={styles.difficultySection}>
              <View style={[styles.difficultyDot, { backgroundColor: getDifficultyColor(lesson.difficulty) }]} />
              <Text style={[styles.difficultyLabel, { color: theme.colors.textSecondary }]}>
                {getDifficultyLabel(lesson.difficulty)}
              </Text>
            </View>

            <View style={styles.durationSection}>
              <Ionicons name="time-outline" size={12} color={theme.colors.textSecondary} />
              <Text style={[styles.durationLabel, { color: theme.colors.textSecondary }]}>
                {lesson.duration}
              </Text>
            </View>
          </View>

          {lesson.progress > 0 && lesson.progress < 100 && (
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { backgroundColor: theme.colors.background }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: getProgressColor(lesson.progress),
                      width: `${lesson.progress}%`,
                    }
                  ]}
                />
              </View>
            </View>
          )}
        </TouchableOpacity>
      </Animatable.View>
    );
  };

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


          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Grammar Lessons
          </Text>
          

        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.background }]}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search lessons..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryChip}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContent}
        />
      </View>

      {/* Results Count */}
      <View style={[styles.resultsBar, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.resultsText, { color: theme.colors.textSecondary }]}>
          {filteredLessons.length} lessons
        </Text>
      </View>

      {/* Lessons List */}
      {filteredLessons.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name={searchQuery ? "search" : "book-outline"}
            size={48}
            color={theme.colors.textSecondary}
          />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            {searchQuery ? "No lessons found" : "No lessons available"}
          </Text>
          <Text style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}>
            {searchQuery
              ? "Try adjusting your search terms"
              : "Lessons will appear here when available"}
          </Text>
          {searchQuery && (
            <ThemedButton
              title="Clear Search"
              onPress={() => setSearchQuery("")}
              variant="secondary"
              size="md"
              style={styles.emptyButton}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={filteredLessons}
          renderItem={renderLessonCard}
          keyExtractor={(item) => item.id}
          style={styles.lessonsList}
          contentContainerStyle={styles.lessonsContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={2}
        />
      )}
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
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  statsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  categoryContainer: {
    paddingVertical: 12,
  },
  categoryContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  resultsBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  resultsText: {
    fontSize: 14,
    fontWeight: "500",
  },
  lessonsList: {
    flex: 1,
  },
  lessonsContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  lessonCard: {
    borderRadius: 12,
    marginVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  lessonContent: {
    padding: 16,
  },
  lessonMain: {
    flexDirection: "row",
    marginBottom: 12,
  },
  lessonInfo: {
    flex: 1,
    marginRight: 12,
  },
  lessonHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  completedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  lessonDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  lessonActions: {
    justifyContent: "flex-start",
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  lessonBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  difficultySection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  difficultyLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  durationSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  durationLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  progressBarContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
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