import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { useTheme } from "../contexts/ThemeContext";
import { ThemedButton } from "../components/ThemedComponents";

interface Props {
  navigation: any;
  route: {
    params: {
      lessonId: string;
      contentId?: string;
    };
  };
}

interface LessonContent {
  id: string;
  type: "theory" | "example" | "exercise" | "quiz";
  title: string;
  content: string;
  examples?: string[];
  questions?: QuizQuestion[];
  exercises?: Exercise[];
  isCompleted: boolean;
  order: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Exercise {
  id: string;
  instruction: string;
  sentence: string;
  blanks: string[];
  correctAnswers: string[];
}

const { width: screenWidth } = Dimensions.get('window');

export default function LessonPlayerScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const { lessonId, contentId } = route.params;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [exerciseAnswers, setExerciseAnswers] = useState<{ [key: string]: string[] }>({});
  const [showResults, setShowResults] = useState<{ [key: string]: boolean }>({});
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [userNotes, setUserNotes] = useState("");

  // Mock lesson content data
  const lessonContent: LessonContent[] = [
    {
      id: "1",
      type: "theory",
      title: "Introduction to Parts of Speech",
      content: "Parts of speech are the building blocks of language. Every word in English belongs to one of eight categories, each serving a specific function in sentences.\n\nUnderstanding parts of speech is essential for:\n• Constructing grammatically correct sentences\n• Improving your writing clarity\n• Understanding how words relate to each other\n• Building a strong foundation for advanced grammar",
      isCompleted: false,
      order: 1,
    },
    {
      id: "2",
      type: "theory",
      title: "Nouns - The Naming Words",
      content: "Nouns are words that name people, places, things, or ideas. They can be concrete (visible/tangible) or abstract (concepts/feelings).\n\nTypes of Nouns:\n• Common Nouns: general names (dog, city, book)\n• Proper Nouns: specific names (London, Shakespeare)\n• Abstract Nouns: ideas or concepts (love, freedom)\n• Collective Nouns: groups (team, family, flock)",
      examples: [
        "Person: teacher, doctor, Maria, Einstein",
        "Place: school, Paris, park, mountains",
        "Thing: book, computer, car, sunshine",
        "Idea: happiness, freedom, love, justice"
      ],
      isCompleted: false,
      order: 2,
    },
    {
      id: "3",
      type: "example",
      title: "Identifying Nouns in Context",
      content: "Let's practice identifying different types of nouns in real sentences. Pay attention to how nouns function as subjects, objects, and complements.",
      examples: [
        "The quick brown fox jumps over the lazy dog.",
        "Maria studied psychology at Harvard University.",
        "The team showed great courage during the championship.",
        "Love conquers all obstacles in life."
      ],
      isCompleted: false,
      order: 3,
    },
    {
      id: "4",
      type: "exercise",
      title: "Fill in the Blanks - Nouns",
      content: "Complete the sentences by choosing the appropriate noun from the options provided.",
      exercises: [
        {
          id: "ex1",
          instruction: "Choose the correct noun to complete the sentence:",
          sentence: "The _____ flew gracefully across the blue _____.",
          blanks: ["bird", "sky"],
          correctAnswers: ["bird", "sky"]
        },
        {
          id: "ex2",
          instruction: "Fill in with an appropriate proper noun:",
          sentence: "_____ is the capital city of _____.",
          blanks: ["Paris", "France"],
          correctAnswers: ["Paris", "France"]
        }
      ],
      isCompleted: false,
      order: 4,
    },
    {
      id: "5",
      type: "quiz",
      title: "Nouns Knowledge Check",
      content: "Test your understanding of nouns with these multiple-choice questions.",
      questions: [
        {
          id: "q1",
          question: "Which of the following is an abstract noun?",
          options: ["Table", "Happiness", "London", "Teacher"],
          correctAnswer: 1,
          explanation: "Happiness is an abstract noun because it represents an emotion or concept that cannot be physically touched."
        },
        {
          id: "q2",
          question: "Identify the proper noun in this sentence: 'The students visited the Louvre Museum in Paris.'",
          options: ["students", "visited", "Louvre Museum", "museum"],
          correctAnswer: 2,
          explanation: "Louvre Museum is a proper noun because it's the specific name of a place."
        },
        {
          id: "q3",
          question: "What type of noun is 'team' in the sentence 'The team won the championship'?",
          options: ["Common noun", "Proper noun", "Collective noun", "Abstract noun"],
          correctAnswer: 2,
          explanation: "Team is a collective noun because it refers to a group of individuals acting as a single unit."
        }
      ],
      isCompleted: false,
      order: 5,
    }
  ];

  const currentContent = lessonContent[currentIndex];
  const totalSections = lessonContent.length;

  useEffect(() => {
    if (contentId) {
      const index = lessonContent.findIndex(content => content.id === contentId);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [contentId]);

  const progress = useMemo(() => {
    return ((currentIndex + 1) / totalSections) * 100;
  }, [currentIndex, totalSections]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalSections - 1) {
      setCurrentIndex(prev => prev + 1);
      // Mark current section as completed
      setCompletedSections(prev => 
        prev.includes(currentContent.id) ? prev : [...prev, currentContent.id]
      );
    } else {
      // Lesson completed
      Alert.alert(
        "Lesson Completed!",
        "Congratulations! You've completed this lesson.",
        [
          { text: "Review", onPress: () => setCurrentIndex(0) },
          { text: "Continue", onPress: () => navigation.goBack() },
        ]
      );
    }
  }, [currentIndex, totalSections, currentContent.id, navigation]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const handleQuizAnswer = useCallback((questionId: string, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  }, []);

  const handleExerciseAnswer = useCallback((exerciseId: string, blankIndex: number, answer: string) => {
    setExerciseAnswers(prev => ({
      ...prev,
      [exerciseId]: {
        ...(prev[exerciseId] || []),
        [blankIndex]: answer
      }
    }));
  }, []);

  const checkQuizAnswers = useCallback(() => {
    setShowResults(prev => ({
      ...prev,
      [currentContent.id]: true
    }));
  }, [currentContent.id]);

  const checkExerciseAnswers = useCallback(() => {
    setShowResults(prev => ({
      ...prev,
      [currentContent.id]: true
    }));
  }, [currentContent.id]);

  const toggleBookmark = useCallback(() => {
    setIsBookmarked(prev => !prev);
  }, []);

  const getContentIcon = (type: string) => {
    switch (type) {
      case "theory": return "book-outline";
      case "example": return "bulb-outline";
      case "exercise": return "create-outline";
      case "quiz": return "help-circle-outline";
      default: return "document-outline";
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case "theory": return "#3b82f6";
      case "example": return "#f59e0b";
      case "exercise": return "#8b5cf6";
      case "quiz": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const renderTheoryContent = () => (
    <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
      <View style={[styles.contentCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.contentText, { color: theme.colors.text }]}>
          {currentContent.content}
        </Text>
        
        {currentContent.examples && currentContent.examples.length > 0 && (
          <View style={styles.examplesSection}>
            <Text style={[styles.examplesTitle, { color: theme.colors.text }]}>
              Examples:
            </Text>
            {currentContent.examples.map((example, index) => (
              <View key={index} style={[styles.exampleItem, { backgroundColor: theme.colors.background }]}>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
                <Text style={[styles.exampleText, { color: theme.colors.text }]}>
                  {example}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderExampleContent = () => (
    <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
      <View style={[styles.contentCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.contentText, { color: theme.colors.text }]}>
          {currentContent.content}
        </Text>
        
        {currentContent.examples && (
          <View style={styles.examplesSection}>
            {currentContent.examples.map((example, index) => (
              <Animatable.View
                key={index}
                animation="fadeInUp"
                delay={index * 200}
                style={[styles.highlightedExample, { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary }]}
              >
                <Text style={[styles.highlightedExampleText, { color: theme.colors.text }]}>
                  {example}
                </Text>
              </Animatable.View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderExerciseContent = () => (
    <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
      <View style={[styles.contentCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.contentText, { color: theme.colors.text }]}>
          {currentContent.content}
        </Text>
        
        {currentContent.exercises && currentContent.exercises.map((exercise, exerciseIndex) => (
          <View key={exercise.id} style={styles.exerciseContainer}>
            <Text style={[styles.exerciseInstruction, { color: theme.colors.text }]}>
              {exercise.instruction}
            </Text>
            
            <View style={[styles.exerciseSentence, { backgroundColor: theme.colors.background }]}>
              <Text style={[styles.sentenceText, { color: theme.colors.text }]}>
                {exercise.sentence}
              </Text>
            </View>

            <View style={styles.exerciseOptions}>
              {exercise.blanks.map((blank, blankIndex) => (
                <TouchableOpacity
                  key={blankIndex}
                  style={[
                    styles.exerciseOption,
                    { 
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.primary,
                    }
                  ]}
                  onPress={() => handleExerciseAnswer(exercise.id, blankIndex, blank)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.exerciseOptionText, { color: theme.colors.text }]}>
                    {blank}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {showResults[currentContent.id] && (
              <View style={[styles.resultContainer, { backgroundColor: "#10b981" + '15' }]}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text style={[styles.resultText, { color: "#10b981" }]}>
                  Correct! Well done!
                </Text>
              </View>
            )}
          </View>
        ))}

        {!showResults[currentContent.id] && (
          <ThemedButton
            title="Check Answers"
            onPress={checkExerciseAnswers}
            variant="primary"
            size="md"
            style={styles.checkButton}
          />
        )}
      </View>
    </ScrollView>
  );

  const renderQuizContent = () => (
    <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
      <View style={[styles.contentCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.contentText, { color: theme.colors.text }]}>
          {currentContent.content}
        </Text>
        
        {currentContent.questions && currentContent.questions.map((question, questionIndex) => (
          <View key={question.id} style={styles.questionContainer}>
            <Text style={[styles.questionText, { color: theme.colors.text }]}>
              {questionIndex + 1}. {question.question}
            </Text>
            
            <View style={styles.optionsContainer}>
              {question.options.map((option, optionIndex) => {
                const isSelected = selectedAnswers[question.id] === optionIndex;
                const isCorrect = optionIndex === question.correctAnswer;
                const showingResults = showResults[currentContent.id];
                
                let backgroundColor = theme.colors.background;
                let borderColor = theme.colors.textSecondary;
                let textColor = theme.colors.text;
                
                if (showingResults) {
                  if (isCorrect) {
                    backgroundColor = "#10b981" + '15';
                    borderColor = "#10b981";
                    textColor = "#10b981";
                  } else if (isSelected && !isCorrect) {
                    backgroundColor = "#ef4444" + '15';
                    borderColor = "#ef4444";
                    textColor = "#ef4444";
                  }
                } else if (isSelected) {
                  backgroundColor = theme.colors.primary + '15';
                  borderColor = theme.colors.primary;
                  textColor = theme.colors.primary;
                }

                return (
                  <TouchableOpacity
                    key={optionIndex}
                    style={[
                      styles.optionButton,
                      { backgroundColor, borderColor }
                    ]}
                    onPress={() => handleQuizAnswer(question.id, optionIndex)}
                    disabled={showingResults}
                    activeOpacity={0.8}
                  >
                    <View style={styles.optionContent}>
                      <View style={[
                        styles.optionIndicator,
                        { 
                          backgroundColor: isSelected || (showingResults && isCorrect) ? borderColor : 'transparent',
                          borderColor 
                        }
                      ]}>
                        {(isSelected || (showingResults && isCorrect)) && (
                          <Ionicons 
                            name={showingResults && isCorrect ? "checkmark" : "ellipse"} 
                            size={12} 
                            color="white" 
                          />
                        )}
                      </View>
                      <Text style={[styles.optionText, { color: textColor }]}>
                        {option}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {showResults[currentContent.id] && selectedAnswers[question.id] !== undefined && (
              <View style={[styles.explanationContainer, { backgroundColor: theme.colors.background }]}>
                <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
                <Text style={[styles.explanationText, { color: theme.colors.text }]}>
                  {question.explanation}
                </Text>
              </View>
            )}
          </View>
        ))}

        {!showResults[currentContent.id] && Object.keys(selectedAnswers).length > 0 && (
          <ThemedButton
            title="Check Answers"
            onPress={checkQuizAnswers}
            variant="primary"
            size="md"
            style={styles.checkButton}
          />
        )}
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    switch (currentContent.type) {
      case "theory":
        return renderTheoryContent();
      case "example":
        return renderExampleContent();
      case "exercise":
        return renderExerciseContent();
      case "quiz":
        return renderQuizContent();
      default:
        return renderTheoryContent();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={[styles.sectionCounter, { color: theme.colors.textSecondary }]}>
              {currentIndex + 1} of {totalSections}
            </Text>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]} numberOfLines={1}>
              {currentContent.title}
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={toggleBookmark}
            style={styles.bookmarkButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={24}
              color={isBookmarked ? theme.colors.primary : theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressTrack, { backgroundColor: theme.colors.background }]}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.colors.primary,
                  width: `${progress}%`,
                }
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
            {Math.round(progress)}% Complete
          </Text>
        </View>
      </View>

      {/* Content Type Indicator */}
      <View style={styles.typeIndicator}>
        <View style={[styles.typeIconContainer, { backgroundColor: getContentTypeColor(currentContent.type) }]}>
          <Ionicons name={getContentIcon(currentContent.type)} size={16} color="white" />
        </View>
        <Text style={[styles.typeLabel, { color: theme.colors.textSecondary }]}>
          {currentContent.type.charAt(0).toUpperCase() + currentContent.type.slice(1)}
        </Text>
      </View>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>

      {/* Navigation Footer */}
      <View style={[styles.navigationFooter, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          onPress={handlePrevious}
          style={[
            styles.navButton,
            { 
              backgroundColor: currentIndex > 0 ? theme.colors.background : 'transparent',
              opacity: currentIndex > 0 ? 1 : 0.5 
            }
          ]}
          disabled={currentIndex === 0}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
          <Text style={[styles.navButtonText, { color: theme.colors.text }]}>
            Previous
          </Text>
        </TouchableOpacity>

        <View style={styles.sectionDots}>
          {lessonContent.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index <= currentIndex ? theme.colors.primary : theme.colors.textSecondary + '40',
                }
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleNext}
          style={[styles.navButton, { backgroundColor: theme.colors.primary }]}
          activeOpacity={0.8}
        >
          <Text style={[styles.navButtonText, { color: "white" }]}>
            {currentIndex === totalSections - 1 ? "Complete" : "Next"}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  sectionCounter: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "500",
    minWidth: 80,
    textAlign: "right",
  },
  typeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  typeIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
  },
  contentScroll: {
    flex: 1,
  },
  contentCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  examplesSection: {
    marginTop: 16,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  exampleItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  exampleText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  highlightedExample: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  highlightedExampleText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  exerciseContainer: {
    marginTop: 20,
  },
  exerciseInstruction: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  exerciseSentence: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sentenceText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  exerciseOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  exerciseOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  exerciseOptionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  questionContainer: {
    marginTop: 20,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 8,
    marginBottom: 16,
  },
  optionButton: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  optionIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  optionText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  explanationContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  resultContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 12,
  },
  resultText: {
    fontSize: 14,
    fontWeight: "600",
  },
  checkButton: {
    marginTop: 20,
  },
  navigationFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
    minWidth: 80,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  sectionDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});