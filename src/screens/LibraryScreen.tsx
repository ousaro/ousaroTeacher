import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  StatusBar,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Animatable from "react-native-animatable";
import { useApp } from "../contexts/AppContext";
import { useTheme } from "../contexts/ThemeContext";
import { ThemedCard, ThemedButton } from "../components";
import { generateId, extractWordsFromBook, formatDate } from "../utils/helpers";
import { Book } from "../types";

interface Props {
  navigation: any;
}

export default function LibraryScreen({ navigation }: Props) {
  const { state, actions } = useApp();
  const { theme, isDark } = useTheme();
  const { books, words } = state;
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadBook = async () => {
    try {
      setIsUploading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        let content = "";
        let fileType = file.mimeType || "";

        // Check file size (increase limit to 500MB)
        if (file.size && file.size > 500 * 1024 * 1024) {
          Alert.alert("File Too Large", "Please select a file smaller than 500MB.");
          setIsUploading(false);
          return;
        }

        if (fileType.includes("pdf")) {
          content = `[PDF Document: ${file.name}]\\nURI: ${file.uri}\\n\\nPDF content will be extracted when reading.`;
        } else {
          const fileContent = await FileSystem.readAsStringAsync(file.uri);
          content = fileContent;
        }

        const newBook: Book = {
          id: generateId(),
          title: file.name.replace(/\\.[^/.]+$/, ""),
          author: "Unknown Author",
          content,
          dateAdded: new Date().toISOString(),
          wordCount: content.split(/\\s+/).length,
          wordsExtracted: 0,
          language: "en", // Default language
          totalWords: content.split(/\\s+/).length,
          readingProgress: 0,
          fileType: fileType.includes("pdf") ? "pdf" : "text",
          uri: file.uri,
          fileUri: file.uri, // Ensure fileUri is set for proper PDF reading
        };

        actions.addBook(newBook);
        Alert.alert("Success", "Book uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading book:", error);
      Alert.alert("Error", "Failed to upload book. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const getWordsFromBook = (bookTitle: string) => {
    return words.filter((word) => word.sourceBook === bookTitle).length;
  };

  const EmptyState = () => (
    <Animatable.View animation="fadeIn" style={styles.emptyState}>
      <View
        style={[
          styles.emptyIcon,
          { backgroundColor: `${theme.colors.primary}20` },
        ]}
      >
        <Ionicons
          name="library-outline"
          size={40}
          color={theme.colors.primary}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No Books Yet
      </Text>
      <Text
        style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}
      >
        Upload your first book to start your learning journey. Supported
        formats: TXT, PDF
      </Text>
      <View style={styles.emptyButton}>
        <ThemedButton
          title="Upload Your First Book"
          onPress={handleUploadBook}
          disabled={isUploading}
          icon="cloud-upload-outline"
          variant="primary"
          size="lg"
        />
      </View>
    </Animatable.View>
  );

  const clearLibrary = () => {
    actions.deleteAllBooks();
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
      <LinearGradient
        colors={theme.gradients.header}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animatable.View animation="fadeInDown" duration={800}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Library
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            Upload books and manage your reading content
          </Text>
        </Animatable.View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {books.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Upload Button */}
            <View style={styles.uploadSection}>
              <ThemedButton
                title={isUploading ? "Uploading..." : "Upload New Book"}
                onPress={handleUploadBook}
                disabled={isUploading}
                icon={isUploading ? "sync" : "cloud-upload-outline"}
                variant="primary"
                size="lg"
              />
            </View>

            <View style={styles.clearLibrarySection}>
              <ThemedButton
                title="Clear Library"
                onPress={clearLibrary}
                variant="outline"
              />
              </View>

            {/* Stats */}
            <View style={styles.statsSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Your Library
              </Text>
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <ThemedCard
                    title={books.length.toString()}
                    subtitle="Books"
                    icon="book-outline"
                    variant="elevated"
                  />
                </View>
                <View style={styles.statSpacer} />
                <View style={styles.statCard}>
                  <ThemedCard
                    title={words.length.toString()}
                    subtitle="Words Learned"
                    icon="library-outline"
                    variant="elevated"
                  />
                </View>
              </View>
            </View>

            {/* Books List */}
            <View style={styles.booksSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Recent Books
              </Text>
              {books.map((book, index) => (
                <Animatable.View
                  key={book.id}
                  animation="slideInUp"
                  delay={index * 100}
                  style={styles.bookItem}
                >
                  <ThemedCard
                    title={book.title}
                    subtitle={`${getWordsFromBook(book.title)} words learned • ${formatDate(book.dateAdded)}`}
                    icon="book"
                    onPress={() =>
                      navigation.navigate("BookReader", {
                        bookId: book.id,
                        book,
                      })
                    }
                    variant="elevated"
                  >
                    <View style={styles.progressSection}>
                      <View style={styles.progressHeader}>
                        <Text
                          style={[
                            styles.progressLabel,
                            { color: theme.colors.textSecondary },
                          ]}
                        >
                          Reading Progress
                        </Text>
                        <Text
                          style={[
                            styles.progressValue,
                            { color: theme.colors.text },
                          ]}
                        >
                          {Math.round(book.readingProgress || 0)}%
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.progressTrack,
                          { backgroundColor: theme.colors.border },
                        ]}
                      >
                        <View
                          style={[
                            styles.progressFill,
                            {
                              backgroundColor: theme.colors.primary,
                              width: `${book.readingProgress || 0}%`,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </ThemedCard>
                </Animatable.View>
              ))}
            </View>
          </>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
    maxWidth: 280,
  },
  emptyButton: {
    width: "100%",
  },
  uploadSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  clearLibrarySection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
  },
  statSpacer: {
    width: 16,
  },
  booksSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  bookItem: {
    marginBottom: 16,
  },
  progressSection: {
    marginTop: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
});
