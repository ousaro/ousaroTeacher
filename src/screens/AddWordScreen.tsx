import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";
import { useApp } from "../contexts/AppContext";
import { ThemedButton } from "../components/ThemedComponents";
import { Word } from "../types";
import { useAlert } from "../contexts/AlertContext";

interface Props {
  route: any;
  navigation: any;
}

export default function AddWordScreen({ route, navigation }: Props) {
  const { theme, isDark } = useTheme();
  const { state, actions } = useApp();
  const alert = useAlert();
  const { word: initialWord = "", wordId } = route.params || {};

  const [formData, setFormData] = useState({
    text: initialWord,
    definition: "",
    translation: "",
    notes: "",
    tags: "",
    pronunciation: "",
    difficulty: 3 as 1 | 2 | 3 | 4 | 5,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (wordId) {
      const existingWord = state.words.find((w) => w.id === wordId);
      if (existingWord) {
        setFormData({
          text: existingWord.text,
          definition: existingWord.definition,
          translation: existingWord.translation,
          notes: existingWord.notes,
          tags: existingWord.tags.join(", "),
          pronunciation: existingWord.pronunciation || "",
          difficulty: existingWord.difficulty,
        });
        setIsEditing(true);
      }
    }
  }, [wordId, state.words]);

  const handleSave = async () => {
    if (!formData.text.trim()) {
      alert({
        title: "Error",
        message: "Please enter a word",
        type: "error",
      })
      return;
    }

    if (!formData.translation.trim()) {
      alert({
        title: "Error",
        message: "Please enter a translation",
        type: "error",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isEditing && wordId) {
        // Update existing word
        const updates: Partial<Word> = {
          text: formData.text.trim(),
          definition: formData.definition.trim(),
          translation: formData.translation.trim(),
          notes: formData.notes.trim(),
          tags: formData.tags
            ? formData.tags.split(",").map((tag) => tag.trim())
            : [],
          pronunciation: formData.pronunciation.trim(),
          difficulty: formData.difficulty,
        };

        await actions.updateWord(wordId, updates);
        alert({
          title: "Success",
          message: "Word updated successfully!",
          type: "success",
          onConfirm: () => navigation.goBack(),
        });
      } else {
        // Create new word
        const newWord: Word = {
          id: Date.now().toString(),
          text: formData.text.trim(),
          definition: formData.definition.trim(),
          translation: formData.translation.trim(),
          notes: formData.notes.trim(),
          tags: formData.tags
            ? formData.tags.split(",").map((tag) => tag.trim())
            : [],
          pronunciation: formData.pronunciation.trim(),
          difficulty: formData.difficulty,
          progress: 0,
          rarity: 0,
          dateAdded: new Date().toISOString(),
          reviewCount: 0,
          correctCount: 0,
          isFavorite: false,
          isMarkedDifficult: false,
        };

        await actions.addWord(newWord);
        alert({
          title: "Success",
          message: "Word added successfully!",
          type: "success",
          onConfirm: () => navigation.goBack(),
        });
        setFormData({
          text: "",
          definition: "",
          translation: "",
          notes: "",
          tags: "",
          pronunciation: "",
          difficulty: 3 as 1 | 2 | 3 | 4 | 5,
        });
      }
    } catch (error) {
      alert({
        title: "Error",
        message: isEditing
          ? "Failed to update word. Please try again."
          : "Failed to add word. Please try again.",
        type: "error",
      })

    } finally {
      setIsLoading(false);
    }
  };

  const difficultyStars = [1, 2, 3, 4, 5];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View
          style={[styles.header, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.headerContent}>
            <ThemedButton
              title=""
              onPress={() => navigation.goBack()}
              variant="ghost"
              size="sm"
              icon="arrow-back"
            />
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              {isEditing ? "Edit Word" : "Add New Word"}
            </Text>
            <View style={{ width: 40 }} />
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            {/* Word Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
               Word <Text style={{ color: theme.colors.error }}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                value={formData.text}
                onChangeText={(text) => setFormData({ ...formData, text })}
                placeholder="Enter the word"
                placeholderTextColor={theme.colors.textSecondary}
                autoCapitalize="none"
              />
            </View>

            {/* Translation Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Translation <Text style={{ color: theme.colors.error }}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                value={formData.translation}
                onChangeText={(text) =>
                  setFormData({ ...formData, translation: text })
                }
                placeholder="Enter translation"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            {/* Definition Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Definition
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                value={formData.definition}
                onChangeText={(text) =>
                  setFormData({ ...formData, definition: text })
                }
                placeholder="Enter the definition (optional)"
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Pronunciation Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Pronunciation
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                value={formData.pronunciation}
                onChangeText={(text) =>
                  setFormData({ ...formData, pronunciation: text })
                }
                placeholder="Enter pronunciation (optional)"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            {/* Difficulty */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Difficulty Level
              </Text>
              <View style={styles.difficultyContainer}>
                {difficultyStars.map((level) => (
                  <ThemedButton
                    key={level}
                    title=""
                    onPress={() =>
                      setFormData({ ...formData, difficulty: level as any })
                    }
                    variant={
                      formData.difficulty >= level ? "primary" : "outline"
                    }
                    size="sm"
                    icon="star"
                  />
                ))}
              </View>
            </View>

            {/* Tags Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Tags
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                value={formData.tags}
                onChangeText={(text) =>
                  setFormData({ ...formData, tags: text })
                }
                placeholder="Enter tags separated by commas"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            {/* Notes Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Notes
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                value={formData.notes}
                onChangeText={(text) =>
                  setFormData({ ...formData, notes: text })
                }
                placeholder="Add any additional notes"
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View
          style={[styles.footer, { backgroundColor: theme.colors.surface }]}
        >
          <ThemedButton
            title={
              isLoading
                ? isEditing
                  ? "Updating..."
                  : "Saving..."
                : isEditing
                  ? "Update Word"
                  : "Save Word"
            }
            onPress={handleSave}
            variant="primary"
            size="lg"
            icon="checkmark"
            disabled={isLoading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: "top",
  },
  difficultyContainer: {
    flexDirection: "row",
    gap: 8,
  },
  footer: {
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});
