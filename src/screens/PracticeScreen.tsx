import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { useApp } from "../contexts/AppContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  generatePracticeWords,
  shuffleArray,
  generateId,
} from "../utils/helpers";
import { Word, GameResult } from "../types";

interface Props {
  navigation: any;
  route?: any;
}

export default function PracticeScreen({ navigation, route }: Props) {
  const { state, actions } = useApp();
  const { theme, isDark } = useTheme();
  const { words, user } = state;
  const [practiceWords, setPracticeWords] = useState<Word[]>([]);
  const [currentGame, setCurrentGame] = useState<any>(null);
  const [gameState, setGameState] = useState<any>({});

  // Get practice type from route params
  const practiceType = route?.params?.practiceType;

  // Theme-based game types
  const getGameTypes = () => [
    {
      id: "flashcards",
      title: "Flashcards",
      subtitle: "Review with spaced repetition",
      icon: "flash-outline",
      gradient: theme.gradients.primary,
      description: "Practice words with traditional flashcards",
    },
    {
      id: "multiple-choice",
      title: "Multiple Choice",
      subtitle: "Choose the correct definition",
      icon: "list-outline",
      gradient: theme.gradients.secondary,
      description: "Select the right answer from options",
    },
    {
      id: "fill-blank",
      title: "Fill the Blank",
      subtitle: "Complete the sentence",
      icon: "create-outline",
      gradient: theme.gradients.accent,
      description: "Fill in missing words in sentences",
    },
    {
      id: "matching",
      title: "Matching Game",
      subtitle: "Connect words with meanings",
      icon: "link-outline",
      gradient: [theme.colors.success, "#059669"],
      description: "Match words with their definitions",
    },
    {
      id: "spelling",
      title: "Spelling Challenge",
      subtitle: "Type the correct spelling",
      icon: "text-outline",
      gradient: [theme.colors.warning, "#d97706"],
      description: "Spell words correctly from audio",
    },
    {
      id: "hiragana-practice",
      title: "Hiragana Practice",
      subtitle: "Learn Japanese characters",
      icon: "language-outline",
      gradient: theme.gradients.primary,
      description: "Practice Hiragana characters and pronunciation",
    },
    {
      id: "numbers-practice",
      title: "Numbers Practice",
      subtitle: "Learn Japanese numbers",
      icon: "calculator-outline",
      gradient: theme.gradients.secondary,
      description: "Practice Japanese numbers in Kanji and Hiragana",
    },
  ];

  useEffect(() => {
    // Generate practice words when component mounts
    if (words.length > 0) {
      const practice = generatePracticeWords(words, 10);
      setPracticeWords(practice);
    }

    // If practiceType is specified, start the appropriate practice mode
    if (practiceType) {
      if (practiceType === "hiragana") {
        startGame("hiragana-practice");
      } else if (practiceType === "numbers") {
        startGame("numbers-practice");
      }
    }
  }, [words, practiceType]);

  const startGame = (gameType: string) => {
    if (practiceWords.length === 0) {
      Alert.alert(
        "No Words Available",
        "Add some words to your vocabulary first before practicing.",
      );
      return;
    }

    const gameWords = practiceWords.slice(0, 5); // Use 5 words per game
    setCurrentGame(gameType);

    switch (gameType) {
      case "flashcards":
        startFlashcardGame(gameWords);
        break;
      case "multiple-choice":
        startMultipleChoiceGame(gameWords);
        break;
      case "fill-blank":
        startFillBlankGame(gameWords);
        break;
      case "matching":
        startMatchingGame(gameWords);
        break;
      case "spelling":
        startSpellingGame(gameWords);
        break;
      case "hiragana-practice":
        startHiraganaPractice();
        break;
      case "numbers-practice":
        startNumbersPractice();
        break;
    }
  };

  const startFlashcardGame = (gameWords: Word[]) => {
    setGameState({
      words: gameWords,
      currentIndex: 0,
      showAnswer: false,
      correctCount: 0,
      startTime: Date.now(),
    });
  };

  const startMultipleChoiceGame = (gameWords: Word[]) => {
    const questions = gameWords.map((word) => {
      const wrongAnswers = shuffleArray(
        words.filter(
          (w) => w.id !== word.id && (w.definition || w.translation),
        ),
      ).slice(0, 3);

      const options = shuffleArray([
        word.definition || word.translation,
        ...wrongAnswers.map((w) => w.definition || w.translation),
      ]);

      return {
        word: word.text,
        correct: word.definition || word.translation,
        options,
      };
    });

    setGameState({
      questions,
      currentIndex: 0,
      selectedAnswer: null,
      correctCount: 0,
      startTime: Date.now(),
    });
  };

  const startFillBlankGame = (gameWords: Word[]) => {
    // Create sentences with blanks (simplified)
    const questions = gameWords.map((word) => ({
      sentence: `The word "_____" means ${word.definition || word.translation}`,
      answer: word.text,
      userAnswer: "",
    }));

    setGameState({
      questions,
      currentIndex: 0,
      correctCount: 0,
      startTime: Date.now(),
    });
  };

  const startMatchingGame = (gameWords: Word[]) => {
    const words = gameWords.map((w) => w.text);
    const definitions = shuffleArray(
      gameWords.map((w) => w.definition || w.translation),
    );

    setGameState({
      words,
      definitions,
      matches: [],
      selectedWord: null,
      selectedDefinition: null,
      correctCount: 0,
      startTime: Date.now(),
    });
  };

  const startSpellingGame = (gameWords: Word[]) => {
    setGameState({
      words: gameWords,
      currentIndex: 0,
      userInput: "",
      correctCount: 0,
      startTime: Date.now(),
    });
  };

  const endGame = async (correctCount: number, totalQuestions: number) => {
    const timeSpent = Math.round((Date.now() - gameState.startTime) / 1000);
    const score = Math.round((correctCount / totalQuestions) * 100);

    const result: GameResult = {
      id: generateId(),
      gameType: currentGame as any,
      wordsUsed: practiceWords.slice(0, totalQuestions).map((w) => w.id),
      correctAnswers: correctCount,
      totalQuestions,
      timeSpent,
      dateCompleted: new Date().toISOString(),
      score,
    };

    // Update daily stats
    await actions.updateTodayStats({
      gamesPlayed: (state.todayStats?.gamesPlayed || 0) + 1,
      timeSpent:
        (state.todayStats?.timeSpent || 0) + Math.round(timeSpent / 60),
    });

    setCurrentGame(null);
    setGameState({});

    Alert.alert(
      "Game Complete!",
      `Score: ${score}%\nCorrect: ${correctCount}/${totalQuestions}\nTime: ${timeSpent}s`,
      [{ text: "OK" }],
    );
  };

  const renderFlashcardGame = () => {
    const { words, currentIndex, showAnswer, correctCount } = gameState;
    const currentWord = words[currentIndex];

    if (!currentWord) return null;

    const handleNext = (isCorrect: boolean) => {
      const newCorrectCount = correctCount + (isCorrect ? 1 : 0);

      if (currentIndex < words.length - 1) {
        setGameState({
          ...gameState,
          currentIndex: currentIndex + 1,
          showAnswer: false,
          correctCount: newCorrectCount,
        });
      } else {
        endGame(newCorrectCount, words.length);
      }
    };

    return (
      <View style={styles.gameContainer}>
        <View style={styles.gameCard}>
          <Text style={styles.gameProgress}>
            {currentIndex + 1} of {words.length}
          </Text>

          <Text style={styles.gameWordText}>{currentWord.text}</Text>

          {showAnswer && (
            <Animatable.View animation="fadeIn" style={styles.answerContainer}>
              <Text style={styles.answerText}>
                {currentWord.definition || currentWord.translation}
              </Text>
            </Animatable.View>
          )}

          {!showAnswer ? (
            <TouchableOpacity
              onPress={() => setGameState({ ...gameState, showAnswer: true })}
              style={styles.showAnswerButton}
            >
              <LinearGradient
                colors={theme.gradients.primary}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Show Answer</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.gameActions}>
              <TouchableOpacity
                onPress={() => handleNext(false)}
                style={[styles.gameActionButton, { flex: 1, marginRight: 8 }]}
              >
                <LinearGradient
                  colors={[theme.colors.error, "#dc2626"]}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Incorrect</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleNext(true)}
                style={[styles.gameActionButton, { flex: 1, marginLeft: 8 }]}
              >
                <LinearGradient
                  colors={[theme.colors.success, "#059669"]}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Correct</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  const startHiraganaPractice = () => {
    // Navigate directly to the Japanese screen with Hiragana tab active
    navigation.navigate("Japanese");
  };

  const startNumbersPractice = () => {
    // Navigate directly to the Numbers screen
    navigation.navigate("Numbers");
  };

  if (currentGame) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View
          style={[styles.headerBar, { backgroundColor: theme.colors.surface }]}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setCurrentGame(null);
                setGameState({});
              }}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 18,
                fontWeight: "600",
              }}
            >
              {getGameTypes().find((g) => g.id === currentGame)?.title}
            </Text>
            <View />
          </View>
        </View>

        {currentGame === "flashcards" && renderFlashcardGame()}
      </View>
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

      {/* Modern Header with Theme Gradient */}
      <LinearGradient
        colors={theme.gradients.primary}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animatable.View animation="fadeInDown" duration={800}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            🎮 Practice
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            Choose a game mode to practice your vocabulary
          </Text>
        </Animatable.View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Quick Stats */}
        <View style={styles.statsSection}>
          <Animatable.View
            animation="slideInLeft"
            delay={300}
            style={styles.statCard}
          >
            <LinearGradient
              colors={theme.gradients.accent}
              style={styles.statIconContainer}
            >
              <Ionicons name="flash" size={24} color="white" />
            </LinearGradient>
            <Text
              style={[styles.statLabel, { color: theme.colors.textSecondary }]}
            >
              Ready to Practice
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              {practiceWords.length}
            </Text>
          </Animatable.View>

          <Animatable.View
            animation="slideInRight"
            delay={400}
            style={styles.statCard}
          >
            <LinearGradient
              colors={theme.gradients.secondary}
              style={styles.statIconContainer}
            >
              <Ionicons name="game-controller" size={24} color="white" />
            </LinearGradient>
            <Text
              style={[styles.statLabel, { color: theme.colors.textSecondary }]}
            >
              Today's Games
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.secondary }]}>
              {state.todayStats?.gamesPlayed || 0}
            </Text>
          </Animatable.View>
        </View>

        {/* Enhanced Game Types */}
        <View style={styles.gamesSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            🎯 Game Modes
          </Text>

          {getGameTypes().map((game, index) => (
            <Animatable.View
              key={game.id}
              animation="fadeInUp"
              delay={500 + index * 100}
            >
              <TouchableOpacity
                onPress={() => startGame(game.id)}
                style={styles.gameCard}
              >
                <LinearGradient
                  colors={game.gradient as [string, string]}
                  style={styles.gameGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.gameContent}>
                    <View style={styles.gameInfo}>
                      <View style={styles.gameHeader}>
                        <Ionicons
                          name={game.icon as any}
                          size={28}
                          color="white"
                        />
                        <Text style={styles.gameTitle}>{game.title}</Text>
                      </View>
                      <Text style={styles.gameSubtitle}>{game.subtitle}</Text>
                      <Text style={styles.gameDescription}>
                        {game.description}
                      </Text>
                    </View>
                    <View style={styles.gameArrow}>
                      <Ionicons
                        name="chevron-forward"
                        size={24}
                        color="white"
                      />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </View>

        {/* Enhanced Empty State */}
        {words.length === 0 && (
          <Animatable.View
            animation="fadeIn"
            delay={800}
            style={styles.emptyState}
          >
            <Text style={styles.emptyEmoji}>🎮</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No words to practice
            </Text>
            <Text
              style={[
                styles.emptyDescription,
                { color: theme.colors.textSecondary },
              ]}
            >
              Add some words to your vocabulary first to start practicing
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Library")}
              style={styles.emptyButton}
            >
              <LinearGradient
                colors={theme.gradients.primary}
                style={styles.buttonGradient}
              >
                <Text style={styles.emptyButtonText}>Add Words</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerBar: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  statsSection: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  gamesSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  gameCard: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  gameGradient: {
    padding: 20,
    borderRadius: 16,
  },
  gameContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gameInfo: {
    flex: 1,
  },
  gameHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  gameTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 12,
  },
  gameSubtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 16,
    marginBottom: 4,
  },
  gameDescription: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  gameArrow: {
    marginLeft: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
    maxWidth: 280,
  },
  emptyButton: {
    borderRadius: 25,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: "center",
  },
  emptyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Game-specific styles
  gameContainer: {
    flex: 1,
    padding: 20,
  },
  gameProgress: {
    textAlign: "center",
    fontSize: 14,
    color: "#64748b",
    marginBottom: 20,
    fontWeight: "600",
  },
  gameWordText: {
    textAlign: "center",
    fontSize: 32,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 30,
  },
  answerContainer: {
    marginBottom: 30,
    padding: 20,
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    borderRadius: 16,
  },
  answerText: {
    textAlign: "center",
    fontSize: 18,
    color: "#667eea",
    lineHeight: 26,
  },
  showAnswerButton: {
    borderRadius: 16,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  gameActions: {
    flexDirection: "row",
    gap: 16,
  },
  gameActionButton: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
