import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { useTheme } from "../contexts/ThemeContext";

interface Props {
  route: any;
  navigation: any;
}

const japaneseNumbers = [
  {
    number: "0",
    kanji: "零",
    hiragana: "れい/ぜろ",
    pronunciation: "/rei/zero/",
    example: "零点 (zero points)",
  },
  {
    number: "1",
    kanji: "一",
    hiragana: "いち",
    pronunciation: "/itʃi/",
    example: "一つ (one thing)",
  },
  {
    number: "2",
    kanji: "二",
    hiragana: "に",
    pronunciation: "/ni/",
    example: "二人 (two people)",
  },
  {
    number: "3",
    kanji: "三",
    hiragana: "さん",
    pronunciation: "/san/",
    example: "三時 (three o'clock)",
  },
  {
    number: "4",
    kanji: "四",
    hiragana: "よん/し",
    pronunciation: "/jon/ʃi/",
    example: "四月 (April)",
  },
  {
    number: "5",
    kanji: "五",
    hiragana: "ご",
    pronunciation: "/go/",
    example: "五分 (five minutes)",
  },
  {
    number: "6",
    kanji: "六",
    hiragana: "ろく",
    pronunciation: "/roku/",
    example: "六時 (six o'clock)",
  },
  {
    number: "7",
    kanji: "七",
    hiragana: "なな/しち",
    pronunciation: "/nana/ʃitʃi/",
    example: "七月 (July)",
  },
  {
    number: "8",
    kanji: "八",
    hiragana: "はち",
    pronunciation: "/hatʃi/",
    example: "八個 (eight items)",
  },
  {
    number: "9",
    kanji: "九",
    hiragana: "きゅう/く",
    pronunciation: "/kjuː/ku/",
    example: "九時 (nine o'clock)",
  },
  {
    number: "10",
    kanji: "十",
    hiragana: "じゅう",
    pronunciation: "/dʒuː/",
    example: "十日 (ten days)",
  },
  {
    number: "100",
    kanji: "百",
    hiragana: "ひゃく",
    pronunciation: "/hjaku/",
    example: "百円 (100 yen)",
  },
  {
    number: "1000",
    kanji: "千",
    hiragana: "せん",
    pronunciation: "/sen/",
    example: "千年 (1000 years)",
  },
  {
    number: "10000",
    kanji: "万",
    hiragana: "まん",
    pronunciation: "/man/",
    example: "一万円 (10,000 yen)",
  },
];

export default function NumbersScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const [selectedNumber, setSelectedNumber] = useState<any>(null);

  const handlePractice = () => {
    navigation.navigate("Practice", {
      practiceType: "numbers",
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Modern Header with Gradient */}
      <LinearGradient
        colors={theme.isDark ? ["#1f2937", "#374151"] : ["#f093fb", "#f5576c"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animatable.View animation="fadeInDown" duration={800}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Ionicons
              name="calculator-outline"
              size={32}
              color="white"
              style={styles.headerIcon}
            />
            <Text style={styles.headerTitle}>Japanese Numbers</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Learn numbers in Kanji and Hiragana
          </Text>

          {/* Practice Button */}
          <TouchableOpacity
            style={styles.practiceButton}
            onPress={handlePractice}
            activeOpacity={0.8}
          >
            <Ionicons name="play-circle-outline" size={24} color="white" />
            <Text style={styles.practiceButtonText}>Practice Numbers</Text>
          </TouchableOpacity>
        </Animatable.View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Numbers Grid */}
        <View style={styles.numbersGrid}>
          {japaneseNumbers.map((item, index) => (
            <Animatable.View
              key={item.number}
              animation="fadeInUp"
              delay={index * 100}
              style={styles.numberContainer}
            >
              <TouchableOpacity
                onPress={() => setSelectedNumber(item)}
                style={[
                  styles.numberCard,
                  { backgroundColor: theme.colors.surface },
                  selectedNumber?.number === item.number &&
                    styles.selectedNumberCard,
                ]}
                activeOpacity={0.7}
              >
                <Text style={[styles.kanjiText, { color: theme.colors.text }]}>
                  {item.kanji}
                </Text>
                <Text style={[styles.numberText, { color: theme.colors.text }]}>
                  {item.number}
                </Text>
                <Text
                  style={[
                    styles.hiraganaText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {item.hiragana}
                </Text>
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </View>

        {/* Selected Number Details */}
        {selectedNumber && (
          <Animatable.View
            animation="slideInUp"
            duration={600}
            style={styles.detailsSection}
          >
            <View
              style={[
                styles.detailsCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <View style={styles.detailsHeader}>
                <LinearGradient
                  colors={
                    theme.isDark
                      ? ["#374151", "#4b5563"]
                      : ["#f093fb", "#f5576c"]
                  }
                  style={styles.detailsIcon}
                >
                  <Text style={styles.detailsKanjiText}>
                    {selectedNumber.kanji}
                  </Text>
                </LinearGradient>
                <View style={styles.detailsInfo}>
                  <Text
                    style={[styles.detailsTitle, { color: theme.colors.text }]}
                  >
                    Number {selectedNumber.number} ({selectedNumber.kanji})
                  </Text>
                  <Text
                    style={[
                      styles.detailsSubtitle,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {selectedNumber.hiragana}
                  </Text>
                </View>
              </View>

              <View style={styles.detailsContent}>
                <View style={styles.detailRow}>
                  <View
                    style={[
                      styles.detailIcon,
                      {
                        backgroundColor: theme.isDark
                          ? "rgba(240, 147, 251, 0.2)"
                          : "rgba(240, 147, 251, 0.1)",
                      },
                    ]}
                  >
                    <Ionicons
                      name="volume-high-outline"
                      size={20}
                      color="#f093fb"
                    />
                  </View>
                  <View style={styles.detailText}>
                    <Text
                      style={[
                        styles.detailLabel,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      Pronunciation
                    </Text>
                    <Text
                      style={[styles.detailValue, { color: theme.colors.text }]}
                    >
                      {selectedNumber.pronunciation}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View
                    style={[
                      styles.detailIcon,
                      {
                        backgroundColor: theme.isDark
                          ? "rgba(16, 185, 129, 0.2)"
                          : "rgba(16, 185, 129, 0.1)",
                      },
                    ]}
                  >
                    <Ionicons name="book-outline" size={20} color="#10b981" />
                  </View>
                  <View style={styles.detailText}>
                    <Text
                      style={[
                        styles.detailLabel,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      Example
                    </Text>
                    <Text
                      style={[styles.detailValue, { color: theme.colors.text }]}
                    >
                      {selectedNumber.example}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
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
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  backButton: {
    position: "absolute",
    left: 0,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  headerIcon: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  practiceButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  practiceButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  numbersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  numberContainer: {
    width: "47%",
    marginBottom: 16,
  },
  numberCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
  },
  selectedNumberCard: {
    borderColor: "#f093fb",
    borderWidth: 2,
    shadowColor: "#f093fb",
    shadowOpacity: 0.3,
  },
  kanjiText: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 8,
  },
  numberText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    opacity: 0.7,
  },
  hiraganaText: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  detailsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  detailsCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
  },
  detailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  detailsIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  detailsKanjiText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  detailsInfo: {
    flex: 1,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  detailsSubtitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  detailsContent: {
    gap: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 22,
  },
});
