import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
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
        });
        setIsEditing(true);
      }
    }
  }, [wordId, state.words]);

  const handleSave = async () => {
    if (!formData.text.trim()) {
      alert({
        title: "Error / エラー",
        message: "Please enter a word / 単語を入力してください",
        type: "error",
      })
      return;
    }

    if (!formData.translation.trim()) {
      alert({
        title: "Error / エラー",
        message: "Please enter a translation / 翻訳を入力してください",
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
        };

        await actions.updateWord(wordId, updates);
        alert({
          title: "Success / 成功",
          message: "Word updated successfully! / 単語が正常に更新されました！",
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
          dateAdded: new Date().toISOString(),
          isFavorite: false,
        };

        await actions.addWord(newWord);
        alert({
          title: "Success / 成功",
          message: "Word added successfully! / 単語が正常に追加されました！",
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
            <View style={styles.headerTextContainer}>
              <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                {isEditing ? "Edit Word" : "Add New Word"}
              </Text>
              <Text style={[styles.jpHeaderTitle, { color: theme.colors.textSecondary }]}>
                {isEditing ? "単語を編集" : "新しい単語を追加"}
              </Text>
            </View>
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
              <Text style={[styles.jpLabel, { color: theme.colors.textSecondary }]}>
                単語 <Text style={{ color: theme.colors.error }}>*</Text>
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
                placeholder="Enter the word / 単語を入力"
                placeholderTextColor={theme.colors.textSecondary}
                autoCapitalize="none"
              />
            </View>

            {/* Translation Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Translation <Text style={{ color: theme.colors.error }}>*</Text>
              </Text>
              <Text style={[styles.jpLabel, { color: theme.colors.textSecondary }]}>
                翻訳 <Text style={{ color: theme.colors.error }}>*</Text>
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
                placeholder="Enter translation / 翻訳を入力"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            {/* Definition Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Definition
              </Text>
              <Text style={[styles.jpLabel, { color: theme.colors.textSecondary }]}>
                定義
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
                placeholder="Enter the definition (optional) / 定義を入力（任意）"
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
              <Text style={[styles.jpLabel, { color: theme.colors.textSecondary }]}>
                発音
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
                placeholder="Enter pronunciation (optional) / 発音を入力（任意）"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            {/* Tags Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Tags
              </Text>
              <Text style={[styles.jpLabel, { color: theme.colors.textSecondary }]}>
                タグ
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
                placeholder="Enter tags separated by commas / カンマ区切りでタグを入力"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            {/* Notes Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Notes
              </Text>
              <Text style={[styles.jpLabel, { color: theme.colors.textSecondary }]}>
                ノート
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
                placeholder="Add any additional notes / 追加のメモを入力"
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
  footer: {
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  jpLabel: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 4,
  },
});
