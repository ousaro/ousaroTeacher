import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import Slider from '@react-native-community/slider';
import { useTheme } from "../contexts/ThemeContext";
import { ThemedButton } from "../components/ThemedComponents";

export interface FilterState {
  category: string;
  sortBy: "newest" | "alphabetical" | "difficulty" | "progress" | "mastered";
  difficultyRange: [number, number];
  progressRange: [number, number];
  dateRange: "all" | "week" | "month" | "3months" | "6months";
  onlyFavorites: boolean;
  direction?: "asc" | "desc";
}

interface Props {
  navigation: any;
  route: any;
}

interface CategoryOption {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  description: string;
}

interface SortOption {
  key: "newest" | "alphabetical" | "difficulty" | "progress" | "mastered";
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  description: string;
}

interface DateRangeOption {
  key: "all" | "week" | "month" | "3months" | "6months";
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}

interface DirectionOption {
  key: "asc" | "desc";
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}

export default function LibraryFiltersScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const { filters: initialFilters, onApplyFilters } = route.params;
  
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const filtersChanged = JSON.stringify(filters) !== JSON.stringify(initialFilters);
    setHasChanges(filtersChanged);
  }, [filters, initialFilters]);

  const categories: CategoryOption[] = [
    {
      id: "all",
      label: "All Words",
      icon: "apps",
      description: "Show all words in your library"
    },
    {
      id: "new",
      label: "New",
      icon: "add-circle",
      description: "Words you haven't started learning"
    },
    {
      id: "learning",
      label: "Learning",
      icon: "school",
      description: "Words you're currently practicing"
    },
    {
      id: "mastered",
      label: "Mastered",
      icon: "checkmark-circle",
      description: "Words you've mastered (80%+ progress)"
    }
  ];

  const sortOptions: SortOption[] = [
    {
      key: "newest",
      label: "Recently Added",
      icon: "time",
      description: "Show newest words first"
    },
    {
      key: "alphabetical",
      label: "Alphabetical",
      icon: "text",
      description: "Sort by word alphabetically"
    },
    {
      key: "difficulty",
      label: "Difficulty",
      icon: "trending-up",
      description: "Show hardest words first"
    },
    {
      key: "progress",
      label: "Progress",
      icon: "stats-chart",
      description: "Show least practiced words first"
    },
    {
      key: "mastered",
      label: "Mastered First",
      icon: "checkmark-circle",
      description: "Show mastered words first"
    }
  ];

  const dateRangeOptions: DateRangeOption[] = [
    { key: "all", label: "All Time", icon: "infinite" },
    { key: "week", label: "Last Week", icon: "calendar" },
    { key: "month", label: "Last Month", icon: "calendar" },
    { key: "3months", label: "Last 3 Months", icon: "calendar" },
    { key: "6months", label: "Last 6 Months", icon: "calendar" }
  ];

  const directionOptions : DirectionOption[] = [
    { key: "asc", label: "Ascending", icon: "arrow-up" },
    { key: "desc", label: "Descending", icon: "arrow-down" },
    ];


  const updateFilters = (updates: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const resetFilters = () => {
    const defaultFilters: FilterState = {
      category: "all",
      sortBy: "newest",
      difficultyRange: [1, 5],
      progressRange: [0, 100],
      dateRange: "all",
      onlyFavorites: false,
      direction: "asc",
    };
    setFilters(defaultFilters);
  };

  const applyFilters = () => {
    onApplyFilters(filters);
    navigation.goBack();
  };

  const cancelFilters = () => {
    navigation.goBack();
  };

  const renderSectionHeader = (title: string, subtitle?: string) => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );

  const renderCategoryOptions = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      {renderSectionHeader("Category", "Choose what type of words to show")}
      
      <View style={styles.optionsGrid}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => updateFilters({ category: category.id })}
            style={[
              styles.optionCard,
              {
                backgroundColor: filters.category === category.id 
                  ? theme.colors.primary + '15' 
                  : theme.colors.background,
                borderColor: filters.category === category.id 
                  ? theme.colors.primary 
                  : 'transparent',
              }
            ]}
            activeOpacity={0.8}
          >
            <View style={[
              styles.optionIcon,
              { backgroundColor: filters.category === category.id 
                  ? theme.colors.primary 
                  : theme.colors.textSecondary + '20' 
              }
            ]}>
              <Ionicons
                name={category.icon}
                size={20}
                color={filters.category === category.id ? "white" : theme.colors.textSecondary}
              />
            </View>
            
            <Text style={[
              styles.optionLabel,
              { color: filters.category === category.id ? theme.colors.primary : theme.colors.text }
            ]}>
              {category.label}
            </Text>
            
            <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
              {category.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSortOptions = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      {renderSectionHeader("Sort By", "Choose how to order your words")}
      
      <View style={styles.sortOptionsContainer}>
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            onPress={() => updateFilters({ sortBy: option.key })}
            style={[
              styles.sortOption,
              {
                backgroundColor: filters.sortBy === option.key 
                  ? theme.colors.primary + '15' 
                  : 'transparent'
              }
            ]}
            activeOpacity={0.8}
          >
            <View style={styles.sortOptionLeft}>
              <View style={[
                styles.sortOptionIcon,
                { backgroundColor: filters.sortBy === option.key 
                    ? theme.colors.primary 
                    : theme.colors.textSecondary + '20' 
                }
              ]}>
                <Ionicons
                  name={option.icon}
                  size={16}
                  color={filters.sortBy === option.key ? "white" : theme.colors.textSecondary}
                />
              </View>
              
              <View style={styles.sortOptionText}>
                <Text style={[
                  styles.sortOptionLabel,
                  { color: filters.sortBy === option.key ? theme.colors.primary : theme.colors.text }
                ]}>
                  {option.label}
                </Text>
                <Text style={[styles.sortOptionDescription, { color: theme.colors.textSecondary }]}>
                  {option.description}
                </Text>
              </View>
            </View>
            
            {filters.sortBy === option.key && (
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderRangeSliders = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      {renderSectionHeader("Ranges", "Filter by difficulty and progress levels")}
      
      {/* Difficulty Range */}
      <View style={styles.sliderContainer}>
        <View style={styles.sliderHeader}>
          <Text style={[styles.sliderLabel, { color: theme.colors.text }]}>
            Difficulty Level
          </Text>
          <Text style={[styles.sliderValue, { color: theme.colors.primary }]}>
            {filters.difficultyRange[0]} - {filters.difficultyRange[1]}
          </Text>
        </View>
        
        <View style={styles.sliderWrapper}>
          <Text style={[styles.sliderMin, { color: theme.colors.textSecondary }]}>1</Text>
          <View style={styles.sliderTrack}>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={5}
              step={1}
              value={filters.difficultyRange[0]}
              onValueChange={(value: number) => 
                updateFilters({ 
                  difficultyRange: [value, Math.max(value, filters.difficultyRange[1])] 
                })
              }
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.textSecondary + '30'}
              thumbTintColor={theme.colors.primary}
            />
            <Slider
              style={[styles.slider, styles.sliderSecond]}
              minimumValue={1}
              maximumValue={5}
              step={1}
              value={filters.difficultyRange[1]}
              onValueChange={(value:number) => 
                updateFilters({ 
                  difficultyRange: [Math.min(value, filters.difficultyRange[0]), value] 
                })
              }
              minimumTrackTintColor="transparent"
              maximumTrackTintColor={theme.colors.primary}
              thumbTintColor={theme.colors.primary}
            />
          </View>
          <Text style={[styles.sliderMax, { color: theme.colors.textSecondary }]}>5</Text>
        </View>
      </View>

      {/* Progress Range */}
      <View style={styles.sliderContainer}>
        <View style={styles.sliderHeader}>
          <Text style={[styles.sliderLabel, { color: theme.colors.text }]}>
            Progress Level
          </Text>
          <Text style={[styles.sliderValue, { color: theme.colors.primary }]}>
            {filters.progressRange[0]}% - {filters.progressRange[1]}%
          </Text>
        </View>
        
        <View style={styles.sliderWrapper}>
          <Text style={[styles.sliderMin, { color: theme.colors.textSecondary }]}>0%</Text>
          <View style={styles.sliderTrack}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={5}
              value={filters.progressRange[0]}
              onValueChange={(value: number) => 
                updateFilters({ 
                  progressRange: [value, Math.max(value, filters.progressRange[1])] 
                })
              }
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.textSecondary + '30'}
              thumbTintColor={theme.colors.primary}
            />
            <Slider
              style={[styles.slider, styles.sliderSecond]}
              minimumValue={0}
              maximumValue={100}
              step={5}
              value={filters.progressRange[1]}
              onValueChange={(value: number) => 
                updateFilters({ 
                  progressRange: [Math.min(value, filters.progressRange[0]), value] 
                })
              }
              minimumTrackTintColor="transparent"
              maximumTrackTintColor={theme.colors.primary}
              thumbTintColor={theme.colors.primary}
            />
          </View>
          <Text style={[styles.sliderMax, { color: theme.colors.textSecondary }]}>100%</Text>
        </View>
      </View>
    </View>
  );

  const renderDateRange = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      {renderSectionHeader("Date Added", "Filter by when words were added")}
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateRangeContainer}
      >
        {dateRangeOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            onPress={() => updateFilters({ dateRange: option.key })}
            style={[
              styles.dateRangeChip,
              {
                backgroundColor: filters.dateRange === option.key 
                  ? theme.colors.primary 
                  : theme.colors.background,
                borderColor: filters.dateRange === option.key 
                  ? theme.colors.primary 
                  : theme.colors.textSecondary + '30',
              }
            ]}
            activeOpacity={0.8}
          >
            <Ionicons
              name={option.icon}
              size={16}
              color={filters.dateRange === option.key ? "white" : theme.colors.textSecondary}
            />
            <Text style={[
              styles.dateRangeText,
              { color: filters.dateRange === option.key ? "white" : theme.colors.text }
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderDirectionOptions = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        {renderSectionHeader("Direction", "Choose the order of sorting")}
        
        <View style={styles.directionOptionsContainer}>
        {directionOptions.map((option) => (
            <TouchableOpacity
            key={option.key}
            onPress={() => updateFilters({ direction: option.key })}
            style={[
                styles.directionOption,
                {
                backgroundColor: filters.direction === option.key 
                    ? theme.colors.primary + '15' 
                    : theme.colors.background,
                borderColor: filters.direction === option.key 
                    ? theme.colors.primary 
                    : 'transparent',
                }
            ]}
            activeOpacity={0.8}
            >
            <Ionicons
                name={option.icon}
                size={20}
                color={filters.direction === option.key ? "white" : theme.colors.textSecondary}
            />
            <Text style={[
                styles.directionOptionLabel,
                { color: filters.direction === option.key ? theme.colors.primary : theme.colors.text }
            ]}>
                {option.label}
            </Text>
            </TouchableOpacity>
        ))}
        </View>
    </View>
    );


  const renderToggleOptions = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      {renderSectionHeader("Additional Filters", "Refine your search further")}
      
      {/* Favorites Toggle */}
      <View style={[styles.toggleOption, { borderBottomColor: theme.colors.background }]}>
        <View style={styles.toggleLeft}>
          <View style={[styles.toggleIcon, { backgroundColor: "#ef4444" + '20' }]}>
            <Ionicons name="heart" size={20} color="#ef4444" />
          </View>
          <View style={styles.toggleText}>
            <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
              Favorites Only
            </Text>
            <Text style={[styles.toggleDescription, { color: theme.colors.textSecondary }]}>
              Show only words marked as favorites
            </Text>
          </View>
        </View>
        <Switch
          value={filters.onlyFavorites}
          onValueChange={(value) => updateFilters({ onlyFavorites: value })}
          trackColor={{ false: theme.colors.textSecondary + '30', true: theme.colors.primary + '40' }}
          thumbColor={filters.onlyFavorites ? theme.colors.primary : theme.colors.textSecondary}
        />
      </View>

    </View>
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
        <TouchableOpacity
          onPress={cancelFilters}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Filters & Sort
        </Text>
        
        <TouchableOpacity
          onPress={resetFilters}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Text style={[styles.resetText, { color: theme.colors.primary }]}>
            Reset
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animatable.View animation="fadeInUp" delay={50}>
            {renderDirectionOptions()}
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={100}>
          {renderCategoryOptions()}
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={200}>
          {renderSortOptions()}
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={300}>
          {renderRangeSliders()}
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={400}>
          {renderDateRange()}
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={500}>
          {renderToggleOptions()}
        </Animatable.View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
        <ThemedButton
          title="Cancel"
          onPress={cancelFilters}
          variant="secondary"
          size="lg"
          style={styles.cancelButton}
        />
        <ThemedButton
          title={`Apply Filters${hasChanges ? ' ✓' : ''}`}
          onPress={applyFilters}
          variant="primary"
          size="lg"
          style={styles.applyButton}
          disabled={!hasChanges}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  resetText: {
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  optionCard: {
    width: "47%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  optionDescription: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
  sortOptionsContainer: {
    gap: 4,
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
  },
  sortOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sortOptionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sortOptionText: {
    flex: 1,
  },
  sortOptionLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  sortOptionDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  sliderWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sliderMin: {
    fontSize: 12,
    fontWeight: "500",
    width: 30,
  },
  sliderMax: {
    fontSize: 12,
    fontWeight: "500",
    width: 30,
    textAlign: "right",
  },
  sliderTrack: {
    flex: 1,
    position: "relative",
    height: 40,
  },
  slider: {
    position: "absolute",
    width: "100%",
    height: 40,
  },
  sliderSecond: {
    transform: [{ scaleY: -1 }],
  },
  dateRangeContainer: {
    gap: 8,
    paddingHorizontal: 4,
  },
  dateRangeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  dateRangeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  toggleOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  toggleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  toggleText: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  translationOptions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  translationOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  translationOptionText: {
    fontSize: 12,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelButton: {
    flex: 1,
  },
  applyButton: {
    flex: 2,
  },
  directionOptionsContainer: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 12,
},
directionOption: {
  width: "48%",
  padding: 16,
  borderRadius: 12,
  borderWidth: 2,
  alignItems: "center",
  flexDirection: "row",
  justifyContent: "center",
},
directionOptionLabel: {
  fontSize: 16,
  fontWeight: "600",
  marginLeft: 10,
},
});