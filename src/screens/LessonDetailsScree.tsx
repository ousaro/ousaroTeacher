import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
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
  route: {
    params: {
      lessonId: string;
    };
  };
}

interface LessonContent {
  id: string;
  type: "theory" | "example" | "exercise" | "quiz";
  title: string;
  content: string;
  examples?: string[];
  isCompleted: boolean;
  order: number;
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
  estimatedTime: number;
  topics: string[];
  prerequisites?: string[];
  nextLessons?: string[];
  content: LessonContent[];
}

export default function LessonDetailsScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const { lessonId } = route.params;
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "content" | "exercises">("overview");
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Mock lesson data - in real app, this would come from context/API
  const lesson: GrammarLesson = {
    id: lessonId,
    title: "Parts of Speech",
    description: "Learn about nouns, verbs, adjectives, and more fundamental building blocks of language. This comprehensive lesson covers all eight parts of speech with detailed explanations and practical examples.",
    difficulty: 1,
    progress: 85,
    category: "basics",
    duration: "15 min",
    isCompleted: false,
    isFavorite: true,
    estimatedTime: 15,
    topics: ["Nouns", "Verbs", "Adjectives", "Adverbs", "Pronouns", "Prepositions", "Conjunctions", "Interjections"],
    prerequisites: [],
    nextLessons: ["Present Tense Mastery", "Sentence Structure"],
    content: [
      {
        id: "1",
        type: "theory",
        title: "Introduction to Parts of Speech",
        content: "Parts of speech are the building blocks of language. Every word in English belongs to one of eight categories, each serving a specific function in sentences.",
        isCompleted: true,
        order: 1,
      },
      {
        id: "2",
        type: "theory",
        title: "Nouns - The Naming Words",
        content: "Nouns are words that name people, places, things, or ideas. They can be concrete (visible/tangible) or abstract (concepts/feelings).",
        examples: ["Person: teacher, doctor, Maria", "Place: school, Paris, park", "Thing: book, computer, car", "Idea: happiness, freedom, love"],
        isCompleted: true,
        order: 2,
      },
      {
        id: "3",
        type: "theory",
        title: "Verbs - The Action Words",
        content: "Verbs express actions, states of being, or occurrences. They are essential for forming complete sentences.",
        examples: ["Action: run, jump, write, think", "State: is, are, seem, appear", "Occurrence: happen, become, occur"],
        isCompleted: true,
        order: 3,
      },
      {
        id: "4",
        type: "example",
        title: "Identifying Parts of Speech",
        content: "Practice identifying different parts of speech in sentences.",
        examples: [
          "The quick brown fox jumps over the lazy dog.",
          "She carefully studied the difficult grammar lesson.",
          "Wow! That movie was absolutely fantastic."
        ],
        isCompleted: false,
        order: 4,
      },
      {
        id: "5",
        type: "exercise",
        title: "Practice Exercise 1",
        content: "Complete the sentences by choosing the correct part of speech.",
        isCompleted: false,
        order: 5,
      },
      {
        id: "6",
        type: "quiz",
        title: "Parts of Speech Quiz",
        content: "Test your understanding with this comprehensive quiz covering all parts of speech.",
        isCompleted: false,
        order: 6,
      },
    ],
  };

  const tabs = [
    { key: "overview", label: "Overview", icon: "information-circle-outline" },
    { key: "content", label: "Content", icon: "list-outline" },
    { key: "exercises", label: "Practice", icon: "fitness-outline" },
  ];

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  }, []);

  const handleStartLesson = useCallback(() => {
    navigation.navigate("LessonPlayer", { lessonId: lesson.id });
  }, [navigation, lesson.id]);

  const handleContentItemPress = useCallback((contentItem: LessonContent) => {
    navigation.navigate("LessonPlayer", { 
      lessonId: lesson.id, 
      contentId: contentItem.id 
    });
  }, [navigation, lesson.id]);

  const toggleFavorite = useCallback(() => {
    // Implementation for toggling favorite
    console.log("Toggle favorite for lesson:", lesson.id);
  }, [lesson.id]);

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

  const getContentIcon = (type: string) => {
    switch (type) {
      case "theory": return "book-outline";
      case "example": return "bulb-outline";
      case "exercise": return "create-outline";
      case "quiz": return "help-circle-outline";
      default: return "document-outline";
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case "theory": return "#3b82f6";
      case "example": return "#f59e0b";
      case "exercise": return "#8b5cf6";
      case "quiz": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const completedContent = lesson.content.filter(item => item.isCompleted).length;
  const totalContent = lesson.content.length;

  const renderTabButton = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => setActiveTab(item.key)}
      style={[
        styles.tabButton,
        {
          backgroundColor: activeTab === item.key ? theme.colors.primary : 'transparent',
          borderColor: theme.colors.primary,
        }
      ]}
      activeOpacity={0.8}
    >
      <Ionicons 
        name={item.icon} 
        size={18} 
        color={activeTab === item.key ? "white" : theme.colors.primary} 
      />
      <Text
        style={[
          styles.tabButtonText,
          {
            color: activeTab === item.key ? "white" : theme.colors.primary,
          }
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderTopicChip = ({ item, index }: { item: string; index: number }) => (
    <View style={[styles.topicChip, { backgroundColor: theme.colors.primary }]}>
      <Text style={styles.topicChipText}>{item}</Text>
    </View>
  );

  const renderContentItem = ({ item, index }: { item: LessonContent; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 50}
      style={[
        styles.contentCard,
        { backgroundColor: theme.colors.surface },
      ]}
    >
      <TouchableOpacity
        onPress={() => handleContentItemPress(item)}
        style={styles.contentCardContent}
        activeOpacity={0.8}
      >
        <View style={styles.contentHeader}>
          <View style={[styles.contentIconContainer, { backgroundColor: getContentTypeColor(item.type) }]}>
            <Ionicons name={getContentIcon(item.type)} size={16} color="white" />
          </View>
          <View style={styles.contentInfo}>
            <Text style={[styles.contentTitle, { color: theme.colors.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.contentType, { color: theme.colors.textSecondary }]}>
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </Text>
          </View>
          <View style={styles.contentStatus}>
            {item.isCompleted ? (
              <View style={[styles.completedIcon, { backgroundColor: "#10b981" }]}>
                <Ionicons name="checkmark" size={12} color="white" />
              </View>
            ) : (
              <View style={[styles.pendingIcon, { borderColor: theme.colors.textSecondary }]} />
            )}
          </View>
        </View>
        
        <Text 
          style={[styles.contentDescription, { color: theme.colors.textSecondary }]}
          numberOfLines={2}
        >
          {item.content}
        </Text>

        {item.examples && item.examples.length > 0 && (
          <TouchableOpacity
            onPress={() => toggleSection(item.id)}
            style={styles.examplesToggle}
            activeOpacity={0.7}
          >
            <Text style={[styles.examplesToggleText, { color: theme.colors.primary }]}>
              {expandedSections.includes(item.id) ? "Hide" : "Show"} Examples
            </Text>
            <Ionicons 
              name={expandedSections.includes(item.id) ? "chevron-up" : "chevron-down"} 
              size={16} 
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        )}

        {expandedSections.includes(item.id) && item.examples && (
          <View style={styles.examplesContainer}>
            {item.examples.map((example, idx) => (
              <View key={idx} style={[styles.exampleItem, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.exampleText, { color: theme.colors.text }]}>
                  {example}
                </Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    </Animatable.View>
  );

  const renderOverviewTab = () => (
    <ScrollView 
      style={styles.tabContent}
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
      {/* Lesson Info Card */}
      <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.lessonDescription, { color: theme.colors.textSecondary }]}>
          {lesson.description}
        </Text>
      </View>

      {/* Stats Card */}
      <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: getDifficultyColor(lesson.difficulty) }]}>
              <Ionicons name="bar-chart" size={16} color="white" />
            </View>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Difficulty</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {getDifficultyLabel(lesson.difficulty)}
            </Text>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: "#f59e0b" }]}>
              <Ionicons name="time" size={16} color="white" />
            </View>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Duration</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {lesson.duration}
            </Text>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: getProgressColor(lesson.progress) }]}>
              <Ionicons name="analytics" size={16} color="white" />
            </View>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Progress</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {lesson.progress}%
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
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
          <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
            {completedContent} of {totalContent} sections completed
          </Text>
        </View>
      </View>

      {/* Topics */}
      <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          What you'll learn
        </Text>
        <FlatList
          data={lesson.topics}
          renderItem={renderTopicChip}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={styles.topicsContainer}
        />
      </View>

      {/* Prerequisites */}
      {lesson.prerequisites && lesson.prerequisites.length > 0 && (
        <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Prerequisites
          </Text>
          {lesson.prerequisites.map((prereq, index) => (
            <View key={index} style={styles.prerequisiteItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={[styles.prerequisiteText, { color: theme.colors.textSecondary }]}>
                {prereq}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Next Lessons */}
      {lesson.nextLessons && lesson.nextLessons.length > 0 && (
        <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            What's next
          </Text>
          {lesson.nextLessons.map((nextLesson, index) => (
            <TouchableOpacity key={index} style={styles.nextLessonItem} activeOpacity={0.7}>
              <Text style={[styles.nextLessonText, { color: theme.colors.primary }]}>
                {nextLesson}
              </Text>
              <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderContentTab = () => (
    <FlatList
      data={lesson.content.sort((a, b) => a.order - b.order)}
      renderItem={renderContentItem}
      keyExtractor={(item) => item.id}
      style={styles.tabContent}
      contentContainerStyle={styles.contentList}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    />
  );

  const renderExercisesTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.comingSoonCard, { backgroundColor: theme.colors.surface }]}>
        <Ionicons name="construct-outline" size={48} color={theme.colors.textSecondary} />
        <Text style={[styles.comingSoonTitle, { color: theme.colors.text }]}>
          Practice Exercises
        </Text>
        <Text style={[styles.comingSoonDescription, { color: theme.colors.textSecondary }]}>
          Interactive exercises and quizzes are coming soon to help you practice what you've learned.
        </Text>
      </View>
    </ScrollView>
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
          
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
              {lesson.title}
            </Text>
            <Text style={[styles.headerCategory, { color: theme.colors.textSecondary }]}>
              {lesson.category.charAt(0).toUpperCase() + lesson.category.slice(1)} • {lesson.duration}
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={toggleFavorite}
            style={styles.favoriteButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name={lesson.isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={lesson.isFavorite ? "#ef4444" : theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          data={tabs}
          renderItem={renderTabButton}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        />
      </View>

      {/* Tab Content */}
      <View style={styles.contentContainer}>
        {activeTab === "overview" && renderOverviewTab()}
        {activeTab === "content" && renderContentTab()}
        {activeTab === "exercises" && renderExercisesTab()}
      </View>

      {/* Bottom Action */}
      <View style={[styles.bottomAction, { backgroundColor: theme.colors.surface }]}>
        <ThemedButton
          title={lesson.progress > 0 ? "Continue Learning" : "Start Lesson"}
          onPress={handleStartLesson}
          variant="primary"
          size="lg"
          style={styles.startButton}
          icon={lesson.progress > 0 ? "play-circle" : "play"}
        />
      </View>
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
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  headerCategory: {
    fontSize: 14,
    fontWeight: "500",
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  tabsContainer: {
    paddingVertical: 12,
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  infoCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  lessonDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  topicsContainer: {
    gap: 8,
  },
  topicChip: {
    flex: 1,
    marginHorizontal: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: "center",
  },
  topicChipText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  prerequisiteItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  prerequisiteText: {
    fontSize: 14,
    flex: 1,
  },
  nextLessonItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginBottom: 4,
  },
  nextLessonText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  contentList: {
    padding: 16,
  },
  contentCard: {
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contentCardContent: {
    padding: 16,
  },
  contentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contentIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  contentType: {
    fontSize: 12,
    fontWeight: "500",
  },
  contentStatus: {
    marginLeft: 12,
  },
  completedIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  pendingIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  contentDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  examplesToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  examplesToggleText: {
    fontSize: 14,
    fontWeight: "600",
  },
  examplesContainer: {
    marginTop: 12,
    gap: 8,
  },
  exampleItem: {
    padding: 12,
    borderRadius: 8,
  },
  exampleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  comingSoonCard: {
    margin: 16,
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  comingSoonDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  bottomAction: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  startButton: {
    width: "100%",
  },
});