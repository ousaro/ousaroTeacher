import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { useTheme } from "../contexts/ThemeContext";
import { useApp } from "../contexts/AppContext";
import { ThemedButton } from "../components/ThemedComponents";
import { Word } from "../types";

const { width } = Dimensions.get("window");

interface Props {
  navigation: any;
}

export default function WordListScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { state, actions } = useApp();
  const { words } = state;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<
    "newest" | "alphabetical" | "difficulty"
  >("newest");

  const categories = ["all", "favorites", "difficult", "recent"];

  const filteredAndSortedWords = useMemo(() => {
    let filtered = words;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (word) =>
          word.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          word.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
          word.translation.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Filter by category
    switch (selectedCategory) {
      case "favorites":
        filtered = filtered.filter((word) => word.isFavorite);
        break;
      case "difficult":
        filtered = filtered.filter(
          (word) => word.isMarkedDifficult || word.difficulty >= 4,
        );
        break;
      case "recent":
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filtered = filtered.filter(
          (word) => new Date(word.dateAdded) > oneWeekAgo,
        );
        break;
    }

    // Sort
    switch (sortBy) {
      case "alphabetical":
        filtered.sort((a, b) => a.text.localeCompare(b.text));
        break;
      case "difficulty":
        filtered.sort((a, b) => b.difficulty - a.difficulty);
        break;
      case "newest":
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
        );
        break;
    }

    return filtered;
  }, [words, searchQuery, selectedCategory, sortBy]);

  const handleWordPress = (word: Word) => {
    navigation.navigate("WordDetails", { wordId: word.id });
  };

  const handleDeleteWord = (word: Word) => {
    Alert.alert(
      "Delete Word",
      `Are you sure you want to delete "${word.text}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => actions.deleteWord(word.id),
        },
      ],
    );
  };

  const toggleFavorite = async (word: Word) => {
    await actions.updateWord(word.id, { isFavorite: !word.isFavorite });
  };

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return "#10b981";
      case 2:
        return "#3b82f6";
      case 3:
        return "#f59e0b";
      case 4:
        return "#ef4444";
      case 5:
        return "#dc2626";
      default:
        return theme.colors.textSecondary;
    }
  };

  const getDifficultyText = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return "Very Easy";
      case 2:
        return "Easy";
      case 3:
        return "Medium";
      case 4:
        return "Hard";
      case 5:
        return "Very Hard";
      default:
        return "Unknown";
    }
  };

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
      <LinearGradient
        colors={theme.gradients.primary}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Words</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("AddWord")}
            style={styles.addButton}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Ionicons
            name="search"
            size={20}
            color={theme.colors.textSecondary}
          />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search words..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Filter Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.categoryChip,
              {
                backgroundColor:
                  selectedCategory === category
                    ? theme.colors.primary
                    : theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                {
                  color:
                    selectedCategory === category ? "white" : theme.colors.text,
                },
              ]}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort Options */}
      <View
        style={[
          styles.sortContainer,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <Text style={[styles.sortLabel, { color: theme.colors.textSecondary }]}>
          Sort by:
        </Text>
        <View style={styles.sortButtons}>
          {[
            { key: "newest", label: "Newest" },
            { key: "alphabetical", label: "A-Z" },
            { key: "difficulty", label: "Difficulty" },
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              onPress={() => setSortBy(option.key as any)}
              style={[
                styles.sortButton,
                {
                  backgroundColor:
                    sortBy === option.key
                      ? theme.colors.primary
                      : "transparent",
                },
              ]}
            >
              <Text
                style={[
                  styles.sortButtonText,
                  {
                    color: sortBy === option.key ? "white" : theme.colors.text,
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Words List */}
      <ScrollView style={styles.wordsList} showsVerticalScrollIndicator={false}>
        {filteredAndSortedWords.length === 0 ? (
          <Animatable.View animation="fadeIn" style={styles.emptyState}>
            <Ionicons
              name="library-outline"
              size={64}
              color={theme.colors.textSecondary}
            />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              {searchQuery ? "No words found" : "No words yet"}
            </Text>
            <Text
              style={[
                styles.emptyDescription,
                { color: theme.colors.textSecondary },
              ]}
            >
              {searchQuery
                ? "Try adjusting your search or filters"
                : "Start adding words to build your vocabulary"}
            </Text>
            {!searchQuery && (
              <View style={{ marginTop: 20 }}>
                <ThemedButton
                  title="Add First Word"
                  onPress={() => navigation.navigate("AddWord")}
                  variant="primary"
                  size="lg"
                />
              </View>
            )}
          </Animatable.View>
        ) : (
          filteredAndSortedWords.map((word, index) => (
            <Animatable.View
              key={word.id}
              animation="fadeInUp"
              delay={index * 100}
              style={[
                styles.wordCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <TouchableOpacity
                onPress={() => handleWordPress(word)}
                style={styles.wordContent}
              >
                <View style={styles.wordHeader}>
                  <Text style={[styles.wordText, { color: theme.colors.text }]}>
                    {word.text}
                  </Text>
                  <View style={styles.wordActions}>
                    <TouchableOpacity
                      onPress={() => toggleFavorite(word)}
                      style={styles.actionButton}
                    >
                      <Ionicons
                        name={word.isFavorite ? "heart" : "heart-outline"}
                        size={20}
                        color={
                          word.isFavorite
                            ? "#ef4444"
                            : theme.colors.textSecondary
                        }
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteWord(word)}
                      style={styles.actionButton}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={theme.colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text
                  style={[
                    styles.wordDefinition,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {word.definition}
                </Text>

                {word.translation && (
                  <Text
                    style={[
                      styles.wordTranslation,
                      { color: theme.colors.primary },
                    ]}
                  >
                    {word.translation}
                  </Text>
                )}

                <View style={styles.wordFooter}>
                  <View style={styles.wordTags}>
                    {word.tags.slice(0, 2).map((tag, tagIndex) => (
                      <View
                        key={tagIndex}
                        style={[
                          styles.tag,
                          { backgroundColor: theme.colors.primary + "20" },
                        ]}
                      >
                        <Text
                          style={[
                            styles.tagText,
                            { color: theme.colors.primary },
                          ]}
                        >
                          {tag}
                        </Text>
                      </View>
                    ))}
                    {word.tags.length > 2 && (
                      <Text
                        style={[
                          styles.moreTagsText,
                          { color: theme.colors.textSecondary },
                        ]}
                      >
                        +{word.tags.length - 2}
                      </Text>
                    )}
                  </View>

                  <View style={styles.wordMeta}>
                    <View
                      style={[
                        styles.difficultyBadge,
                        {
                          backgroundColor: getDifficultyColor(word.difficulty),
                        },
                      ]}
                    >
                      <Text style={styles.difficultyText}>
                        {getDifficultyText(word.difficulty)}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Animatable.View>
          ))
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
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    flex: 1,
    textAlign: "center",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderTopWidth: 1,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 12,
  },
  sortButtons: {
    flexDirection: "row",
    flex: 1,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  wordsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  wordCard: {
    borderRadius: 16,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  wordContent: {
    padding: 16,
  },
  wordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  wordText: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  wordActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  wordDefinition: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  wordTranslation: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 12,
  },
  wordFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  wordTags: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  moreTagsText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  wordMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "white",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 280,
  },
});
