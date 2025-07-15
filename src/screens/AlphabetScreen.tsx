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
  navigation: any;
}

const hiraganaAlphabet = [
  { letter: "あ", name: "a", pronunciation: "/a/", example: "あひる (duck)" },
  { letter: "い", name: "i", pronunciation: "/i/", example: "いぬ (dog)" },
  { letter: "う", name: "u", pronunciation: "/u/", example: "うみ (sea)" },
  { letter: "え", name: "e", pronunciation: "/e/", example: "えき (station)" },
  { letter: "お", name: "o", pronunciation: "/o/", example: "おはな (flower)" },
  { letter: "か", name: "ka", pronunciation: "/ka/", example: "かみ (paper)" },
  { letter: "き", name: "ki", pronunciation: "/ki/", example: "きつね (fox)" },
  { letter: "く", name: "ku", pronunciation: "/ku/", example: "くるま (car)" },
  { letter: "け", name: "ke", pronunciation: "/ke/", example: "けーき (cake)" },
  {
    letter: "こ",
    name: "ko",
    pronunciation: "/ko/",
    example: "こども (child)",
  },
  {
    letter: "さ",
    name: "sa",
    pronunciation: "/sa/",
    example: "さくら (cherry)",
  },
  { letter: "し", name: "shi", pronunciation: "/ʃi/", example: "しお (salt)" },
  { letter: "す", name: "su", pronunciation: "/su/", example: "すし (sushi)" },
  {
    letter: "せ",
    name: "se",
    pronunciation: "/se/",
    example: "せんせい (teacher)",
  },
  { letter: "そ", name: "so", pronunciation: "/so/", example: "そら (sky)" },
  { letter: "た", name: "ta", pronunciation: "/ta/", example: "たまご (egg)" },
  { letter: "ち", name: "chi", pronunciation: "/tʃi/", example: "ちず (map)" },
  { letter: "つ", name: "tsu", pronunciation: "/tsu/", example: "つき (moon)" },
  {
    letter: "て",
    name: "te",
    pronunciation: "/te/",
    example: "てがみ (letter)",
  },
  { letter: "と", name: "to", pronunciation: "/to/", example: "とり (bird)" },
  { letter: "な", name: "na", pronunciation: "/na/", example: "なまえ (name)" },
  { letter: "に", name: "ni", pronunciation: "/ni/", example: "にく (meat)" },
  { letter: "ぬ", name: "nu", pronunciation: "/nu/", example: "ぬの (cloth)" },
  { letter: "ね", name: "ne", pronunciation: "/ne/", example: "ねこ (cat)" },
  {
    letter: "の",
    name: "no",
    pronunciation: "/no/",
    example: "のみもの (drink)",
  },
  { letter: "は", name: "ha", pronunciation: "/ha/", example: "はな (nose)" },
  { letter: "ひ", name: "hi", pronunciation: "/hi/", example: "ひ (fire)" },
  { letter: "ふ", name: "fu", pronunciation: "/fu/", example: "ふね (ship)" },
  { letter: "へ", name: "he", pronunciation: "/he/", example: "へび (snake)" },
  { letter: "ほ", name: "ho", pronunciation: "/ho/", example: "ほん (book)" },
  { letter: "ま", name: "ma", pronunciation: "/ma/", example: "まど (window)" },
  { letter: "み", name: "mi", pronunciation: "/mi/", example: "みず (water)" },
  { letter: "む", name: "mu", pronunciation: "/mu/", example: "むし (insect)" },
  { letter: "め", name: "me", pronunciation: "/me/", example: "め (eye)" },
  { letter: "も", name: "mo", pronunciation: "/mo/", example: "もり (forest)" },
  {
    letter: "や",
    name: "ya",
    pronunciation: "/ja/",
    example: "やま (mountain)",
  },
  { letter: "ゆ", name: "yu", pronunciation: "/ju/", example: "ゆき (snow)" },
  { letter: "よ", name: "yo", pronunciation: "/jo/", example: "よる (night)" },
  {
    letter: "ら",
    name: "ra",
    pronunciation: "/ra/",
    example: "らいおん (lion)",
  },
  {
    letter: "り",
    name: "ri",
    pronunciation: "/ri/",
    example: "りんご (apple)",
  },
  { letter: "る", name: "ru", pronunciation: "/ru/", example: "るーる (rule)" },
  {
    letter: "れ",
    name: "re",
    pronunciation: "/re/",
    example: "れもん (lemon)",
  },
  {
    letter: "ろ",
    name: "ro",
    pronunciation: "/ro/",
    example: "ろうそく (candle)",
  },
  {
    letter: "わ",
    name: "wa",
    pronunciation: "/wa/",
    example: "わに (crocodile)",
  },
  { letter: "を", name: "wo", pronunciation: "/wo/", example: "を (particle)" },
  { letter: "ん", name: "n", pronunciation: "/n/", example: "ん (n sound)" },
];

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
];

export default function AlphabetScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"hiragana" | "numbers">(
    "hiragana",
  );

  const currentData =
    activeTab === "hiragana" ? hiraganaAlphabet : japaneseNumbers;

  const handlePractice = () => {
    // Navigate to practice screen with alphabet/numbers practice
    navigation.navigate("Practice", {
      practiceType: activeTab === "hiragana" ? "hiragana" : "numbers",
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
        colors={theme.isDark ? ["#1f2937", "#374151"] : ["#667eea", "#764ba2"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animatable.View animation="fadeInDown" duration={800}>
          <View style={styles.headerContent}>
            <Ionicons
              name="language-outline"
              size={32}
              color="white"
              style={styles.headerIcon}
            />
            <Text style={styles.headerTitle}>Japanese Learning</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Learn Hiragana characters and numbers
          </Text>

          {/* Practice Button */}
          <TouchableOpacity
            style={styles.practiceButton}
            onPress={handlePractice}
            activeOpacity={0.8}
          >
            <Ionicons name="play-circle-outline" size={24} color="white" />
            <Text style={styles.practiceButtonText}>
              Practice {activeTab === "hiragana" ? "Hiragana" : "Numbers"}
            </Text>
          </TouchableOpacity>
        </Animatable.View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View
        style={[
          styles.tabContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "hiragana" && styles.activeTab,
            {
              backgroundColor:
                activeTab === "hiragana" ? "#667eea" : "transparent",
            },
          ]}
          onPress={() => {
            setActiveTab("hiragana");
            setSelectedItem(null);
          }}
        >
          <Ionicons
            name="text-outline"
            size={20}
            color={
              activeTab === "hiragana" ? "white" : theme.colors.textSecondary
            }
          />
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "hiragana"
                    ? "white"
                    : theme.colors.textSecondary,
              },
            ]}
          >
            Hiragana
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "numbers" && styles.activeTab,
            {
              backgroundColor:
                activeTab === "numbers" ? "#667eea" : "transparent",
            },
          ]}
          onPress={() => {
            setActiveTab("numbers");
            setSelectedItem(null);
          }}
        >
          <Ionicons
            name="calculator-outline"
            size={20}
            color={
              activeTab === "numbers" ? "white" : theme.colors.textSecondary
            }
          />
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "numbers"
                    ? "white"
                    : theme.colors.textSecondary,
              },
            ]}
          >
            Numbers
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Content Grid */}
        <View style={styles.alphabetGrid}>
          {currentData.map((item: any, index: number) => (
            <Animatable.View
              key={activeTab === "hiragana" ? item.letter : item.number}
              animation="fadeInUp"
              delay={index * 50}
              style={styles.letterContainer}
            >
              <TouchableOpacity
                onPress={() => setSelectedItem(item)}
                style={[
                  styles.letterCard,
                  { backgroundColor: theme.colors.surface },
                  selectedItem &&
                    ((activeTab === "hiragana" &&
                      selectedItem.letter === item.letter) ||
                      (activeTab === "numbers" &&
                        selectedItem.number === item.number)) &&
                    styles.selectedLetterCard,
                ]}
                activeOpacity={0.7}
              >
                {activeTab === "hiragana" ? (
                  <>
                    <Text
                      style={[styles.letterText, { color: theme.colors.text }]}
                    >
                      {item.letter}
                    </Text>
                    <Text
                      style={[
                        styles.letterName,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {item.name}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text
                      style={[styles.letterText, { color: theme.colors.text }]}
                    >
                      {item.kanji}
                    </Text>
                    <Text
                      style={[styles.numberText, { color: theme.colors.text }]}
                    >
                      {item.number}
                    </Text>
                    <Text
                      style={[
                        styles.letterName,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {item.hiragana}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </View>

        {/* Selected Item Details */}
        {selectedItem && (
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
                      : ["#667eea", "#764ba2"]
                  }
                  style={styles.detailsIcon}
                >
                  <Text style={styles.detailsLetterText}>
                    {activeTab === "hiragana"
                      ? selectedItem.letter
                      : selectedItem.kanji}
                  </Text>
                </LinearGradient>
                <View style={styles.detailsInfo}>
                  <Text
                    style={[styles.detailsTitle, { color: theme.colors.text }]}
                  >
                    {activeTab === "hiragana"
                      ? `Character ${selectedItem.letter}`
                      : `Number ${selectedItem.number} (${selectedItem.kanji})`}
                  </Text>
                  <Text
                    style={[
                      styles.detailsSubtitle,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {activeTab === "hiragana"
                      ? selectedItem.name
                      : selectedItem.hiragana}
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
                          ? "rgba(99, 102, 241, 0.2)"
                          : "rgba(102, 126, 234, 0.1)",
                      },
                    ]}
                  >
                    <Ionicons
                      name="volume-high-outline"
                      size={20}
                      color="#667eea"
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
                      {selectedItem.pronunciation}
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
                      {selectedItem.example}
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
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  activeTab: {
    elevation: 4,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  alphabetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  letterContainer: {
    width: "30%",
    marginBottom: 16,
  },
  letterCard: {
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
  selectedLetterCard: {
    borderColor: "#667eea",
    borderWidth: 2,
    shadowColor: "#667eea",
    shadowOpacity: 0.3,
  },
  letterText: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  numberText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  letterName: {
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
  detailsLetterText: {
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
