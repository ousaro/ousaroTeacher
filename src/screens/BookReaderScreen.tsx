import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useTheme } from "../contexts/ThemeContext";
import { useApp } from "../contexts/AppContext";
import { ThemedButton } from "../components/ThemedComponents";
import { PDFReader } from "../components";
import { Book } from "../types";

interface Props {
  route: any;
  navigation: any;
}

export default function BookReaderScreen({ route, navigation }: Props) {
  const { theme, isDark } = useTheme();
  const { state, actions } = useApp();
  const { bookId, book: passedBook } = route.params || {};

  const [currentBook, setCurrentBook] = useState<Book | null>(
    passedBook || null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [testPdfUri, setTestPdfUri] = useState<string | null>(null);

  useEffect(() => {
    if (passedBook) {
      setCurrentBook(passedBook);
    } else if (bookId) {
      const book = state.books.find((b) => b.id === bookId);
      setCurrentBook(book || null);
    }
  }, [bookId, passedBook, state.books]);

  const pickDocument = async () => {
    try {
      setIsLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "text/plain"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setIsLoading(false);
        return;
      }

      const asset = result.assets[0];

      // Check file size (increase limit to 500MB)
      if (asset.size && asset.size > 500 * 1024 * 1024) {
        Alert.alert("File Too Large", "Please select a file smaller than 500MB.");
        setIsLoading(false);
        return;
      }

      // Create a new book entry
      const newBook: Book = {
        id: Date.now().toString(),
        title: asset.name.replace(/\.[^/.]+$/, ""), // Remove file extension
        content: "",
        dateAdded: new Date().toISOString(),
        wordCount: 0,
        wordsExtracted: 0,
        language: "en", // Default to English
        fileType: asset.mimeType === "application/pdf" ? "pdf" : "text",
        fileUri: asset.uri,
        totalWords: 0,
        readingProgress: 0,
        uri: asset.uri,
      };

      // If it's a text file, read the content
      if (asset.mimeType === "text/plain") {
        try {
          const content = await FileSystem.readAsStringAsync(asset.uri);
          newBook.content = content;
          newBook.wordCount = content.split(/\s+/).length;
          newBook.totalWords = newBook.wordCount;
        } catch (error) {
          console.error("Error reading text file:", error);
        }
      }

      await actions.addBook(newBook);
      setCurrentBook(newBook);
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to load document. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addWordFromText = async (text: string) => {
    if (!text.trim()) {
      Alert.alert("Error", "Please provide a word to add");
      return;
    }

    navigation.navigate("AddWord", {
      word: text.trim(),
      bookId: currentBook?.id,
    });
  };

  const handleTestPdfSelected = (uri: string) => {
    setTestPdfUri(uri);
  };


  const renderBookContent = () => {
    // If we have a test PDF, show it
    if (testPdfUri) {
      return (
        <PDFReader
          source={{ uri: testPdfUri }}
          onAddWord={addWordFromText}
          navigation={navigation}
        />
        
      );
    }

    // If we have a current book, immediately show the appropriate reader
    if (currentBook) {
      if (currentBook.fileType === "pdf" && currentBook.fileUri) {
        return (
          <PDFReader
            source={{ uri: currentBook.fileUri }}
            onAddWord={addWordFromText}
            navigation={navigation}
          />
         
        );
      }
    }

    return null;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="document-outline"
        size={80}
        color={theme.colors.textSecondary}
      />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No Book Selected
      </Text>
      <Text
        style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}
      >
        Choose a PDF or text file to start reading and learning new words.
      </Text>

      <View style={styles.buttonContainer}>
        <ThemedButton
          title="Pick a Document"
          onPress={pickDocument}
          variant="primary"
          size="lg"
          icon="folder-open"
          disabled={isLoading}
        />

        <ThemedButton
          title="Browse Library"
          onPress={() => navigation.navigate("Library")}
          variant="outline"
          size="lg"
          icon="library"
        />
      </View>
    </View>
  );

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

        <View style={styles.headerTitle}>
          <Text style={[styles.bookTitle, { color: theme.colors.text }]}>
            {testPdfUri
              ? "PDF Reader Demo"
              : currentBook?.title || "Book Reader"}
          </Text>
          {currentBook && (
            <Text
              style={[styles.bookInfo, { color: theme.colors.textSecondary }]}
            >
              {currentBook.fileType?.toUpperCase()} •{" "}
              {currentBook.language.toUpperCase()}
            </Text>
          )}
          {(testPdfUri) && !currentBook && (
            <Text
              style={[styles.bookInfo, { color: theme.colors.textSecondary }]}
            >
              {"PDF • Test Document"}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={() => {
            if (testPdfUri) {
              setTestPdfUri(null);
            } else {
              pickDocument();
            }
          }}
          style={styles.pickButton}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : testPdfUri ? (
            <Ionicons name="close" size={24} color={theme.colors.primary} />
          ) : (
            <Ionicons
              name="folder-open"
              size={24}
              color={theme.colors.primary}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      {renderBookContent()}
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
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: 16,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  bookInfo: {
    fontSize: 12,
    marginTop: 2,
  },
  pickButton: {
    padding: 8,
  },
  content: {
    flex: 1,
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
    lineHeight: 24,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
});
