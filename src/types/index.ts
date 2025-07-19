export interface Word {
  id: string;
  text: string;
  definition: string;
  translation: string;
  notes: string;
  tags: string[];
  pronunciation?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  progress: number; // 0-100
  rarity: number; // How often it appears in practice
  dateAdded: string;
  lastReviewed?: string;
  reviewCount: number;
  correctCount: number; // Number of times answered correctly
  isFavorite: boolean;
  isMarkedDifficult: boolean;
}


export interface FlashCard {
  id: string;
  wordId: string;
  front: string;
  back: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  nextReview: string;
  interval: number; // Days until next review
  easeFactor: number; // How easy the word is to remember
  reviewCount: number; // Number of times reviewed
}

export interface User {
  id: string;
  name: string;
  nativeLanguage: string;
  learningLanguages: string[];
  currentStreak: number;
  longestStreak: number;
  totalWordsLearned: number;
  dailyGoal: number;
  achievements: Achievement[];
  preferences: UserPreferences;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number;
  target: number;
}

export interface UserPreferences {
  theme: "light" | "dark" | "auto";
  primaryColor: string;
  notifications: boolean;
  reminderTime: string;
  practiceMode: "flashcards" | "games" | "mixed";
  autoPlayAudio: boolean;
  showTranslations: boolean;
  firstTimeUser: boolean;
}

export interface GameResult {
  id: string;
  gameType: "multiple-choice" | "fill-blank" | "matching" | "spelling";
  wordsUsed: string[];
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number; // seconds
  dateCompleted: string;
  score: number;
}

export interface AlphabetLetter {
  id: string;
  character: string;
  name: string;
  pronunciation: string;
  example: string;
  audioUrl?: string;
  progress: number;
  language: string;
}

export interface NumberItem {
  id: string;
  number: number;
  text: string;
  pronunciation: string;
  audioUrl?: string;
  progress: number;
  language: string;
}

export interface DailyStats {
  date: string;
  wordsLearned: number;
  timeSpent: number; // minutes
  gamesPlayed: number;
  flashcardsReviewed: number;
  streakDay: number;
}

export interface PracticeSession {
  id: string;
  type: "flashcard" | "game" | "alphabet" | "numbers";
  wordsCount: number;
  correctCount: number;
  timeSpent: number;
  dateStarted: string;
  dateCompleted?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
}

// Navigation types
export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  WordDetails: { wordId: string };
  AddWord: { word?: string; bookId?: string };
  WordList: undefined;
  Practice: { practiceType?: "hiragana" | "katakana" | "kanji" | "numbers" | "words" };
  Japanese: { language?: string };
  Numbers: { language?: string };
  Settings: undefined;
  Achievements: undefined;
  Statistics: undefined;
};

export type TabParamList = {
  Home: undefined;
  Library: undefined;
  Practice: undefined;
  Japanese: undefined;
  Profile: undefined;
};
