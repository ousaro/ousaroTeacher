import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
  SafeAreaView,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import { PanGestureHandler,State  } from 'react-native-gesture-handler';
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { useTheme } from "../contexts/ThemeContext";
import { useApp } from "../contexts/AppContext";
import { AlphabetLetter, NumberItem, CharacterGroup } from "../types";

const { width, height } = Dimensions.get("window");

interface Props {
  navigation: any;
}

export default function AlphabetScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { state, actions } = useApp();
  const [selectedItem, setSelectedItem] = useState<AlphabetLetter | NumberItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"hiragana" | "katakana" | "numbers">("hiragana");
  
  // Enhanced modal animations
  const modalTranslateY = useRef(new Animated.Value(height)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.9)).current;
  
  // Gesture handling
  const gestureState = useRef(new Animated.Value(0)).current;

  // Calculate exact dimensions for 5 columns
  const HORIZONTAL_PADDING = 20;
  const COLUMN_GAP = 8;
  const NUM_COLUMNS = 5;
  const CONTAINER_WIDTH = width - (HORIZONTAL_PADDING * 2);
  const TOTAL_GAP_WIDTH = COLUMN_GAP * (NUM_COLUMNS - 1);
  const ITEM_WIDTH = (CONTAINER_WIDTH - TOTAL_GAP_WIDTH) / NUM_COLUMNS;

  // Get numbers data with error handling
  const getNumbersData = (): NumberItem[] => {
    try {
      return actions.getNumbersByLanguage("japanese") || [];
    } catch (error) {
      console.error("Error getting numbers data:", error);
      return [];
    }
  };

  // Memoized current data with better error handling
  const currentData = useMemo(() => {
    try {
      if (activeTab === "numbers") {
        return getNumbersData();
      }

      const alphabetGroups = actions.getAlphabetGroupsByLanguage?.(activeTab) || [];
      return alphabetGroups;
    } catch (error) {
      console.error("Error getting current data:", error);
      return [];
    }
  }, [activeTab, state?.isLoading, state]);

  // Enhanced modal open animation
  const openModal = () => {
    setModalVisible(true);
    
    // Reset values
    modalTranslateY.setValue(height);
    modalOpacity.setValue(0);
    backdropOpacity.setValue(0);
    modalScale.setValue(0.9);
    
    // Staggered animations for smooth entrance
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(modalTranslateY, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 300,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.spring(modalScale, {
        toValue: 1,
        tension: 120,
        friction: 8,
        delay: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Enhanced modal close animation
  const closeModal = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(modalTranslateY, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(modalScale, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      setTimeout(() => setSelectedItem(null), 100);
    });
  };

  // Handle swipe to dismiss
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: gestureState } }],
    { 
      useNativeDriver: true,
      listener: (event: { nativeEvent: { translationY: number } }) => {
        // Prevent upward movement by clamping the value
        const translationY = event.nativeEvent.translationY;
        if (translationY < 0) {
          // If trying to drag up, reset to 0
          gestureState.setValue(0);
        }
      }
    }
  );

  const onHandlerStateChange = (event: { nativeEvent: { oldState: number; translationY: number; velocityY: number } }) => {
    const { nativeEvent } = event;
    
    if (nativeEvent.oldState === State.ACTIVE) {
      const { translationY, velocityY } = nativeEvent;
      
      // Only respond to downward gestures
      if (translationY > 0) {
        // Dismiss if dragged down significantly or with high downward velocity
        if (translationY > 100 || velocityY > 1000) {
          closeModal();
        } else {
          // Snap back to original position
          Animated.spring(gestureState, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }
      }
    }
  };

  
  const handlePractice = () => {
    try {
      navigation.navigate("Practice", {
        practiceType: activeTab,
      });
    } catch (error) {
      console.error("Error navigating to practice:", error);
    }
  };

  const handleItemPress = (item: AlphabetLetter | NumberItem) => {
    if (item.id.includes("undefined")) return;
    setSelectedItem(item);
    openModal();
  };

  // Type guards with better error handling
  const isAlphabetLetter = (item: AlphabetLetter | NumberItem | null): item is AlphabetLetter => {
    return item !== null && 'character' in item;
  };

  const isNumberItem = (item: AlphabetLetter | NumberItem | null): item is NumberItem => {
    return item !== null && 'number' in item;
  };

  // Render individual character card with fixed width and enhanced animations
  const renderCharacterCard = (item: AlphabetLetter | NumberItem, index: number) => {
    if (!item) return null;

    return (
      <Animatable.View
        key={item.id}
        animation="fadeInUp"
        delay={index * 30}
        style={[styles.letterContainer, { width: ITEM_WIDTH }]}
      >
        <TouchableOpacity
          onPress={() => handleItemPress(item)}
          style={[
            styles.letterCard,
            { backgroundColor: theme?.colors?.surface || '#fff' },
          ]}
          activeOpacity={0.85}
          // Add haptic feedback on press
          onPressIn={() => {
            // You can add haptic feedback here if available
            // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          {/* Progress indicator */}
          {(item.progress || 0) > 0 && (
            <View style={styles.progressContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  { width: `${item.progress || 0}%` },
                ]}
              />
            </View>
          )}

          {isAlphabetLetter(item) ? (
            <>
              <Text
                style={[styles.letterText, { color: theme?.colors?.text || '#000' }]}
              >
                {item.character}
              </Text>
              <Text
                style={[
                  styles.letterName,
                  { color: theme?.colors?.textSecondary || '#666' },
                ]}
              >
                {item.name}
              </Text>
            </>
          ) : isNumberItem(item) ? (
            <>
              <Text
                style={[styles.kanjiText, { color: theme?.colors?.text || '#000' }]}
              >
                {item.text}
              </Text>
              <Text
                style={[
                  styles.numberText,
                  { color: theme?.colors?.textSecondary || '#666' },
                ]}
              >
                {item.number}
              </Text>
              <Text
                style={[
                  styles.pronunciationText,
                  { color: theme?.colors?.textSecondary || '#666' },
                ]}
              >
                {item.pronunciation}
              </Text>
            </>
          ) : null}
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  // Render character groups with exact 5 columns
  const renderCharacterGroups = () => {
    if (activeTab === "numbers" || !Array.isArray(currentData)) {
      return null;
    }

    const groups = currentData as CharacterGroup[];
    
    if (!groups || groups.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme?.colors?.textSecondary || '#666' }]}>
            No data available
          </Text>
        </View>
      );
    }

    return groups.map((group, groupIndex) => {
      if (!group || !group.characters) return null;
      
      return (
        <View key={`${activeTab}-${group.groupName}-${groupIndex}`} style={styles.groupSection}>
          <View style={styles.groupGrid}>
            {group.characters.map((char, charIndex) => {
              if (char === null) {
                return (
                  <View
                    key={`empty-${groupIndex}-${charIndex}`}
                    style={[styles.letterContainer, { width: ITEM_WIDTH }]}
                  >
                    <View style={[styles.letterCard, styles.emptyCard]} />
                  </View>
                );
              }
              
              const overallIndex = groups
                .slice(0, groupIndex)
                .reduce((acc, g) => acc + (g?.characters?.length || 0), 0) + charIndex;
                
              return (
                <Animatable.View
                  key={char.id}
                  animation="fadeInUp"
                  delay={overallIndex * 30}
                  style={[styles.letterContainer, { width: ITEM_WIDTH }]}
                >
                  <TouchableOpacity
                    onPress={() => handleItemPress(char)}
                    style={[
                      styles.letterCard,
                      { backgroundColor: theme?.colors?.surface || '#fff' },
                    ]}
                    activeOpacity={0.85}
                  >
                    {(char.progress || 0) > 0 && (
                      <View style={styles.progressContainer}>
                        <Animated.View
                          style={[
                            styles.progressBar,
                            { width: `${char.progress || 0}%` },
                          ]}
                        />
                      </View>
                    )}

                    <Text
                      style={[styles.letterText, { color: theme?.colors?.text || '#000' }]}
                    >
                      {char.character}
                    </Text>
                    <Text
                      style={[
                        styles.letterName,
                        { color: theme?.colors?.textSecondary || '#666' },
                      ]}
                    >
                      {char.name}
                    </Text>
                  </TouchableOpacity>
                </Animatable.View>
              );
            })}
          </View>
        </View>
      );
    });
  };

  // Render numbers grid with exact 5 columns
  const renderNumbersGrid = () => {
    if (activeTab !== "numbers" || !Array.isArray(currentData)) {
      return null;
    }

    const numbers = currentData as NumberItem[];
    
    if (!numbers || numbers.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme?.colors?.textSecondary || '#666' }]}>
            No numbers data available
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.alphabetGrid}>
        {numbers.map((item, index) => renderCharacterCard(item, index))}
      </View>
    );
  };

  // Add loading check for theme and state
  if (!theme || !state) {
    return (
      <View style={[styles.container, { backgroundColor: '#fff' }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <LinearGradient
        colors={theme.isDark ? ["#1f2937", "#374151"] : ["#667eea", "#764ba2"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Ionicons
              name="language-outline"
              size={24}
              color="white"
              style={styles.headerIcon}
            />
            <View>
              <Text style={styles.headerTitle}>Japanese Learning</Text>
              <Text style={styles.headerSubtitle}>
                {activeTab === "hiragana"
                  ? "Hiragana Characters"
                  : activeTab === "katakana"
                  ? "Katakana Characters"
                  : "Japanese Numbers"}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.practiceButton}
            onPress={handlePractice}
            activeOpacity={0.8}
          >
            <Ionicons name="play" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { key: "hiragana", label: "Hiragana", icon: "text" },
          { key: "katakana", label: "Katakana", icon: "text-outline" },
          { key: "numbers", label: "Numbers", icon: "calculator" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => {
              setActiveTab(tab.key as any);
              setSelectedItem(null);
            }}
          >
            <Ionicons
              name={tab.icon as any}
              size={18}
              color={
                activeTab === tab.key ? "white" : theme.colors.textSecondary
              }
            />
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === tab.key
                      ? "white"
                      : theme.colors.textSecondary,
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content Area */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {state.isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Loading...
            </Text>
          </View>
        ) : activeTab === "numbers" ? (
          renderNumbersGrid()
        ) : (
          renderCharacterGroups()
        )}
      </ScrollView>

      {/* Enhanced Modal with better UX */}
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          {/* Enhanced backdrop with opacity animation */}
          <Animated.View
            style={[
              styles.modalBackdrop,
              { 
                opacity: backdropOpacity 
              },
            ]}
          >
            <TouchableOpacity
              style={styles.modalBackdropTouchable}
              activeOpacity={1}
              onPress={closeModal}
            />
          </Animated.View>

           <Animated.View
              style={[
                styles.modalContainer,
                { 
                  transform: [
                    { translateY: modalTranslateY },
                    { scale: modalScale }
                  ],
                  opacity: modalOpacity
                },
              ]}
            ></Animated.View>

          {/* Enhanced modal content with gesture handling */}
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View
              style={[
                styles.modalContent,
                { 
                  backgroundColor: theme.colors.surface,
                  transform: [
                    { translateY: modalTranslateY },
                    { scale: modalScale },
                    { translateY: gestureState }
                  ],
                  opacity: modalOpacity
                },
              ]}
            >
              {/* Drag indicator */}
              <View style={styles.dragIndicator} />
              
              {selectedItem && (
                <>
                  {/* Enhanced Modal Header */}
                  <Animated.View 
                    style={[
                      styles.modalHeader,
                      {
                        transform: [{ scale: modalScale }]
                      }
                    ]}
                  >
                    <LinearGradient
                      colors={
                        theme.isDark
                          ? ["#374151", "#4b5563"]
                          : ["#667eea", "#764ba2"]
                      }
                      style={styles.modalIcon}
                    >
                      <Text style={styles.modalCharacter}>
                        {isNumberItem(selectedItem)
                          ? selectedItem.text
                          : isAlphabetLetter(selectedItem)
                          ? selectedItem.character
                          : ""}
                      </Text>
                    </LinearGradient>
                    <TouchableOpacity
                      onPress={closeModal}
                      style={styles.closeButton}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name="close"
                        size={24}
                        color={theme.colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </Animated.View>

                  {/* Modal Content with staggered animations */}
                  <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.modalScrollContent}
                  >
                    {/* Modal Title */}
                    <Animatable.View 
                      animation="fadeInUp"
                      delay={200}
                      style={styles.modalTitleContainer}
                    >
                      <Text
                        style={[styles.modalTitle, { color: theme.colors.text }]}
                      >
                        {isNumberItem(selectedItem)
                          ? `${selectedItem.number}`
                          : isAlphabetLetter(selectedItem)
                          ? `${selectedItem.character}`
                          : ""}
                      </Text>
                      <Text
                        style={[
                          styles.modalSubtitle,
                          { color: theme.colors.textSecondary },
                        ]}
                      >
                        {selectedItem.pronunciation}
                      </Text>
                    </Animatable.View>

                    {/* Enhanced Progress Display */}
                    <Animatable.View 
                      animation="fadeInUp"
                      delay={300}
                      style={styles.progressSection}
                    >
                      <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
                        Learning Progress
                      </Text>
                      <View style={styles.progressBarContainer}>
                        <View
                          style={[
                            styles.progressBarFull,
                            { backgroundColor: theme.colors.surface },
                          ]}
                        >
                          <Animated.View style={{ flex: 1 }}>
                            <LinearGradient
                              colors={["#667eea", "#764ba2"]}
                              style={[
                                styles.progressBarFill,
                                { width: `${selectedItem.progress || 0}%` },
                              ]}
                            />
                          </Animated.View>
                        </View>
                        <Text style={[styles.progressText, { color: theme.colors.text }]}>
                          {selectedItem.progress || 0}%
                        </Text>
                      </View>
                    </Animatable.View>

                    {/* Modal Details with staggered animations */}
                    <View style={styles.modalDetails}>
                      <Animatable.View 
                        animation="fadeInUp"
                        delay={400}
                        style={styles.detailItem}
                      >
                        <View
                          style={[
                            styles.detailIconContainer,
                            { backgroundColor: "rgba(102, 126, 234, 0.1)" },
                          ]}
                        >
                          <Ionicons name="volume-high" size={20} color="#667eea" />
                        </View>
                        <View style={styles.detailTextContainer}>
                          <Text
                            style={[
                              styles.detailLabel,
                              { color: theme.colors.textSecondary },
                            ]}
                          >
                            Pronunciation
                          </Text>
                          <Text
                            style={[
                              styles.detailValue,
                              { color: theme.colors.text },
                            ]}
                          >
                            {selectedItem.pronunciation}
                          </Text>
                        </View>
                      </Animatable.View>

                      {isAlphabetLetter(selectedItem) && (
                        <Animatable.View 
                          animation="fadeInUp"
                          delay={500}
                          style={styles.detailItem}
                        >
                          <View
                            style={[
                              styles.detailIconContainer,
                              { backgroundColor: "rgba(16, 185, 129, 0.1)" },
                            ]}
                          >
                            <Ionicons name="book" size={20} color="#10b981" />
                          </View>
                          <View style={styles.detailTextContainer}>
                            <Text
                              style={[
                                styles.detailLabel,
                                { color: theme.colors.textSecondary },
                              ]}
                            >
                              Example Usage
                            </Text>
                            <Text
                              style={[
                                styles.detailValue,
                                { color: theme.colors.text },
                              ]}
                            >
                              {selectedItem.example}
                            </Text>
                          </View>
                        </Animatable.View>
                      )}

                      {isNumberItem(selectedItem) && (
                        <Animatable.View 
                          animation="fadeInUp"
                          delay={500}
                          style={styles.detailItem}
                        >
                          <View
                            style={[
                              styles.detailIconContainer,
                              { backgroundColor: "rgba(245, 158, 11, 0.1)" },
                            ]}
                          >
                            <Ionicons name="calculator" size={20} color="#f59e0b" />
                          </View>
                          <View style={styles.detailTextContainer}>
                            <Text
                              style={[
                                styles.detailLabel,
                                { color: theme.colors.textSecondary },
                              ]}
                            >
                              Arabic Numeral
                            </Text>
                            <Text
                              style={[
                                styles.detailValue,
                                { color: theme.colors.text },
                              ]}
                            >
                              {selectedItem.number}
                            </Text>
                          </View>
                        </Animatable.View>
                      )}
                    </View>
                  </ScrollView>
                </>
              )}
            </Animated.View>
          </PanGestureHandler>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Enhanced styles with improved modal UX
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerIcon: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  practiceButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 6,
    backgroundColor: "rgba(148, 163, 184, 0.1)",
  },
  activeTab: {
    backgroundColor: "#667eea",
    elevation: 3,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
  },
  groupSection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  groupGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 8,
  },
  alphabetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    rowGap: 8,
  },
  letterContainer: {
    marginBottom: 8,
  },
  letterCard: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    position: "relative",
  },
  emptyCard: {
    backgroundColor: "transparent",
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  progressContainer: {
    position: "absolute",
    top: 4,
    left: 4,
    right: 4,
    height: 2,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 1,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#667eea",
    borderRadius: 1,
  },
  letterText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 2,
  },
  letterName: {
    fontSize: 10,
    fontWeight: "500",
  },
  kanjiText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 1,
  },
  numberText: {
    fontSize: 8,
    fontWeight: "600",
    marginBottom: 1,
  },pronunciationText: {
    fontSize: 8,
    fontWeight: "500",
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalBackdropTouchable: {
    flex: 1,
  },
  modalContent: {
    minHeight: height * 0.5,
    maxHeight: height * 0.9,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 34,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  modalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalCharacter: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  modalScrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  modalTitleContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  progressSection: {
    marginBottom: 24,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBarFull: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    minWidth: 35,
    textAlign: "right",
  },
  modalDetails: {
    gap: 16,
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  detailIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  actionButtonContainer: {
    marginTop: "auto",
    paddingTop: 16,
  },
  practiceItemButton: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  practiceItemButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  practiceItemButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.3,
  },
  modalContainer: {
    minHeight: height * 0.5,
    maxHeight: height * 0.9,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    overflow: 'hidden',
  },
  
  modalDragArea: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  

});