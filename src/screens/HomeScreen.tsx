import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { useApp } from "../contexts/AppContext";
import { useTheme } from "../contexts/ThemeContext";

interface Props {
  navigation: any;
}

export default function HomeScreen({ navigation }: Props) {
  const { state } = useApp();
  const { theme } = useTheme();
  const { words } = state;

  const recentWords = words
    .sort(
      (a, b) =>
        new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    )
    .slice(0, 5);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={theme.gradients.primary}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <Animatable.View animation="fadeInLeft" duration={800}>
              <Text style={styles.greeting}>Happy learning</Text>
              <Text style={styles.jpGreeting}>ハッピーラーニング</Text>
              <Text style={styles.userName}>
                Nihon-go Learner
              </Text>
              <Text style={styles.jpUserName}>
                日本語学習者
              </Text>
            </Animatable.View>
            <Animatable.View animation="fadeInRight" duration={800}>
              <TouchableOpacity
                onPress={() => navigation.navigate("Settings")}
                style={styles.settingsButton}
              >
                <Ionicons name="settings-outline" size={24} color="white" />
              </TouchableOpacity>
            </Animatable.View>
          </View>
        </LinearGradient>


        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Quick Actions
            </Text>
            <Text style={styles.jpSectionTitle}>
              クイックアクション
            </Text>
          </View>

          <View style={styles.quickActions}>
            <Animatable.View
              animation="fadeInLeft"
              delay={600}
              style={styles.actionRow}
            >
              <TouchableOpacity
                onPress={() => navigation.navigate("Practice")}
                style={[
                  styles.actionCard,
                  { backgroundColor: theme.colors.surface },
                ]}
              >
                <View
                  style={[styles.actionIcon, { backgroundColor: "#667eea" }]}
                >
                  <Ionicons
                    name="game-controller-outline"
                    size={24}
                    color="white"
                  />
                </View>
                <View style={styles.actionContent}>
                  <Text
                    style={[styles.actionText, { color: theme.colors.text }]}
                  >
                    Practice
                  </Text>
                  <Text style={styles.jpActionText}>
                    練習
                  </Text>
                  <Text
                    style={[
                      styles.actionSubtext,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Mini-games & quizzes
                  </Text>
                  <Text style={styles.jpActionSubtext}>
                    ミニゲーム＆クイズ
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </Animatable.View>

            <Animatable.View
              animation="fadeInLeft"
              delay={700}
              style={styles.actionRow}
            >
              <TouchableOpacity
                onPress={() => navigation.navigate("Library")}
                style={[
                  styles.actionCard,
                  { backgroundColor: theme.colors.surface },
                ]}
              >
                <View
                  style={[styles.actionIcon, { backgroundColor: "#4facfe" }]}
                >
                  <Ionicons name="library-outline" size={24} color="white" />
                </View>
                <View style={styles.actionContent}>
                  <Text
                    style={[styles.actionText, { color: theme.colors.text }]}
                  >
                    Library
                  </Text>
                  <Text style={styles.jpActionText}>
                    ライブラリ
                  </Text>
                  <Text
                    style={[
                      styles.actionSubtext,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Manage your words and sentences
                  </Text>
                  <Text style={styles.jpActionSubtext}>
                    単語と文章を管理
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </Animatable.View>
          </View>
        </View>

        {/* Japanese Learning Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Japanese Basics
          </Text>
          <Text style={styles.jpSectionTitle}>
            日本語の基礎
          </Text>
          <View style={styles.quickActions}>
            <Animatable.View
              animation="fadeInLeft"
              delay={800}
              style={styles.actionRow}
            >
              <TouchableOpacity
                onPress={() => navigation.navigate("Japanese")}
                style={[
                  styles.actionCard,
                  { backgroundColor: theme.colors.surface },
                ]}
              >
                <View
                  style={[styles.actionIcon, { backgroundColor: "#f093fb" }]}
                >
                  <Ionicons name="text-outline" size={24} color="white" />
                </View>
                <View style={styles.actionContent}>
                  <Text
                    style={[styles.actionText, { color: theme.colors.text }]}
                  >
                    Base Characters and Numbers
                  </Text>
                  <Text style={styles.jpActionText}>
                    基本文字と数字
                  </Text>
                  <Text
                    style={[
                      styles.actionSubtext,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Learn Japanese characters
                  </Text>
                  <Text style={styles.jpActionSubtext}>
                    日本語の文字を学ぶ
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </Animatable.View>
          </View>
        </View>

        {/* Empty State or Recent Words */}
        {words.length !== 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Recent Words
                </Text>
                <Text style={styles.jpSectionTitle}>
                  最近の単語
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate("Library")}
                style={[
                  styles.viewAllButton,
                  { backgroundColor: theme.colors.primary + "20" },
                ]}
              >
                <View style={styles.viewAllTextContainer}>
                  <Text
                    style={[styles.viewAllText, { color: theme.colors.primary }]}
                  >
                    View All
                  </Text>
                  <Text
                    style={[styles.jpViewAllText, { color: theme.colors.primary }]}
                  >
                    すべて表示
                  </Text>
                </View>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            </View>
            {recentWords.map((word, index) => (
              <Animatable.View
                key={word.id}
                animation="fadeInUp"
                delay={800 + index * 100}
                style={styles.actionRow}
              >
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("WordDetails", { wordId: word.id })
                  }
                  style={[
                    styles.actionCard,
                    { backgroundColor: theme.colors.surface },
                  ]}
                >
                  <View
                    style={[
                      styles.actionIcon,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  >
                    <Ionicons name="library" size={24} color="white" />
                  </View>
                  <View style={styles.actionContent}>
                    <Text
                      style={[styles.actionText, { color: theme.colors.text }]}
                    >
                      {word.text}
                    </Text>
                   
                    <Text
                        style={[
                          styles.actionSubtext,
                          { color: theme.colors.primary },
                        ]}
                        numberOfLines={1}
                      >
                        {word.translation}
                      </Text>
                     {word.definition && (
                      <Text
                      style={[
                        styles.actionSubtext,
                        { color: theme.colors.textSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {word.definition}
                    </Text>
                     )}
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* floating Add Word Button  always visible */}
      <TouchableOpacity
        onPress={() => navigation.navigate("AddWord")}
        style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  greeting: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  jpGreeting: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 2,
  },
  userName: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
    marginTop: 5,
  },
  jpUserName: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
  },
  settingsButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  statsCards: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statsCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "600",
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  quickActions: {
    gap: 12,
  },
  actionRow: {
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  actionSubtext: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 50,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
    maxWidth: 300,
  },
  emptyButton: {
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  emptyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  actionButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  // New styles for simplified home screen
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
  wordsCard: {
    marginTop: 12,
  },
  wordsOverview: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  wordsStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  wordsStat: {
    alignItems: "center",
  },
  wordsStatNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  wordsStatLabel: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  emptyWordsState: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyWordsText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  addFirstWordButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addFirstWordText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  recentWords: {
    gap: 12,
  },
  recentWordItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  recentWordText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  recentWordDefinition: {
    fontSize: 14,
    lineHeight: 20,
  },
  jpSectionTitle: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  jpActionText: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
    marginBottom: 2,
  },
  jpActionSubtext: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  viewAllTextContainer: {
    alignItems: "center",
  },
  jpViewAllText: {
    fontSize: 10,
    opacity: 0.7,
    marginTop: 1,
  },
});
