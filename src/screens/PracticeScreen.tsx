import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
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
} from "../utils/helpers";
import { Word } from "../types";
import { useAlert } from "../contexts/AlertContext";
import { hiraganaGroups, katakanaGroups, japaneseNumbers } from "../data/alphabetData";

interface Props {
  navigation: any;
  route?: any;
}

export default function PracticeScreen({ navigation, route }: Props) {
  const { state } = useApp();
  const alert = useAlert();
  const { theme } = useTheme();


  const { words } = state;
  const [practiceWords, setPracticeWords] = useState<Word[]>([]);
  const [currentGame, setCurrentGame] = useState<any>(null);
  const [gameState, setGameState] = useState<any>({});
  const [selectedFocus, setSelectedFocus] = useState<string | null>(null);
  const [gamesCompleted, setGamesCompleted] = useState<number>(0);

  // Get practice type from route params
  const practiceType = route?.params?.practiceType;

  // Focus types
  const getFocusTypes = () => [
    {
      id: "words-focus",
      title: "Words Focus",
      jpTitle: "単語フォーカス",
      subtitle: "Practice vocabulary & definitions",
      jpSubtitle: "語彙と定義の練習",
      icon: "library-outline",
      gradient: ["#667eea", "#764ba2"],
      description: "Master your vocabulary with various game types",
      jpDescription: "様々なゲームタイプで語彙をマスター",
    },
    {
      id: "hiragana-focus",
      title: "Hiragana Focus",
      jpTitle: "ひらがなフォーカス",
      subtitle: "Japanese character mastery",
      jpSubtitle: "日本語文字の習得",
      icon: "language-outline",
      gradient: ["#8b5cf6", "#7c3aed"],
      description: "Learn and practice Hiragana characters",
      jpDescription: "ひらがな文字を学習・練習",
    },
    {      
      id: "katakana-focus",
      title: "Katakana Focus",
      jpTitle: "カタカナフォーカス",
      subtitle: "Japanese character mastery",
      jpSubtitle: "日本語文字の習得",
      icon: "language-outline",
      gradient: ["#ec4899", "#db2777"],
      description: "Learn and practice Katakana characters",
      jpDescription: "カタカナ文字を学習・練習",
    },
    {
      id: "numbers-focus",
      title: "Numbers Focus",
      jpTitle: "数字フォーカス",
      subtitle: "Japanese numerals",
      jpSubtitle: "日本語の数字",
      icon: "calculator-outline",
      gradient: ["#ef4444", "#dc2626"],
      description: "Master Japanese counting and number systems",
      jpDescription: "日本語の数え方と数字システムをマスター",
    },
  ];

  // All available game types
  const getAllGameTypes = () => [
    {
      id: "multiple-choice",
      title: "Quick Quiz",
      jpTitle: "クイッククイズ",
      subtitle: "Multiple choice questions",
      jpSubtitle: "多択問題",
      icon: "checkmark-circle-outline",
      gradient: ["#f093fb", "#f5576c"],
      description: "Test your knowledge with instant feedback",
      jpDescription: "即座のフィードバックで知識をテスト",
      focusTypes: ["words-focus"]
    },
    {
      id: "matching",
      title: "Word Match",
      jpTitle: "単語マッチ",
      subtitle: "Connect definitions",
      jpSubtitle: "定義を接続",
      icon: "swap-horizontal-outline",
      gradient: ["#10b981", "#059669"],
      description: "Match terms with their meanings quickly",
      jpDescription: "用語とその意味を素早くマッチ",
      focusTypes: ["words-focus"]
    },
    {
      id: "spelling",
      title: "Spelling Master",
      jpTitle: "スペリングマスター",
      subtitle: "Type correct spelling",
      jpSubtitle: "正しいスペルを入力",
      icon: "create-outline",
      gradient: ["#f59e0b", "#d97706"],
      description: "Perfect your spelling with audio pronunciation",
      jpDescription: "音声発音でスペリングを完璧に",
      focusTypes: ["words-focus"]
    },
    {
      id: "word-flashcards",
      title: "Word Flashcards",
      jpTitle: "単語フラッシュカード",
      subtitle: "Tap to reveal definitions",
      jpSubtitle: "タップして定義を表示",
      icon: "eye-outline",
      gradient: ["#667eea", "#764ba2"],
      description: "Study vocabulary with interactive flashcards",
      jpDescription: "インタラクティブなフラッシュカードで語彙学習",
      focusTypes: ["words-focus"]
    },
    {
      id: "hiragana-practice",
      title: "Character Study",
      jpTitle: "文字学習",
      subtitle: "Learn & review characters",
      jpSubtitle: "文字を学習・復習",
      icon: "eye-outline",
      gradient: ["#8b5cf6", "#7c3aed"],
      description: "Study Hiragana characters with examples",
      jpDescription: "例を使ってひらがな文字を学習",
      focusTypes: ["hiragana-focus"]
    },
    {
      id: "hiragana-quiz",
      title: "Hiragana Quiz",
      jpTitle: "ひらがなクイズ",
      subtitle: "Multiple choice character quiz",
      jpSubtitle: "多択文字クイズ",
      icon: "checkmark-circle-outline",
      gradient: ["#a855f7", "#9333ea"],
      description: "Test your Hiragana knowledge with quizzes",
      jpDescription: "クイズでひらがなの知識をテスト",
      focusTypes: ["hiragana-focus"]
    },
    {
      id: "katakana-practice",
      title: "Character Study",
      jpTitle: "文字学習",
      subtitle: "Learn & review characters",
      jpSubtitle: "文字を学習・復習",
      icon: "eye-outline",
      gradient: ["#ec4899", "#db2777"],
      description: "Study Katakana characters with examples",
      jpDescription: "例を使ってカタカナ文字を学習",
      focusTypes: ["katakana-focus"]
    },
    {
      id: "katakana-quiz",
      title: "Katakana Quiz",
      jpTitle: "カタカナクイズ",
      subtitle: "Multiple choice character quiz",
      jpSubtitle: "多択文字クイズ",
      icon: "checkmark-circle-outline",
      gradient: ["#f472b6", "#e879f9"],
      description: "Test your Katakana knowledge with quizzes",
      jpDescription: "クイズでカタカナの知識をテスト",
      focusTypes: ["katakana-focus"]
    },
    {
      id: "numbers-practice",
      title: "Number Study",
      jpTitle: "数字学習",
      subtitle: "Learn Japanese numerals",
      jpSubtitle: "日本語の数字を学習",
      icon: "eye-outline",
      gradient: ["#ef4444", "#dc2626"],
      description: "Study Japanese numbers and pronunciation",
      jpDescription: "日本語の数字と発音を学習",
      focusTypes: ["numbers-focus"]
    },
    {
      id: "numbers-quiz",
      title: "Numbers Quiz",
      jpTitle: "数字クイズ",
      subtitle: "Multiple choice number quiz",
      jpSubtitle: "多択数字クイズ",
      icon: "checkmark-circle-outline",
      gradient: ["#f97316", "#ea580c"],
      description: "Test your Japanese number knowledge",
      jpDescription: "日本語の数字の知識をテスト",
      focusTypes: ["numbers-focus"]
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
        setSelectedFocus('hiragana-focus');
      } else if (practiceType === "katakana") {
        setSelectedFocus('katakana-focus');
      } else if (practiceType === "numbers") {
        setSelectedFocus('numbers-focus');
      }
    }
  }, [words, practiceType]);

  const handleFocusSelect = (focusId: string) => {
    setSelectedFocus(focusId);
    setGamesCompleted(0); // Reset counter
    // Immediately start a random game for this focus
    const availableGames = getAllGameTypes().filter(game => 
      game.focusTypes.includes(focusId)
    );
    if (availableGames.length > 0) {
      const randomGame = shuffleArray(availableGames)[0];
      startGame(randomGame.id);
    }
  };

  const getGamesForFocus = (focusId: string) => {
    const availableGames = getAllGameTypes().filter(game => 
      game.focusTypes.includes(focusId)
    );
    return shuffleArray(availableGames);
  };

  const startGame = (gameType: string) => {
    if (practiceWords.length === 0 && !["hiragana-practice", "katakana-practice", "numbers-practice", "hiragana-quiz", "katakana-quiz", "numbers-quiz"].includes(gameType)) {
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
      case "multiple-choice":
        startMultipleChoiceGame(gameWords);
        break;
      case "matching":
        startMatchingGame(gameWords);
        break;
      case "spelling":
        startSpellingGame(gameWords);
        break;
      case "word-flashcards":
        startWordFlashcards(gameWords);
        break;
      case "hiragana-practice":
        startHiraganaPractice();
        break;
      case "hiragana-quiz":
        startHiraganaQuiz();
        break;
      case "katakana-practice":
        startKatakanaPractice();
        break;
      case "katakana-quiz":
        startKatakanaQuiz();
        break;
      case "numbers-practice":
        startNumbersPractice();
        break;
      case "numbers-quiz":
        startNumbersQuiz();
        break;
    }
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

  const startWordFlashcards = (gameWords: Word[]) => {
    setGameState({
      words: gameWords,
      currentIndex: 0,
      showAnswer: false,
      correctCount: 0,
      startTime: Date.now(),
    });
  };

  const endGame = async () => {
    // Increment games completed counter
    const newGamesCompleted = gamesCompleted + 1;
    setGamesCompleted(newGamesCompleted);

    // Auto-start next random game from the same focus immediately
    if (selectedFocus) {
      const availableGames = getAllGameTypes().filter(game => 
        game.focusTypes.includes(selectedFocus)
      );
      if (availableGames.length > 0) {
        const randomGame = shuffleArray(availableGames)[0];
        startGame(randomGame.id);
      }
    }
  };

  const renderMultipleChoiceGame = () => {
    const { questions, currentIndex, selectedAnswer, correctCount, showingResult } = gameState;
    const currentQuestion = questions[currentIndex];

    if (!currentQuestion) return null;

    const handleAnswerSelect = (answer: string) => {
      if (showingResult) return; // Prevent selection during result display
      
      const isCorrect = answer === currentQuestion.correct;
      
      setGameState({ 
        ...gameState, 
        selectedAnswer: answer,
        showingResult: true,
        wasCorrect: isCorrect,
      });
    };

    const getOptionStyle = (option: string) => {
      if (!showingResult) {
        return selectedAnswer === option 
          ? { backgroundColor: theme.colors.primary }
          : { backgroundColor: theme.colors.background };
      }

      // During result display
      if (option === currentQuestion.correct) {
        return { backgroundColor: '#10b981' }; // Green for correct answer
      }
      if (option === selectedAnswer && option !== currentQuestion.correct) {
        return { backgroundColor: '#ef4444' }; // Red for wrong selected answer
      }
      return { backgroundColor: theme.colors.background };
    };

    const getOptionTextStyle = (option: string) => {
      if (!showingResult) {
        return selectedAnswer === option 
          ? { color: 'white' }
          : { color: theme.colors.text };
      }

      // During result display
      if (option === currentQuestion.correct || 
          (option === selectedAnswer && option !== currentQuestion.correct)) {
        return { color: 'white' };
      }
      return { color: theme.colors.text };
    };

    return (
      <View style={styles.gameContainer}>
        <View style={styles.progressIndicator}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentIndex + 1) / questions.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
            {currentIndex + 1} of {questions.length} • {correctCount} correct
          </Text>
        </View>

        <Animatable.View 
          key={currentIndex}
          animation="fadeInUp"
          style={[styles.questionCard, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.questionText, { color: theme.colors.text }]}>
            What does "{currentQuestion.word}" mean?
          </Text>

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option: string, index: number) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleAnswerSelect(option)}
                disabled={showingResult}
                style={[
                  styles.optionButton,
                  getOptionStyle(option),
                ]}
              >
                <Text style={[
                  styles.optionText,
                  getOptionTextStyle(option),
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {showingResult && (
            <View style={[styles.resultIndicator, { 
              backgroundColor: gameState.wasCorrect ? '#10b981' : '#ef4444' 
            }]}>
              <Ionicons 
                name={gameState.wasCorrect ? "checkmark-circle" : "close-circle"} 
                size={24} 
                color="white" 
              />
              <Text style={styles.resultText}>
                {gameState.wasCorrect ? "Correct!" : `Incorrect! The answer is: ${currentQuestion.correct}`}
              </Text>
            </View>
          )}

          {showingResult && (
            <TouchableOpacity
              onPress={() => {
                const newCorrectCount = correctCount + (gameState.wasCorrect ? 1 : 0);

                if (currentIndex < questions.length - 1) {
                  setGameState({
                    ...gameState,
                    currentIndex: currentIndex + 1,
                    selectedAnswer: null,
                    showingResult: false,
                    wasCorrect: false,
                    correctCount: newCorrectCount,
                  });
                } else {
                  endGame();
                }
              }}
              style={styles.nextButton}
            >
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {currentIndex < questions.length - 1 ? "Next Question" : "Complete Game"}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animatable.View>
      </View>
    );
  };

  const renderMatchingGame = () => {
    const { words, definitions, matches, selectedWord, selectedDefinition, correctCount, showingResult, incorrectMatch } = gameState;

    if (!words || !definitions) return null;

    const handleWordSelect = (word: string) => {
      if (matches.includes(word) || showingResult) return;
      
      if (selectedDefinition) {
        // Check if match is correct
        const wordIndex = practiceWords.findIndex(w => w.text === word);
        const isCorrect = wordIndex !== -1 && 
                         (practiceWords[wordIndex].definition === selectedDefinition ||
                          practiceWords[wordIndex].translation === selectedDefinition);
        
        if (isCorrect) {
          const newMatches = [...matches, word, selectedDefinition];
          const newCorrectCount = correctCount + 1;
          
          setGameState({
            ...gameState,
            matches: newMatches,
            selectedWord: null,
            selectedDefinition: null,
            correctCount: newCorrectCount,
          });

          if (newMatches.length === words.length * 2) {
            setTimeout(() => endGame(), 1000);
          }
        } else {
          // Show incorrect match feedback
          setGameState({
            ...gameState,
            showingResult: true,
            incorrectMatch: { word, definition: selectedDefinition },
          });

          // Auto clear after 2 seconds
          setTimeout(() => {
            setGameState({
              ...gameState,
              selectedWord: null,
              selectedDefinition: null,
              showingResult: false,
              incorrectMatch: null,
            });
          }, 2000);
        }
      } else {
        setGameState({ ...gameState, selectedWord: word });
      }
    };

    const handleDefinitionSelect = (definition: string) => {
      if (matches.includes(definition) || showingResult) return;
      
      if (selectedWord) {
        // Check if match is correct
        const wordIndex = practiceWords.findIndex(w => w.text === selectedWord);
        const isCorrect = wordIndex !== -1 && 
                         (practiceWords[wordIndex].definition === definition ||
                          practiceWords[wordIndex].translation === definition);
        
        if (isCorrect) {
          const newMatches = [...matches, selectedWord, definition];
          const newCorrectCount = correctCount + 1;
          
          setGameState({
            ...gameState,
            matches: newMatches,
            selectedWord: null,
            selectedDefinition: null,
            correctCount: newCorrectCount,
          });

          if (newMatches.length === words.length * 2) {
            setTimeout(() => endGame(), 1000);
          }
        } else {
          // Show incorrect match feedback
          setGameState({
            ...gameState,
            showingResult: true,
            incorrectMatch: { word: selectedWord, definition },
          });

          // Auto clear after 2 seconds
          setTimeout(() => {
            setGameState({
              ...gameState,
              selectedWord: null,
              selectedDefinition: null,
              showingResult: false,
              incorrectMatch: null,
            });
          }, 2000);
        }
      } else {
        setGameState({ ...gameState, selectedDefinition: definition });
      }
    };

    return (
      <View style={styles.gameContainer}>
        <View style={styles.progressIndicator}>
          <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
            {matches.length / 2} of {words.length} matched • {correctCount} correct
          </Text>
        </View>

        {showingResult && incorrectMatch && (
          <View style={[styles.resultIndicator, { backgroundColor: '#ef4444' }]}>
            <Ionicons name="close-circle" size={24} color="white" />
            <Text style={styles.resultText}>
              Incorrect match! "{incorrectMatch.word}" does not match "{incorrectMatch.definition}"
            </Text>
          </View>
        )}

        <View style={styles.matchingContainer}>
          <View style={styles.matchingColumn}>
            <Text style={[styles.columnHeader, { color: theme.colors.text }]}>Words</Text>
            {words.map((word: string, index: number) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleWordSelect(word)}
                style={[
                  styles.matchingItem,
                  { backgroundColor: theme.colors.surface },
                  matches.includes(word) && styles.matchedItem,
                  selectedWord === word && styles.selectedItem,
                ]}
                disabled={showingResult}
              >
                <Text style={[
                  styles.matchingText,
                  { color: theme.colors.text },
                  (matches.includes(word) || selectedWord === word) && { color: 'white' }
                ]}>
                  {word}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.matchingColumn}>
            <Text style={[styles.columnHeader, { color: theme.colors.text }]}>Definitions</Text>
            {definitions.map((definition: string, index: number) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleDefinitionSelect(definition)}
                style={[
                  styles.matchingItem,
                  { backgroundColor: theme.colors.surface },
                  matches.includes(definition) && styles.matchedItem,
                  selectedDefinition === definition && styles.selectedItem,
                ]}
                disabled={showingResult}
              >
                <Text style={[
                  styles.matchingText,
                  { color: theme.colors.text },
                  (matches.includes(definition) || selectedDefinition === definition) && { color: 'white' }
                ]}>
                  {definition}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderSpellingGame = () => {
    const { words, currentIndex, userInput, correctCount, showingResult } = gameState;
    const currentWord = words[currentIndex];

    if (!currentWord) return null;

    const handleInputChange = (text: string) => {
      if (showingResult) return; // Prevent input during result display
      setGameState({ ...gameState, userInput: text });
    };

    const handleSubmit = () => {
      if (showingResult || !userInput.trim()) return;
      
      const isCorrect = userInput.toLowerCase().trim() === currentWord.text.toLowerCase().trim();
      
      setGameState({
        ...gameState,
        showingResult: true,
        wasCorrect: isCorrect,
      });
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
          style={[styles.questionCard, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.questionText, { color: theme.colors.text }]}>
            Spell this word:
          </Text>

          <Text style={[styles.definitionText, { color: theme.colors.primary }]}>
            {currentWord.definition || currentWord.translation}
          </Text>

          <TextInput
            style={[styles.textInput, { 
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
              borderColor: showingResult 
                ? (gameState.wasCorrect ? '#10b981' : '#ef4444')
                : theme.colors.primary 
            }]}
            value={userInput}
            onChangeText={handleInputChange}
            placeholder="Type the word here... / ここに単語を入力..."
            placeholderTextColor={theme.colors.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!showingResult}
            onSubmitEditing={handleSubmit}
          />

          {showingResult && (
            <View style={[styles.resultIndicator, { 
              backgroundColor: gameState.wasCorrect ? '#10b981' : '#ef4444' 
            }]}>
              <Ionicons 
                name={gameState.wasCorrect ? "checkmark-circle" : "close-circle"} 
                size={24} 
                color="white" 
              />
              <Text style={styles.resultText}>
                {gameState.wasCorrect 
                  ? "Correct!" 
                  : `Incorrect! The correct spelling is: ${currentWord.text}`
                }
              </Text>
            </View>
          )}

          {showingResult && (
            <TouchableOpacity
              onPress={() => {
                const newCorrectCount = correctCount + (gameState.wasCorrect ? 1 : 0);

                if (currentIndex < words.length - 1) {
                  setGameState({
                    ...gameState,
                    currentIndex: currentIndex + 1,
                    userInput: "",
                    showingResult: false,
                    wasCorrect: false,
                    correctCount: newCorrectCount,
                  });
                } else {
                  endGame();
                }
              }}
              style={styles.nextButton}
            >
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {currentIndex < words.length - 1 ? "Next Question" : "Complete Game"}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {userInput.trim() && !showingResult && (
            <TouchableOpacity
              onPress={handleSubmit}
              style={styles.nextButton}
            >
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  Check Spelling
                </Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animatable.View>
      </View>
    );
  };

  const renderWordFlashcards = () => {
    const { words, currentIndex, showAnswer } = gameState;
    const currentWord = words[currentIndex];

    if (!currentWord) return null;

    const handleNext = () => {
      if (currentIndex < words.length - 1) {
        setGameState({
          ...gameState,
          currentIndex: currentIndex + 1,
          showAnswer: false,
        });
      } else {
        // End of practice session - start next random game
        const newGamesCompleted = gamesCompleted + 1;
        setGamesCompleted(newGamesCompleted);
        
        if (selectedFocus) {
          const availableGames = getAllGameTypes().filter(game => 
            game.focusTypes.includes(selectedFocus)
          );
          if (availableGames.length > 0) {
            const randomGame = shuffleArray(availableGames)[0];
            startGame(randomGame.id);
          }
        }
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
            {currentIndex + 1} of {words.length}
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
                {currentWord.example && (
                  <Text style={[styles.exampleText, { color: theme.colors.textSecondary }]}>
                    Example: {currentWord.example}
                  </Text>
                )}
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
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.buttonText}>Reveal Definition</Text>
                  <Text style={styles.jpButtonText}>定義を表示</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleNext}
              style={styles.revealButton}
            >
              <LinearGradient
                colors={["#10b981", "#059669"]}
                style={styles.buttonGradient}
              >
                <Ionicons name="arrow-forward-outline" size={20} color="white" />
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.buttonText}>
                    {currentIndex < words.length - 1 ? "Next Word" : "Complete"}
                  </Text>
                  <Text style={styles.jpButtonText}>
                    {currentIndex < words.length - 1 ? "次の単語" : "完了"}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animatable.View>
      </View>
    );
  };

  const renderCharacterQuiz = () => {
    const { questions, currentIndex, selectedAnswer, correctCount, showingResult } = gameState;
    const currentQuestion = questions[currentIndex];

    if (!currentQuestion) return null;

    const handleAnswerSelect = (answer: string) => {
      if (showingResult) return; // Prevent selection during result display
      
      const isCorrect = answer === currentQuestion.correct;
      
      setGameState({ 
        ...gameState, 
        selectedAnswer: answer,
        showingResult: true,
        wasCorrect: isCorrect,
      });
    };

    const getOptionStyle = (option: string) => {
      if (!showingResult) {
        return selectedAnswer === option 
          ? { backgroundColor: theme.colors.primary }
          : { backgroundColor: theme.colors.background };
      }

      // During result display
      if (option === currentQuestion.correct) {
        return { backgroundColor: '#10b981' }; // Green for correct answer
      }
      if (option === selectedAnswer && option !== currentQuestion.correct) {
        return { backgroundColor: '#ef4444' }; // Red for wrong selected answer
      }
      return { backgroundColor: theme.colors.background };
    };

    const getOptionTextStyle = (option: string) => {
      if (!showingResult) {
        return selectedAnswer === option 
          ? { color: 'white' }
          : { color: theme.colors.text };
      }

      // During result display
      if (option === currentQuestion.correct || 
          (option === selectedAnswer && option !== currentQuestion.correct)) {
        return { color: 'white' };
      }
      return { color: theme.colors.text };
    };

    const questionText = currentQuestion.character 
      ? `What is the reading for "${currentQuestion.character}"?`
      : `What is the Japanese for "${currentQuestion.number}"?`;

    const displayItem = currentQuestion.character || currentQuestion.number;

    return (
      <View style={styles.gameContainer}>
        <View style={styles.progressIndicator}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentIndex + 1) / questions.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
            {currentIndex + 1} of {questions.length} • {correctCount} correct
          </Text>
        </View>

        <Animatable.View 
          key={currentIndex}
          animation="fadeInUp"
          style={[styles.questionCard, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.questionText, { color: theme.colors.text }]}>
            {questionText}
          </Text>

          <Text style={[
            currentQuestion.character ? styles.hiraganaDisplay : styles.numberDisplay, 
            { color: theme.colors.primary, fontSize: 48 }
          ]}>
            {displayItem}
          </Text>

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option: string, index: number) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleAnswerSelect(option)}
                disabled={showingResult}
                style={[
                  styles.optionButton,
                  getOptionStyle(option),
                ]}
              >
                <Text style={[
                  styles.optionText,
                  getOptionTextStyle(option),
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {showingResult && (
            <View style={[styles.resultIndicator, { 
              backgroundColor: gameState.wasCorrect ? '#10b981' : '#ef4444' 
            }]}>
              <Ionicons 
                name={gameState.wasCorrect ? "checkmark-circle" : "close-circle"} 
                size={24} 
                color="white" 
              />
              <Text style={styles.resultText}>
                {gameState.wasCorrect ? "Correct!" : `Incorrect! The answer is: ${currentQuestion.correct}`}
              </Text>
            </View>
          )}

          {showingResult && (
            <TouchableOpacity
              onPress={() => {
                const newCorrectCount = correctCount + (gameState.wasCorrect ? 1 : 0);

                if (currentIndex < questions.length - 1) {
                  setGameState({
                    ...gameState,
                    currentIndex: currentIndex + 1,
                    selectedAnswer: null,
                    showingResult: false,
                    wasCorrect: false,
                    correctCount: newCorrectCount,
                  });
                } else {
                  endGame();
                }
              }}
              style={styles.nextButton}
            >
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {currentIndex < questions.length - 1 ? "Next Question" : "Complete Game"}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animatable.View>
      </View>
    );
  };

  const renderAlphaPractice = () => {
    const { characters, currentIndex, showAnswer } = gameState;
    const currentChar = characters[currentIndex];

    if (!currentChar) return null;

    const handleNext = () => {
      if (currentIndex < characters.length - 1) {
        setGameState({
          ...gameState,
          currentIndex: currentIndex + 1,
          showAnswer: false,
        });
      } else {
        // End of practice session - start next random game
        const newGamesCompleted = gamesCompleted + 1;
        setGamesCompleted(newGamesCompleted);
        
        if (selectedFocus) {
          const availableGames = getAllGameTypes().filter(game => 
            game.focusTypes.includes(selectedFocus)
          );
          if (availableGames.length > 0) {
            const randomGame = shuffleArray(availableGames)[0];
            startGame(randomGame.id);
          }
        }
      }
    };

    return (
      <View style={styles.gameContainer}>
        <View style={styles.progressIndicator}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentIndex + 1) / characters.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
            {currentIndex + 1} of {characters.length}
          </Text>
        </View>

        <Animatable.View 
          key={currentIndex}
          animation="fadeInUp"
          style={[styles.flashcard, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.cardContent}>
            <Text style={[styles.hiraganaDisplay, { color: theme.colors.text }]}>
              {currentChar.character}
            </Text>
            
            <View style={styles.cardDivider} />
            
            {showAnswer ? (
              <Animatable.View animation="fadeIn" style={styles.answerSection}>
                <Text style={[styles.answerLabel, { color: theme.colors.textSecondary }]}>
                  Reading
                </Text>
                <Text style={[styles.answerText, { color: theme.colors.primary }]}>
                  {currentChar.name} ({currentChar.pronunciation})
                </Text>
                <Text style={[styles.exampleText, { color: theme.colors.textSecondary }]}>
                  {currentChar.example}
                </Text>
              </Animatable.View>
            ) : (
              <View style={styles.hiddenAnswer}>
                <Text style={[styles.tapHint, { color: theme.colors.textSecondary }]}>
                  Tap to reveal reading
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
                colors={["#8b5cf6", "#7c3aed"]}
                style={styles.buttonGradient}
              >
                <Ionicons name="eye-outline" size={20} color="white" />
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.buttonText}>Reveal Reading</Text>
                  <Text style={styles.jpButtonText}>読み方を表示</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleNext}
              style={styles.revealButton}
            >
              <LinearGradient
                colors={["#10b981", "#059669"]}
                style={styles.buttonGradient}
              >
                <Ionicons name="arrow-forward-outline" size={20} color="white" />
                <Text style={styles.buttonText}>
                  {currentIndex < characters.length - 1 ? "Next Character" : "Complete"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animatable.View>
      </View>
    );
  };

  const renderNumbersPractice = () => {
    const { numbers, currentIndex, showAnswer } = gameState;
    const currentNumber = numbers[currentIndex];

    if (!currentNumber) return null;

    const handleNext = () => {
      if (currentIndex < numbers.length - 1) {
        setGameState({
          ...gameState,
          currentIndex: currentIndex + 1,
          showAnswer: false,
        });
      } else {
        // End of practice session - start next random game
        const newGamesCompleted = gamesCompleted + 1;
        setGamesCompleted(newGamesCompleted);
        
        if (selectedFocus) {
          const availableGames = getAllGameTypes().filter(game => 
            game.focusTypes.includes(selectedFocus)
          );
          if (availableGames.length > 0) {
            const randomGame = shuffleArray(availableGames)[0];
            startGame(randomGame.id);
          }
        }
      }
    };

    return (
      <View style={styles.gameContainer}>
        <View style={styles.progressIndicator}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentIndex + 1) / numbers.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
            {currentIndex + 1} of {numbers.length}
          </Text>
        </View>

        <Animatable.View 
          key={currentIndex}
          animation="fadeInUp"
          style={[styles.flashcard, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.cardContent}>
            <Text style={[styles.numberDisplay, { color: theme.colors.text }]}>
              {currentNumber.number}
            </Text>
            
            <View style={styles.cardDivider} />
            
            {showAnswer ? (
              <Animatable.View animation="fadeIn" style={styles.answerSection}>
                <Text style={[styles.answerLabel, { color: theme.colors.textSecondary }]}>
                  Japanese
                </Text>
                <Text style={[styles.answerText, { color: theme.colors.primary }]}>
                  {currentNumber.text}
                </Text>
                <Text style={[styles.pronunciationText, { color: theme.colors.textSecondary }]}>
                  {currentNumber.pronunciation}
                </Text>
              </Animatable.View>
            ) : (
              <View style={styles.hiddenAnswer}>
                <Text style={[styles.tapHint, { color: theme.colors.textSecondary }]}>
                  Tap to reveal Japanese
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
                colors={["#ef4444", "#dc2626"]}
                style={styles.buttonGradient}
              >
                <Ionicons name="eye-outline" size={20} color="white" />
                <Text style={styles.buttonText}>Reveal Japanese</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleNext}
              style={styles.revealButton}
            >
              <LinearGradient
                colors={["#10b981", "#059669"]}
                style={styles.buttonGradient}
              >
                <Ionicons name="arrow-forward-outline" size={20} color="white" />
                <Text style={styles.buttonText}>
                  {currentIndex < numbers.length - 1 ? "Next Number" : "Complete"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animatable.View>
      </View>
    );
  };

  const startHiraganaPractice = () => {
    // Flatten all hiragana characters from all groups
    const allCharacters = hiraganaGroups
      .flatMap(group => group.characters)
      .filter(char => char !== null);
    
    if (allCharacters.length === 0) {
      alert({
        title: "No Hiragana Characters",
        message: "Hiragana data is not available. Please restart the app.",
        onConfirm: () => {},
      });
      return;
    }

    const practiceCharacters = shuffleArray(allCharacters).slice(0, 10);
    setGameState({
      characters: practiceCharacters,
      currentIndex: 0,
      showAnswer: false,
    });
  };

  const startKatakanaPractice = () => {
    // Flatten all katakana characters from all groups
    const allCharacters = katakanaGroups
      .flatMap(group => group.characters)
      .filter(char => char !== null);
    
    if (allCharacters.length === 0) {
      alert({
        title: "No Katakana Characters",
        message: "Katakana data is not available. Please restart the app.",
        onConfirm: () => {},
      });
      return;
    }

    const practiceCharacters = shuffleArray(allCharacters).slice(0, 10);
    setGameState({
      characters: practiceCharacters,
      currentIndex: 0,
      showAnswer: false,
    });
  };

  const startNumbersPractice = () => {
    const numbers = japaneseNumbers || [];
    
    if (numbers.length === 0) {
      alert({
        title: "No Numbers Available",
        message: "Numbers data is not available. Please restart the app.",
        onConfirm: () => {},
      });
      return;
    }

    const practiceNumbers = shuffleArray(numbers).slice(0, 10);
    setGameState({
      numbers: practiceNumbers,
      currentIndex: 0,
      showAnswer: false,
    });
  };

  const startHiraganaQuiz = () => {
    // Flatten all hiragana characters from all groups
    const allCharacters = hiraganaGroups
      .flatMap(group => group.characters)
      .filter(char => char !== null);
    
    if (allCharacters.length === 0) {
      alert({
        title: "No Hiragana Characters",
        message: "Hiragana data is not available. Please restart the app.",
        onConfirm: () => {},
      });
      return;
    }

    const practiceCharacters = shuffleArray(allCharacters).slice(0, 5);
    const questions = practiceCharacters.map((char) => {
      const wrongAnswers = shuffleArray(
        allCharacters.filter(c => c.name !== char.name)
      ).slice(0, 3);

      const options = shuffleArray([
        char.name,
        ...wrongAnswers.map(c => c.name),
      ]);

      return {
        character: char.character,
        correct: char.name,
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

  const startKatakanaQuiz = () => {
    // Flatten all katakana characters from all groups
    const allCharacters = katakanaGroups
      .flatMap(group => group.characters)
      .filter(char => char !== null);
    
    if (allCharacters.length === 0) {
      alert({
        title: "No Katakana Characters",
        message: "Katakana data is not available. Please restart the app.",
        onConfirm: () => {},
      });
      return;
    }

    const practiceCharacters = shuffleArray(allCharacters).slice(0, 5);
    const questions = practiceCharacters.map((char) => {
      const wrongAnswers = shuffleArray(
        allCharacters.filter(c => c.name !== char.name)
      ).slice(0, 3);

      const options = shuffleArray([
        char.name,
        ...wrongAnswers.map(c => c.name),
      ]);

      return {
        character: char.character,
        correct: char.name,
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

  const startNumbersQuiz = () => {
    const numbers = japaneseNumbers || [];
    
    if (numbers.length === 0) {
      alert({
        title: "No Numbers Available",
        message: "Numbers data is not available. Please restart the app.",
        onConfirm: () => {},
      });
      return;
    }

    const practiceNumbers = shuffleArray(numbers).slice(0, 5);
    const questions = practiceNumbers.map((num) => {
      const wrongAnswers = shuffleArray(
        numbers.filter(n => n.text !== num.text)
      ).slice(0, 3);

      const options = shuffleArray([
        num.text,
        ...wrongAnswers.map(n => n.text),
      ]);

      return {
        number: num.number,
        correct: num.text,
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
                  setSelectedFocus(null); // Reset focus selection
                  setGamesCompleted(0); // Reset game counter
                },
              });
            }}
            style={styles.exitButton}
          >
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.gameTitle}>
            <Text style={[styles.gameTitleText, { color: theme.colors.text }]}>
              {getAllGameTypes().find((g) => g.id === currentGame)?.title}
            </Text>
            <Text style={[styles.jpGameTitleText, { color: theme.colors.textSecondary }]}>
              {getAllGameTypes().find((g) => g.id === currentGame)?.jpTitle}
            </Text>
            <Text style={[styles.gameSubtitle, { color: theme.colors.textSecondary }]}>
              {getAllGameTypes().find((g) => g.id === currentGame)?.subtitle} 
            </Text>
            <Text style={[styles.gameSubtitle, { color: theme.colors.textSecondary }]}>
              • Games: {gamesCompleted}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
        >
          {currentGame === "multiple-choice" && renderMultipleChoiceGame()}
          {currentGame === "matching" && renderMatchingGame()}
          {currentGame === "spelling" && renderSpellingGame()}
          {currentGame === "word-flashcards" && renderWordFlashcards()}
          {currentGame === "hiragana-practice" && renderAlphaPractice()}
          {currentGame === "hiragana-quiz" && renderCharacterQuiz()}
          {currentGame === "katakana-practice" && renderAlphaPractice()}
          {currentGame === "katakana-quiz" && renderCharacterQuiz()}
          {currentGame === "numbers-practice" && renderNumbersPractice()}
          {currentGame === "numbers-quiz" && renderCharacterQuiz()}
        </ScrollView>
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
            <Text style={styles.jpHeroTitle}>プラクティスハブ</Text>
            <Text style={styles.heroSubtitle}>
              Choose your learning focus
            </Text>
            <Text style={styles.jpHeroSubtitle}>
              学習フォーカスを選択
            </Text>
          </Animatable.View>
        </LinearGradient>

        {/* Practice Section */}
        <View style={styles.practiceSection}>
          {!selectedFocus ? (
            <>
              <Text style={[styles.sectionHeader, { color: theme.colors.text }]}>
                Choose Your Focus
              </Text>
              <Text style={[styles.jpSectionHeader, { color: theme.colors.text }]}>
                フォーカスを選択
              </Text>
              
              {getFocusTypes().map((focus, index) => (
                <Animatable.View
                  key={focus.id}
                  animation="fadeInUp"
                  delay={300 + index * 100}
                >
                  <TouchableOpacity
                    onPress={() => handleFocusSelect(focus.id)}
                    style={[styles.gameCard, { backgroundColor: theme.colors.surface }]}
                  >
                    <View style={styles.gameCardHeader}>
                      <LinearGradient
                        colors={focus.gradient as [string, string]}
                        style={styles.gameIcon}
                      >
                        <Ionicons name={focus.icon as any} size={24} color="white" />
                      </LinearGradient>
                      
                      <View style={styles.gameInfo}>
                        <View style={styles.gameTitleRow}>
                          <Text style={[styles.gameCardTitle, { color: theme.colors.text }]}>
                            {focus.title}
                          </Text>
                          <Text style={[styles.jpGameCardTitle, { color: theme.colors.text }]}>
                            {focus.jpTitle}
                          </Text>
                        </View>
                        
                        <Text style={[styles.gameCardSubtitle, { color: theme.colors.textSecondary }]}>
                          {focus.subtitle}
                        </Text>
                        <Text style={[styles.jpGameCardSubtitle, { color: theme.colors.textSecondary }]}>
                          {focus.jpSubtitle}
                        </Text>
                        
                        <Text style={[styles.gameDescription, { color: theme.colors.textSecondary }]}>
                          {focus.description}
                        </Text>
                        <Text style={[styles.jpGameDescription, { color: theme.colors.textSecondary }]}>
                          {focus.jpDescription}
                        </Text>
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
            </>
          ) : (
            <>
              <View style={styles.backButtonContainer}>
                <TouchableOpacity
                  onPress={() => setSelectedFocus(null)}
                  style={styles.backButton}
                >
                  <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
                  <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
                    Back to Focus Selection
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.sectionHeader, { color: theme.colors.text }]}>
                {getFocusTypes().find(f => f.id === selectedFocus)?.title} - Games
              </Text>
              
              {getGamesForFocus(selectedFocus).map((game, index) => (
                <Animatable.View
                  key={game.id}
                  animation="fadeInUp"
                  delay={200 + index * 100}
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
                          <Text style={[styles.jpGameCardTitle, { color: theme.colors.text }]}>
                            {game.jpTitle}
                          </Text>
                        </View>
                        
                        <Text style={[styles.gameCardSubtitle, { color: theme.colors.textSecondary }]}>
                          {game.subtitle}
                        </Text>
                        <Text style={[styles.jpGameCardSubtitle, { color: theme.colors.textSecondary }]}>
                          {game.jpSubtitle}
                        </Text>
                        
                        <Text style={[styles.gameDescription, { color: theme.colors.textSecondary }]}>
                          {game.description}
                        </Text>
                        <Text style={[styles.jpGameDescription, { color: theme.colors.textSecondary }]}>
                          {game.jpDescription}
                        </Text>
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
            </>
          )}
        </View>

        {/* Empty State for Words Focus */}
        {selectedFocus === 'words-focus' && words.length === 0 && (
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
            <Text style={[styles.jpEmptyTitle, { color: theme.colors.textSecondary }]}>
              まず語彙を構築しましょう
            </Text>
            <Text style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}>
              Add words to your library to unlock practice modes and start your learning journey
            </Text>
            <Text style={[styles.jpEmptyDescription, { color: theme.colors.textSecondary }]}>
              ライブラリに単語を追加して練習モードをアンロックし、学習の旅を始めましょう
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
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.buttonText}>Add Your First Words</Text>
                  <Text style={[styles.buttonText, { fontSize: 12, opacity: 0.8 }]}>最初の単語を追加</Text>
                </View>
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
    textAlign: "center",
  },
  jpHeroTitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
    fontWeight: "500",
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 4,
    textAlign: "center",
  },
  jpHeroSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
    marginBottom: 24,
    textAlign: "center",
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
    paddingBottom: 32, // Reduced bottom padding
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  jpSectionHeader: {
    fontSize: 16,
    color: '#888',
    marginTop: 2,
    marginBottom: 20,
    fontWeight: "500",
  },

  // Back Button
  backButtonContainer: {
    marginBottom: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
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
  jpGameCardTitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
    fontWeight: "500",
    flex: 1,
  },
  gameCardSubtitle: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  jpGameCardSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    marginBottom: 8,
    fontWeight: "400",
  },
  gameDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  jpGameDescription: {
    fontSize: 11,
    color: '#888',
    lineHeight: 16,
    marginTop: 2,
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
    marginBottom: 8,
  },
  jpEmptyTitle: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 8,
    maxWidth: 280,
  },
  jpEmptyDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
    maxWidth: 300,
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
  jpGameTitleText: {
    fontSize: 14,
    marginTop: 2,
    fontWeight: "500",
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
    paddingBottom: 32, // Reduced bottom padding
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
    flex: 1,
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
  jpAnswerLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
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
  jpButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "400",
    opacity: 0.8,
  },

  // New Game Styles
  questionCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    minHeight: 300,
    flex: 1,
  },
  questionText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    maxHeight: 60,
  },
  jpQuestionText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 25,
    color: "#666",
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
    justifyContent: 'space-between',
    alignItems: 'stretch',
    maxHeight: 160, // Limit height to prevent overflow
  },
  optionButton: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "transparent",
    width: '47%', // Slightly less than half to account for gap
    minHeight: 36,
    maxHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionText: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "500",
    flexWrap: 'wrap',
    lineHeight: 16,
  },
  nextButton: {
    borderRadius: 16,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginTop: 12,
  },
  sentenceText: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 28,
  },
  blankSpace: {
    borderBottomWidth: 2,
    borderBottomColor: "#667eea",
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  textInput: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 24,
  },
  definitionText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
    maxHeight: 50,
  },
  matchingContainer: {
    flexDirection: "row",
    gap: 16,
    flex: 1,
  },
  matchingColumn: {
    flex: 1,
  },
  columnHeader: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  matchingItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  matchingText: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  selectedItem: {
    backgroundColor: "#667eea",
    borderColor: "#5a67d8",
  },
  matchedItem: {
    backgroundColor: "#10b981",
    borderColor: "#059669",
  },
  hiraganaDisplay: {
    fontSize: 56,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    maxHeight: 80,
  },
  numberDisplay: {
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    maxHeight: 70,
  },
  exampleText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
    fontStyle: "italic",
  },
  pronunciationText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },

  // Add Content Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxHeight: "80%",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: "normal",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 24,
  },
  hintBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  hintText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  modalTextInput: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 50,
  },
  helpText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
  },
  cancelButton: {
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  modalButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
    paddingVertical: 16,
  },

  // Floating Action Button
  fabButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Quick Add Button
  quickAddButton: {
    padding: 8,
    borderRadius: 16,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  // Result Indicator
  resultIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 10,
    gap: 6,
  },

  resultText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
  },
});