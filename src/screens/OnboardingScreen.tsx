import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { useApp } from "../contexts/AppContext";

type OnboardingScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Onboarding"
>;

interface Props {
  navigation: OnboardingScreenNavigationProp;
}

const onboardingData = [
  {
    id: 1,
    title: "Welcome to OusaroTeacher",
    subtitle: "Your Personal Language Learning Companion",
    description:
      "Learn languages through interactive books, flashcards, and engaging mini-games.",
    icon: "book-outline",
    gradient: ["#667eea", "#764ba2"],
  },
  {
    id: 2,
    title: "Upload & Read Books",
    subtitle: "Learn from Your Favorite Content",
    description:
      "Upload any text file and start learning by selecting words directly from the content.",
    icon: "cloud-upload-outline",
    gradient: ["#f093fb", "#f5576c"],
  },
  {
    id: 3,
    title: "Build Your Vocabulary",
    subtitle: "Save Words with Context",
    description:
      "Add definitions, translations, notes, and practice with intelligent spaced repetition.",
    icon: "library-outline",
    gradient: ["#4facfe", "#00f2fe"],
  },
  {
    id: 4,
    title: "Practice & Play",
    subtitle: "Master Through Mini-Games",
    description:
      "Enjoy flashcards, matching games, quizzes, and more to reinforce your learning.",
    icon: "game-controller-outline",
    gradient: ["#43e97b", "#38f9d7"],
  },
  {
    id: 5,
    title: "Track Progress",
    subtitle: "Stay Motivated with Achievements",
    description:
      "Monitor your learning journey with streaks, statistics, and unlock achievements.",
    icon: "trophy-outline",
    gradient: ["#fa709a", "#fee140"],
  },
];

export default function OnboardingScreen({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { actions } = useApp();

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleGetStarted();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleGetStarted = async () => {
    await actions.createDefaultUser();
    navigation.replace("Main");
  };

  const currentData = onboardingData[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <LinearGradient
        colors={currentData.gradient as [string, string]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleGetStarted}
              style={styles.skipButton}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <Animatable.View
            key={currentIndex}
            animation="fadeInUp"
            duration={800}
            style={styles.mainContent}
          >
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons
                name={currentData.icon as any}
                size={80}
                color="white"
              />
            </View>

            {/* Title */}
            <Text style={styles.title}>{currentData.title}</Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>{currentData.subtitle}</Text>

            {/* Description */}
            <Text style={styles.description}>{currentData.description}</Text>
          </Animatable.View>

          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {onboardingData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentIndex
                    ? styles.activeDot
                    : styles.inactiveDot,
                ]}
              />
            ))}
          </View>

          {/* Navigation Buttons */}
          <View style={styles.navigation}>
            <TouchableOpacity
              onPress={handlePrevious}
              disabled={currentIndex === 0}
              style={[
                styles.navButton,
                currentIndex === 0
                  ? styles.disabledButton
                  : styles.enabledButton,
              ]}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>

            <Text style={styles.pageIndicator}>
              {currentIndex + 1} of {onboardingData.length}
            </Text>

            <TouchableOpacity onPress={handleNext} style={styles.enabledButton}>
              {currentIndex === onboardingData.length - 1 ? (
                <Ionicons name="checkmark" size={24} color="white" />
              ) : (
                <Ionicons name="chevron-forward" size={24} color="white" />
              )}
            </TouchableOpacity>
          </View>

          {/* Get Started Button (only on last screen) */}
          {currentIndex === onboardingData.length - 1 && (
            <Animatable.View
              animation="bounceIn"
              delay={500}
              style={styles.getStartedContainer}
            >
              <TouchableOpacity
                onPress={handleGetStarted}
                style={styles.getStartedButton}
              >
                <Text style={styles.getStartedText}>Get Started</Text>
              </TouchableOpacity>
            </Animatable.View>
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  header: {
    position: "absolute",
    top: 16,
    right: 32,
  },
  skipButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipText: {
    color: "white",
    fontWeight: "600",
  },
  mainContent: {
    alignItems: "center",
  },
  iconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 32,
    borderRadius: 50,
    marginBottom: 32,
  },
  title: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 24,
  },
  description: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 48,
  },
  pagination: {
    flexDirection: "row",
    marginBottom: 32,
  },
  dot: {
    height: 12,
    width: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "white",
  },
  inactiveDot: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  navButton: {
    padding: 16,
    borderRadius: 50,
  },
  enabledButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  disabledButton: {
    opacity: 0.5,
  },
  pageIndicator: {
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  getStartedContainer: {
    position: "absolute",
    bottom: 32,
    width: "100%",
    paddingHorizontal: 32,
  },
  getStartedButton: {
    backgroundColor: "white",
    paddingVertical: 16,
    borderRadius: 16,
  },
  getStartedText: {
    color: "#374151",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
