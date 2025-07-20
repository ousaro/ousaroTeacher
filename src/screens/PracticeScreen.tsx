import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
import { useAlert } from "../contexts/AlertContext";

interface Props {
  navigation: any;
  route?: any;
}

export default function PracticeScreen({ navigation, route }: Props) {
  const { state, actions } = useApp();
  const alert = useAlert();
  const { theme } = useTheme();


  const { words } = state;
  const [practiceWords, setPracticeWords] = useState<Word[]>([]);
  const [currentGame, setCurrentGame] = useState<any>(null);
  const [gameState, setGameState] = useState<any>({});

  // Get practice type from route params
  const practiceType = route?.params?.practiceType;

  // Modern game types with improved categorization
  const getGameTypes = () => [
    {
      id: "flashcards",
      title: "Flashcards",
      subtitle: "Spaced repetition learning",
      icon: "layers-outline",
      gradient: ["#667eea", "#764ba2"],
      description: "Master vocabulary with proven spaced repetition technique",
      category: "Memory",
      difficulty: "Beginner",
      estimatedTime: "5-10 min",
    },
    {
      id: "multiple-choice",
      title: "Quick Quiz",
      subtitle: "Multiple choice questions",
      icon: "checkmark-circle-outline",
      gradient: ["#f093fb", "#f5576c"],
      description: "Test your knowledge with instant feedback",
      category: "Assessment",
      difficulty: "Beginner",
      estimatedTime: "3-5 min",
    },
    {
      id: "fill-blank",
      title: "Context Builder",
      subtitle: "Fill in the blanks",
      icon: "text-outline",
      gradient: ["#4facfe", "#00f2fe"],
      description: "Learn words in context with sentence completion",
      category: "Context",
      difficulty: "Intermediate",
      estimatedTime: "5-8 min",
    },
    {
      id: "matching",
      title: "Word Match",
      subtitle: "Connect definitions",
      icon: "swap-horizontal-outline",
      gradient: ["#10b981", "#059669"],
      description: "Match terms with their meanings quickly",
      category: "Speed",
      difficulty: "Intermediate",
      estimatedTime: "3-6 min",
    },
    {
      id: "spelling",
      title: "Spelling Master",
      subtitle: "Type correct spelling",
      icon: "create-outline",
      gradient: ["#f59e0b", "#d97706"],
      description: "Perfect your spelling with audio pronunciation",
      category: "Writing",
      difficulty: "Advanced",
      estimatedTime: "5-10 min",
    },
    {
      id: "hiragana-practice",
      title: "Hiragana Focus",
      subtitle: "Japanese character mastery",
      icon: "language-outline",
      gradient: ["#8b5cf6", "#7c3aed"],
      description: "Master Hiragana characters with stroke practice",
      category: "Language",
      difficulty: "Beginner",
      estimatedTime: "10-15 min",
    },
    {
      id: "numbers-practice",
      title: "Number System",
      subtitle: "Japanese numerals",
      icon: "calculator-outline",
      gradient: ["#ef4444", "#dc2626"],
      description: "Learn Japanese counting and number systems",
      category: "Language",
      difficulty: "Intermediate",
      estimatedTime: "8-12 min",
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
    if (practiceWords.length === 0 && !["hiragana-practice", "numbers-practice"].includes(gameType)) {
      alert({
        title: "No Words Available",
        message: "Add some words to your vocabulary first before practicing.",
        onConfirm: () => navigation.navigate("Library"),
      })
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
      "Practice Complete",
      `Your Score: ${score}%\nCorrect Answers: ${correctCount}/${totalQuestions}\nTime Spent: ${timeSpent}s`,
      [
        { text: "Practice Again", onPress: () => startGame(currentGame) },
        { text: "Done", style: "cancel" }
      ],
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
        <View style={styles.progressIndicator}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentIndex + 1) / words.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
            {currentIndex + 1} of {words.length} • {correctCount} correct
          </Text>
        </View>

        <Animatable.View 
          key={currentIndex}
          animation="fadeInUp"
          style={[styles.flashcard, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.cardContent}>
            <Text style={[styles.wordDisplay, { color: theme.colors.text }]}>
              {currentWord.text}
            </Text>
            
            <View style={styles.cardDivider} />
            
            {showAnswer ? (
              <Animatable.View animation="fadeIn" style={styles.answerSection}>
                <Text style={[styles.answerLabel, { color: theme.colors.textSecondary }]}>
                  Definition
                </Text>
                <Text style={[styles.answerText, { color: theme.colors.primary }]}>
                  {currentWord.definition || currentWord.translation}
                </Text>
              </Animatable.View>
            ) : (
              <View style={styles.hiddenAnswer}>
                <Text style={[styles.tapHint, { color: theme.colors.textSecondary }]}>
                  Tap to reveal definition
                </Text>
              </View>
            )}
          </View>

          {!showAnswer ? (
            <TouchableOpacity
              onPress={() => setGameState({ ...gameState, showAnswer: true })}
              style={styles.revealButton}
            >
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.buttonGradient}
              >
                <Ionicons name="eye-outline" size={20} color="white" />
                <Text style={styles.buttonText}>Reveal Answer</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.responseButtons}>
              <TouchableOpacity
                onPress={() => handleNext(false)}
                style={[styles.responseButton, styles.incorrectButton]}
              >
                <LinearGradient
                  colors={["#ef4444", "#dc2626"]}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="close-outline" size={20} color="white" />
                  <Text style={styles.buttonText}>Incorrect</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleNext(true)}
                style={[styles.responseButton, styles.correctButton]}
              >
                <LinearGradient
                  colors={["#10b981", "#059669"]}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="checkmark-outline" size={20} color="white" />
                  <Text style={styles.buttonText}>Correct</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </Animatable.View>
      </View>
    );
  };

  const startHiraganaPractice = () => {
  };

  const startNumbersPractice = () => {
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "#10b981";
      case "Intermediate": return "#f59e0b";
      case "Advanced": return "#ef4444";
      default: return "#6b7280";
    }
  };

  if (currentGame) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar
          barStyle={theme.isDark ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent
        />
        <View style={[styles.gameHeader, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            onPress={() => {
              alert({
                title: "Exit Practice",
                type: 'error',
                message: "Are you sure you want to exit? Your progress will be lost.",
                onConfirm: () => {
                  setCurrentGame(null);
                  setGameState({});
                },
              });
            }}
            style={styles.exitButton}
          >
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.gameTitle}>
            <Text style={[styles.gameTitleText, { color: theme.colors.text }]}>
              {getGameTypes().find((g) => g.id === currentGame)?.title}
            </Text>
            <Text style={[styles.gameSubtitle, { color: theme.colors.textSecondary }]}>
              {getGameTypes().find((g) => g.id === currentGame)?.subtitle}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {currentGame === "flashcards" && renderFlashcardGame()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={styles.heroHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animatable.View animation="fadeInDown" duration={800}>
            <Text style={styles.heroTitle}>Practice Hub</Text>
            <Text style={styles.heroSubtitle}>
              Choose your learning adventure
            </Text>
          </Animatable.View>

          {/* Quick Stats */}
          <Animatable.View animation="fadeInUp" duration={1000} delay={200}>
            <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.statRow}>
                <View style={styles.statColumn}>
                  <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                    {practiceWords.length}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                    Ready
                  </Text>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.statColumn}>
                  <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                    {state.todayStats?.gamesPlayed || 0}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                    Today
                  </Text>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.statColumn}>
                  <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                    {state.todayStats?.timeSpent || 0}m
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                    Studied
                  </Text>
                </View>
              </View>
            </View>
          </Animatable.View>
        </LinearGradient>

        {/* Practice Modes */}
        <View style={styles.practiceSection}>
          <Text style={[styles.sectionHeader, { color: theme.colors.text }]}>
            Practice Modes
          </Text>
          
          {getGameTypes().map((game, index) => (
            <Animatable.View
              key={game.id}
              animation="fadeInUp"
              delay={300 + index * 100}
            >
              <TouchableOpacity
                onPress={() => startGame(game.id)}
                style={[styles.gameCard, { backgroundColor: theme.colors.surface }]}
              >
                <View style={styles.gameCardHeader}>
                  <LinearGradient
                    colors={game.gradient as [string, string]}
                    style={styles.gameIcon}
                  >
                    <Ionicons name={game.icon as any} size={24} color="white" />
                  </LinearGradient>
                  
                  <View style={styles.gameInfo}>
                    <View style={styles.gameTitleRow}>
                      <Text style={[styles.gameCardTitle, { color: theme.colors.text }]}>
                        {game.title}
                      </Text>
                      <View style={[
                        styles.difficultyBadge, 
                        { backgroundColor: `${getDifficultyColor(game.difficulty)}20` }
                      ]}>
                        <Text style={[
                          styles.difficultyText, 
                          { color: getDifficultyColor(game.difficulty) }
                        ]}>
                          {game.difficulty}
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={[styles.gameCardSubtitle, { color: theme.colors.textSecondary }]}>
                      {game.subtitle}
                    </Text>
                    
                    <Text style={[styles.gameDescription, { color: theme.colors.textSecondary }]}>
                      {game.description}
                    </Text>
                    
                    <View style={styles.gameMetadata}>
                      <View style={styles.metadataItem}>
                        <Ionicons name="folder-outline" size={12} color={theme.colors.textSecondary} />
                        <Text style={[styles.metadataText, { color: theme.colors.textSecondary }]}>
                          {game.category}
                        </Text>
                      </View>
                      <View style={styles.metadataItem}>
                        <Ionicons name="time-outline" size={12} color={theme.colors.textSecondary} />
                        <Text style={[styles.metadataText, { color: theme.colors.textSecondary }]}>
                          {game.estimatedTime}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </View>
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </View>

        {/* Empty State */}
        {words.length === 0 && (
          <Animatable.View animation="fadeIn" delay={800} style={styles.emptyState}>
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              style={styles.emptyIconContainer}
            >
              <Ionicons name="library-outline" size={32} color="white" />
            </LinearGradient>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              Build Your Vocabulary First
            </Text>
            <Text style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}>
              Add words to your library to unlock practice modes and start your learning journey
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Library")}
              style={styles.ctaButton}
            >
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.buttonGradient}
              >
                <Ionicons name="add-outline" size={20} color="white" />
                <Text style={styles.buttonText}>Add Your First Words</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
        )}
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
  
  // Hero Header Styles
  heroHeader: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroTitle: {
    fontSize: 32,
    color: "white",
    fontWeight: "bold",
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 24,
  },
  
  // Stats Card
  statsCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statColumn: {
    flex: 1,
    alignItems: "center",
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 16,
  },
  
  // Practice Section
  practiceSection: {
    padding: 24,
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  
  // Game Cards
  gameCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  gameCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  gameIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  gameCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  gameCardSubtitle: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  gameDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: "600",
  },
  gameMetadata: {
    flexDirection: "row",
    gap: 16,
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metadataText: {
    fontSize: 12,
    fontWeight: "500",
  },
  
  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 280,
  },
  ctaButton: {
    borderRadius: 25,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  
  // Game Screen Styles
  gameHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  exitButton: {
    padding: 8,
  },
  gameTitle: {
    flex: 1,
    alignItems: "center",
  },
  gameTitleText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  gameSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  
  // Flashcard Game
  gameContainer: {
    flex: 1,
    padding: 24,
  },
  progressIndicator: {
    marginBottom: 24,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#667eea",
  },
  progressText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  flashcard: {
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    minHeight: 400,
  },
  cardContent: {
    padding: 32,
    flex: 1,
  },
  wordDisplay: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginBottom: 24,
  },
  answerSection: {
    flex: 1,
    justifyContent: "center",
  },
answerLabel: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  answerText: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 32,
  },
  hiddenAnswer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tapHint: {
    fontSize: 16,
    fontStyle: "italic",
  },
  revealButton: {
    borderRadius: 20,
    marginHorizontal: 32,
    marginBottom: 24,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  responseButtons: {
    flexDirection: "row",
    marginHorizontal: 32,
    marginBottom: 24,
    gap: 12,
  },
  responseButton: {
    flex: 1,
    borderRadius: 20,
  },
  correctButton: {
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  incorrectButton: {
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 20,
    gap: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});