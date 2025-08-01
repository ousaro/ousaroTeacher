import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  RefreshControl,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { useTheme } from "../contexts/ThemeContext";
import { useApp } from "../contexts/AppContext";
import { ThemedButton } from "../components/ThemedComponents";
import { Word } from "../types";
import { FilterState } from "./LibraryFilterSceen";
import { useAlert } from "../contexts/AlertContext";

interface Props {
  navigation: any;
}

export default function LibraryScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { state, actions } = useApp();
  const { words } = state;
  const alert = useAlert();

  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    sortBy: "newest",
    dateRange: "all",
    onlyFavorites: false,
    direction: 'asc'
  });

  // Count active filters (excluding default values)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category !== "all") count++;
    if (filters.dateRange !== "all") count++;
    if (filters.onlyFavorites) count++;
    return count;
  }, [filters]);

  const openFilterScreen = () => {
    navigation.navigate("LibraryFilters", {
      filters,
      onApplyFilters: setFilters,
    });
  };

  const clearAllFilters = () => {
    setFilters({
      category: "all",
      sortBy: "newest",
      dateRange: "all",
      onlyFavorites: false,
      direction: 'asc'
    });
    setSearchQuery("");
  };

  const filteredAndSortedWords = useMemo(() => {
    let filtered = words;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (word) =>
          word.text.toLowerCase().includes(query) ||
          word.translation.toLowerCase().includes(query)
      );
    }

    // Category filter
    switch (filters.category) {
      case "learning":
        filtered = filtered.filter((word) => 0 > 0 && 0 < 80);
        break;
      case "mastered":
        filtered = filtered.filter((word) => 0 >= 80);
        break;
      case "new":
        filtered = filtered.filter((word) => 0 === 0);
        break;
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (filters.dateRange) {
        case "week":
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case "3months":
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case "6months":
          cutoffDate.setMonth(now.getMonth() - 6);
          break;
      }
      
      filtered = filtered.filter(
        (word) => new Date(word.dateAdded) >= cutoffDate
      );
    }

    // Favorites filter
    if (filters.onlyFavorites) {
      filtered = filtered.filter((word) => word.isFavorite);
    }

    // Sorting
    const sortDirection = filters.direction === "asc" ? 1 : -1;

    switch (filters.sortBy) {
      case "alphabetical":
        filtered.sort((a, b) => a.text.localeCompare(b.text) * sortDirection);
        break;
      case "newest":
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime() * sortDirection,
        );
        break;
    }

    return filtered;
  }, [words, searchQuery, filters]);

  const handleWordPress = useCallback((word: Word) => {
    navigation.navigate("WordDetails", { wordId: word.id });
  }, [navigation]);

  const handleDeleteWord = useCallback((word: Word) => {
    alert({
      type: 'confirm',
      title: 'Delete Word',
      message: `Are you sure you want to delete "${word.text}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => actions.deleteWord(word.id),
    });
  }, [actions]);

  const toggleFavorite = useCallback(async (word: Word) => {
    await actions.updateWord(word.id, { isFavorite: !word.isFavorite });
  }, [actions]);

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

  const getSortDisplayText = () => {
    const sortOptions = {
      newest: "Recently Added",
      alphabetical: "Alphabetical", 
      progress: "Progress",
      mastered: "Mastered First",
    };
    return sortOptions[filters.sortBy];
  };

  const getSortDisplayTextJp = () => {
    const sortOptions = {
      newest: "新しく追加",
      alphabetical: "アルファベット順", 
      progress: "進捗",
      mastered: "習得済み優先",
    };
    return sortOptions[filters.sortBy];
  };

  const renderWordCard = ({ item: word, index }: { item: Word; index: number }) => {
    return (
      <Animatable.View
        animation="fadeInUp"
        delay={index * 30}
        style={[
          styles.wordCard,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleWordPress(word)}
          style={styles.wordContent}
          activeOpacity={0.8}
        >
          <View style={styles.wordMain}>
            <View style={styles.wordInfo}>
              <Text style={[styles.wordText, { color: theme.colors.text }]}>
                {word.text}
              </Text>
               <Text style={[styles.wordTranslation, { color: theme.colors.primary }]}>
                  {word.translation}
              </Text>
              {word.definition && (
                <Text 
                style={[styles.wordDefinition, { color: theme.colors.textSecondary }]}
                numberOfLines={2}
              >
                {word.definition}
              </Text>
              )}
            </View>

            <View style={styles.wordActions}>
              <TouchableOpacity
                onPress={() => toggleFavorite(word)}
                style={styles.actionButton}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={word.isFavorite ? "heart" : "heart-outline"}
                  size={20}
                  color={word.isFavorite ? "#ef4444" : theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.wordBottom}>
            <TouchableOpacity
              onPress={() => handleDeleteWord(word)}
              style={styles.moreButton}
              activeOpacity={0.7}
            >
              <Ionicons name="trash" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
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

          <Ionicons
            name="library"
            size={24}
            color={theme.colors.text}
            style={{}}
          />
          
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              My Library
            </Text>
            <Text style={[styles.jpHeaderTitle, { color: theme.colors.textSecondary }]}>
              マイライブラリ
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={() => navigation.navigate("AddWord")}
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.background }]}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search words... / 単語を検索..."
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

      {/* Filter and Sort Controls */}
      <View style={[styles.controlsBar, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.controlsLeft}>
          <Text style={[styles.resultsText, { color: theme.colors.textSecondary }]}>
            {filteredAndSortedWords.length} words
          </Text>
          
          {activeFiltersCount > 0 && (
            <TouchableOpacity
              onPress={clearAllFilters}
              style={styles.clearFiltersButton}
              activeOpacity={0.7}
            >
              <Text style={[styles.clearFiltersText, { color: theme.colors.primary }]}>
                Clear all
              </Text>
              <Text style={[styles.jpClearFiltersText, { color: theme.colors.primary }]}>
                すべてクリア
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.controlsRight}>
          <View style={styles.sortTextContainer}>
            <Text style={[styles.sortText, { color: theme.colors.textSecondary }]}>
              {getSortDisplayText()}
            </Text>
            <Text style={[styles.jpSortText, { color: theme.colors.textSecondary }]}>
              {getSortDisplayTextJp()}
            </Text>
          </View>

          {/* Filter Button */}
          <TouchableOpacity
            onPress={openFilterScreen}
            style={[
              styles.filterButton,
              { 
                backgroundColor: activeFiltersCount > 0 ? theme.colors.primary : 'transparent',
                borderColor: theme.colors.primary,
              }
            ]}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="options" 
              size={18} 
              color={activeFiltersCount > 0 ? "white" : theme.colors.primary} 
            />
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>
                  {activeFiltersCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Filters Preview */}
      {activeFiltersCount > 0 && (
        <View style={[styles.activeFiltersBar, { backgroundColor: theme.colors.background }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activeFiltersContent}
          >
            {filters.category !== "all" && (
              <View style={[styles.activeFilterChip, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.activeFilterText}>
                  {filters.category.charAt(0).toUpperCase() + filters.category.slice(1)}
                </Text>
              </View>
            )}
            
            {filters.onlyFavorites && (
              <View style={[styles.activeFilterChip, { backgroundColor: "#ef4444" }]}>
                <Text style={styles.activeFilterText}>Favorites</Text>
              </View>
            )}         
            
            {filters.dateRange !== "all" && (
              <View style={[styles.activeFilterChip, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.activeFilterText}>
                  Last {filters.dateRange === "week" ? "Week" : 
                       filters.dateRange === "month" ? "Month" :
                       filters.dateRange === "3months" ? "3 Months" : "6 Months"}
                </Text>
              </View>
            )}


            {filters.direction === "asc" ? (
              <View style={[styles.activeFilterChip, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.activeFilterText}>ASC</Text>
              </View>
            ) : (
              <View style={[styles.activeFilterChip, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.activeFilterText}>DESC</Text>
              </View>
            )}

          </ScrollView>
        </View>
      )}

      {/* Words List */}
      {filteredAndSortedWords.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name={searchQuery || activeFiltersCount > 0 ? "search" : "library-outline"}
            size={48}
            color={theme.colors.textSecondary}
          />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            {searchQuery || activeFiltersCount > 0 ? "No words found" : "No words yet"}
          </Text>
          <Text style={[styles.jpEmptyTitle, { color: theme.colors.textSecondary }]}>
            {searchQuery || activeFiltersCount > 0 ? "単語が見つかりません" : "まだ単語がありません"}
          </Text>
          <Text style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}>
            {searchQuery || activeFiltersCount > 0
              ? "Try adjusting your search or filters"
              : "Add your first word to get started"}
          </Text>
          <Text style={[styles.jpEmptyDescription, { color: theme.colors.textSecondary }]}>
            {searchQuery || activeFiltersCount > 0
              ? "検索条件やフィルタを調整してください"
              : "最初の単語を追加して始めましょう"}
          </Text>
          {(searchQuery || activeFiltersCount > 0) ? (
            <ThemedButton
              title="Clear Filters"
              onPress={clearAllFilters}
              variant="secondary"
              size="md"
              style={styles.emptyButton}
            />
          ) : (
            <ThemedButton
              title="Add Word"
              onPress={() => navigation.navigate("AddWord")}
              variant="primary"
              size="md"
              style={styles.emptyButton}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={filteredAndSortedWords}
          renderItem={renderWordCard}
          keyExtractor={(item) => item.id}
          style={styles.wordsList}
          contentContainerStyle={styles.wordsContent}
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
    justifyContent: "space-between",
    marginBottom: 16,
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
    lineHeight: 24,
  },
  headerTextContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  jpHeaderTitle: {
    fontSize: 14,
    marginTop: 2,
    letterSpacing: 1,
  },
  addButton: {
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
  controlsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  controlsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  controlsRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  resultsText: {
    fontSize: 14,
    fontWeight: "500",
  },
  clearFiltersButton: {
    paddingVertical: 4,
  },
  clearFiltersText: {
    fontSize: 12,
    fontWeight: "600",
  },
  jpClearFiltersText: {
    fontSize: 10,
    color: '#888',
    marginTop: 1,
    fontWeight: "500",
  },
  sortText: {
    fontSize: 14,
    fontWeight: "500",
  },
  sortTextContainer: {
    alignItems: "flex-end",
  },
  jpSortText: {
    fontSize: 10,
    color: '#888',
    marginTop: 1,
    fontWeight: "400",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    position: "relative",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "white",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "700",
  },
  activeFiltersBar: {
    paddingVertical: 8,
  },
  activeFiltersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  activeFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeFilterText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  wordsList: {
    flex: 1,
  },
  wordsContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  wordCard: {
    borderRadius: 12,
    marginVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  wordContent: {
    padding: 16,
  },
  wordMain: {
    flexDirection: "row",
    marginBottom: 12,
  },
  wordInfo: {
    flex: 1,
    marginRight: 12,
  },
  wordText: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  wordDefinition: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  wordTranslation: {
    fontSize: 14,
    fontWeight: "500",
    fontStyle: "italic",
  },
  wordActions: {
    justifyContent: "flex-start",
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  wordBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
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
  progressTextContainer: {
    flex: 1,
  },
  jpProgressLabel: {
    fontSize: 10,
    color: '#888',
    marginTop: 1,
  },
  moreButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
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
  jpEmptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  jpEmptyDescription: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 24,
  },
});
