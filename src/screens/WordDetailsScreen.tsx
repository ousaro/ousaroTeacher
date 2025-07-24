import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useApp } from "../contexts/AppContext";
import { ThemedButton, ThemedCard } from "../components/ThemedComponents";
import { Word } from "../types";
import { useAlert } from "../contexts/AlertContext";

interface Props {
  route: any;
  navigation: any;
}

export default function WordDetailsScreen({ route, navigation }: Props) {
  const { theme, isDark } = useTheme();
  const { state, actions } = useApp();
  const alert = useAlert();
  const { wordId } = route.params || {};

  const [word, setWord] = useState<Word | null>(null);

  useEffect(() => {
    if (wordId) {
      const foundWord = state.words.find((w) => w.id === wordId);
      setWord(foundWord || null);
    }
  }, [wordId, state.words]);

  const toggleFavorite = async () => {
    if (!word) return;
    const updatedWord = { ...word, isFavorite: !word.isFavorite };
    await actions.updateWord(word.id, { isFavorite: !word.isFavorite });
    setWord(updatedWord);
  };

  const toggleDifficult = async () => {
    if (!word) return;
    const updatedWord = { ...word, isMarkedDifficult: !word.isMarkedDifficult };
    await actions.updateWord(word.id, {
      isMarkedDifficult: !word.isMarkedDifficult,
    });
    setWord(updatedWord);
  };

  const deleteWord = async () => {
    if (!word) return;

    alert({
      title: "Delete Word",
      message: "Are you sure you want to delete this word? This action cannot be undone.",
      type: 'error',
      onConfirm: () => {
        actions.deleteWord(word.id);
        navigation.goBack();
      },

    });
  };

  const renderDifficultyStars = (difficulty: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= difficulty ? "star" : "star-outline"}
            size={16}
            color={star <= difficulty ? "#f59e0b" : theme.colors.textSecondary}
          />
        ))}
      </View>
    );
  };

  if (!word) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={theme.colors.background}
        />
        <View style={styles.emptyState}>
          <Ionicons
            name="book-outline"
            size={80}
            color={theme.colors.textSecondary}
          />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            Word Not Found
          </Text>
          <Text
            style={[
              styles.emptySubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            The word you're looking for doesn't exist.
          </Text>
          <ThemedButton
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="primary"
            icon="arrow-back"
          />
        </View>
      </SafeAreaView>
    );
  }

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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

       <View style={{ flex: 1, marginHorizontal: 8 }}>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[styles.headerTitle, { color: theme.colors.text, textAlign: 'center' }]}
        >
          <Text style={{ fontWeight: 'bold', fontSize: 18 }}>
            {word.text}
          </Text>
          <Text style={{ fontWeight: 'normal', fontSize: 16, color: theme.colors.primary }}>
            {' - '}{word.translation}
          </Text>
        </Text>
      </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={toggleFavorite}
            style={styles.actionButton}
          >
            <Ionicons
              name={word.isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={word.isFavorite ? "#ef4444" : theme.colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={deleteWord} style={styles.actionButton}>
            <Ionicons
              name="trash-outline"
              size={24}
              color={theme.colors.error}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {/* Word Card */}
        <ThemedCard title={word.text} variant="elevated" style={[styles.card]}>
          <View style={styles.wordHeader}>
            <View style={styles.wordInfo}>
              <Text style={[{ color: theme.colors.primary, marginBottom: 8 }]}>
                {word.translation}
              </Text>
              {word.pronunciation && (
                <Text
                  style={[
                    styles.pronunciation,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  /{word.pronunciation}/
                </Text>
              )}
              <View style={styles.difficultyRow}>
                <Text
                  style={[
                    styles.difficultyLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Difficulty:
                </Text>
                {renderDifficultyStars(word.difficulty)}
              </View>
            </View>

            <View style={styles.badges}>
              {word.isFavorite && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: theme.colors.error },
                  ]}
                >
                  <Ionicons name="heart" size={12} color="white" />
                  <Text style={styles.badgeText}>Favorite</Text>
                </View>
              )}
              {word.isMarkedDifficult && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: theme.colors.warning },
                  ]}
                >
                  <Ionicons name="alert-circle" size={12} color="white" />
                  <Text style={styles.badgeText}>Difficult</Text>
                </View>
              )}
            </View>
          </View>
        </ThemedCard>

        {/* Definition */}
        {word.definition && (
          <ThemedCard title="Definition" icon="book-outline" style={styles.card}>
            <Text style={[styles.definition, { color: theme.colors.text }]}>
              {word.definition}
            </Text>
          </ThemedCard>
        )}

        {/* Tags */}
        {word.tags.length > 0 && (
          <ThemedCard title="Tags" icon="pricetag-outline" style={styles.card}>
            <View style={styles.tagsContainer}>
              {word.tags.map((tag, index) => (
                <View
                  key={index}
                  style={[
                    styles.tag,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </ThemedCard>
        )}

        {/* Progress & Stats */}
        <ThemedCard title="Learning Progress" icon="analytics-outline" style={styles.card}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {Math.round(word.progress)}%
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Progress
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {word.reviewCount}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Reviews
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {word.correctCount}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Correct
              </Text>
            </View>
          </View>
        </ThemedCard>

        {/* Notes */}
        {word.notes && (
          <ThemedCard title="Notes" icon="document-text-outline" style={styles.card}>
            <Text style={[styles.notes, { color: theme.colors.text }]}>
              {word.notes}
            </Text>
          </ThemedCard>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <ThemedButton
            title="Edit Word"
            onPress={() => navigation.navigate("AddWord", { wordId: word.id })}
            variant="outline"
            icon="create-outline"
          />

          <ThemedButton
            title={
              word.isMarkedDifficult ? "Mark as Easy" : "Mark as Difficult"
            }
            onPress={toggleDifficult}
            variant={word.isMarkedDifficult ? "secondary" : "outline"}
            icon={word.isMarkedDifficult ? "checkmark-circle" : "alert-circle"}
          />
        </View>
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  wordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  wordInfo: {
    flex: 1,
  },
  pronunciation: {
    fontSize: 16,
    fontStyle: "italic",
    marginBottom: 8,
  },
  difficultyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  difficultyLabel: {
    fontSize: 14,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
  },
  badges: {
    gap: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  definition: {
    fontSize: 16,
    lineHeight: 24,
  },
  translation: {
    fontSize: 16,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  notes: {
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    gap: 12,
    marginTop: 16,
    marginBottom: 32,
  },
  card: {
    marginBottom: 16,  // Add bottom margin for spacing between cards
    borderRadius: 8,   // Optional: Round the card corners for better aesthetics
    elevation: 2,      // Optional: Elevate effect for card shadow
  },
});
