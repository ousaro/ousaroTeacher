import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";

export default function GrammarScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>  
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Grammar Lessons</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Improve your grammar skills with engaging lessons.</Text>
        </View>
        {/* Content for Grammar Lessons */}
        <View style={styles.lessonContainer}>
          <Text style={[styles.lessonTitle, { color: theme.colors.primary }]}>Parts of Speech</Text>
          <Text style={[styles.lessonContent, { color: theme.colors.textSecondary }]}>Learn about nouns, verbs, adjectives, and more.</Text>
          {/* Add more lessons as needed */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  lessonContainer: {
    padding: 20,
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 6,
  },
  lessonContent: {
    fontSize: 16,
    lineHeight: 24,
  },
});

