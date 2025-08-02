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
import { useTheme } from "../contexts/ThemeContext";
import { ThemedButton } from "../components/ThemedComponents";

export interface FilterState {
  category: string;
  sortBy: "newest" | "alphabetical";
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
  jpLabel: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  description: string;
  jpDescription: string;
}

interface SortOption {
  key: "newest" | "alphabetical";
  label: string;
  jpLabel: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  description: string;
  jpDescription: string;
}

interface DateRangeOption {
  key: "all" | "week" | "month" | "3months" | "6months";
  label: string;
  jpLabel: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}

interface DirectionOption {
  key: "asc" | "desc";
  label: string;
  jpLabel: string;
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
      jpLabel: "すべての単語",
      icon: "apps",
      description: "Show all words in your library",
      jpDescription: "ライブラリ内のすべての単語を表示"
    },
    {
      id: "new",
      label: "New",
      jpLabel: "新規",
      icon: "add-circle",
      description: "Words you haven't started learning",
      jpDescription: "学習を開始していない単語"
    }
  ];

  const sortOptions: SortOption[] = [
    {
      key: "newest",
      label: "Recently Added",
      jpLabel: "最近追加",
      icon: "time",
      description: "Show newest words first",
      jpDescription: "最新の単語を最初に表示"
    },
    {
      key: "alphabetical",
      label: "Alphabetical",
      jpLabel: "アルファベット順",
      icon: "text",
      description: "Sort by word alphabetically",
      jpDescription: "単語をアルファベット順にソート"
    }
  ];

  const dateRangeOptions: DateRangeOption[] = [
    { key: "all", label: "All Time", jpLabel: "すべての期間", icon: "infinite" },
    { key: "week", label: "Last Week", jpLabel: "先週", icon: "calendar" },
    { key: "month", label: "Last Month", jpLabel: "先月", icon: "calendar" },
    { key: "3months", label: "Last 3 Months", jpLabel: "過去3ヶ月", icon: "calendar" },
    { key: "6months", label: "Last 6 Months", jpLabel: "過去6ヶ月", icon: "calendar" }
  ];

  const directionOptions : DirectionOption[] = [
    { key: "asc", label: "Ascending", jpLabel: "昇順", icon: "arrow-up" },
    { key: "desc", label: "Descending", jpLabel: "降順", icon: "arrow-down" },
    ];


  const updateFilters = (updates: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const resetFilters = () => {
    const defaultFilters: FilterState = {
      category: "all",
      sortBy: "newest",
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

  const renderSectionHeader = (title: string, jpTitle: string, subtitle?: string, jpSubtitle?: string) => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {title}
      </Text>
      <Text style={[styles.jpSectionTitle, { color: theme.colors.textSecondary }]}>
        {jpTitle}
      </Text>
      {subtitle && (
        <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
          {subtitle}
        </Text>
      )}
      {jpSubtitle && (
        <Text style={[styles.jpSectionSubtitle, { color: theme.colors.textSecondary }]}>
          {jpSubtitle}
        </Text>
      )}
    </View>
  );

  const renderCategoryOptions = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      {renderSectionHeader("Category", "カテゴリ", "Choose what type of words to show", "表示する単語の種類を選択")}
      
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
            
            <Text style={[styles.jpOptionLabel, { color: filters.category === category.id ? theme.colors.primary + '80' : theme.colors.textSecondary }]}>
              {category.jpLabel}
            </Text>
            
            <Text style={[styles.jpOptionDescription, { color: theme.colors.textSecondary }]}>
              {category.jpDescription}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSortOptions = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      {renderSectionHeader("Sort By", "ソート順", "Choose how to order your words", "単語の並び順を選択")}
      
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
                <Text style={[
                  styles.jpSortOptionLabel,
                  { color: filters.sortBy === option.key ? theme.colors.primary : theme.colors.textSecondary }
                ]}>
                  {option.jpLabel}
                </Text>
                <Text style={[styles.sortOptionDescription, { color: theme.colors.textSecondary }]}>
                  {option.description}
                </Text>
                <Text style={[styles.jpSortOptionDescription, { color: theme.colors.textSecondary }]}>
                  {option.jpDescription}
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


  const renderDateRange = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      {renderSectionHeader("Date Added", "追加日", "Filter by when words were added", "単語が追加された日時でフィルタ")}
      
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
            <View style={styles.dateRangeLabelContainer}>
              <Text style={[
                styles.dateRangeText,
                { color: filters.dateRange === option.key ? "white" : theme.colors.text }
              ]}>
                {option.label}
              </Text>
              <Text style={[
                styles.jpDateRangeText,
                { color: filters.dateRange === option.key ? "rgba(255,255,255,0.8)" : "#888" }
              ]}>
                {option.jpLabel}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderDirectionOptions = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        {renderSectionHeader("Direction", "方向", "Choose the order of sorting", "ソート順序を選択")}
        
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
            <Text style={[
                styles.jpDirectionOptionLabel,
                { color: filters.direction === option.key ? theme.colors.primary + '80' : theme.colors.textSecondary }
            ]}>
                {option.jpLabel}
            </Text>
            </TouchableOpacity>
        ))}
        </View>
    </View>
    );


  const renderToggleOptions = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      {renderSectionHeader("Additional Filters", "追加フィルタ", "Refine your search further", "検索をさらに絞り込む")}
      
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
            <Text style={[styles.jpToggleLabel, { color: theme.colors.textSecondary }]}>
              お気に入りのみ
            </Text>
            <Text style={[styles.toggleDescription, { color: theme.colors.textSecondary }]}>
              Show only words marked as favorites
            </Text>
            <Text style={[styles.jpToggleDescription, { color: theme.colors.textSecondary }]}>
              お気に入りに登録された単語のみを表示
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
        
        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Filters & Sort
          </Text>
          <Text style={[styles.jpHeaderTitle, { color: theme.colors.textSecondary }]}>
            フィルタ＆ソート
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={resetFilters}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <View style={styles.resetContainer}>
            <Text style={[styles.resetText, { color: theme.colors.primary }]}>
              Reset
            </Text>
            <Text style={[styles.jpResetText, { color: theme.colors.primary }]}>
              リセット
            </Text>
          </View>
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
  jpSortOptionLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 1,
    marginBottom: 2,
    fontWeight: "500",
  },
  sortOptionDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  jpSortOptionDescription: {
    fontSize: 10,
    color: '#888',
    lineHeight: 14,
    marginTop: 1,
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
  dateRangeLabelContainer: {
    alignItems: "center",
  },
  jpDateRangeText: {
    fontSize: 10,
    marginTop: 1,
    fontWeight: "400",
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
  flexDirection: "column",
  justifyContent: "center",
},
directionOptionLabel: {
  fontSize: 16,
  fontWeight: "600",
  marginTop: 8,
  textAlign: "center",
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
resetContainer: {
  alignItems: "center",
},
jpResetText: {
  fontSize: 10,
  marginTop: 1,
  opacity: 0.8,
},
jpSectionTitle: {
  fontSize: 13,
  marginTop: 2,
},
jpSectionSubtitle: {
  fontSize: 12,
  lineHeight: 18,
  marginTop: 4,
},
jpOptionLabel: {
  fontSize: 12,
  textAlign: "center",
  marginTop: 2,
  fontWeight: "500",
},
jpOptionDescription: {
  fontSize: 10,
  textAlign: "center",
  lineHeight: 14,
  marginTop: 2,
},
jpDirectionOptionLabel: {
  fontSize: 12,
  marginTop: 4,
  fontWeight: "500",
  textAlign: "center",
},
jpToggleLabel: {
  fontSize: 12,
  marginTop: 2,
  fontWeight: "500",
},
jpToggleDescription: {
  fontSize: 10,
  lineHeight: 14,
  marginTop: 2,
},
});