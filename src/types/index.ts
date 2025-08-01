export interface Word {
  id: string;
  text: string;
  definition: string;
  translation: string;
  notes: string;
  tags: string[];
  pronunciation?: string;
  rarity: number; // How often it appears in practice
  dateAdded: string;
  lastReviewed?: string;
  reviewCount: number; // Number of times reviewed
  correctCount: number; // Number of times answered correctly
  isFavorite: boolean;
  isMarkedDifficult: boolean;
}

export interface User {
  id: string;
  name: string;
  nativeLanguage: string;
  learningLanguages: string[];
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: "light" | "dark" | "auto";
  primaryColor: string;
  notifications: boolean;
  reminderTime: string;
  practiceMode: "vocabulary" | "alphabet" | "numbers" | "mixed";
  autoPlayAudio: boolean;
  showTranslations: boolean;
  firstTimeUser: boolean;
}

export interface AlphabetLetter {
  id: string;
  character: string;
  name: string;
  pronunciation: string;
  example: string;
  audioUrl?: string;
  language: string;
}

export interface CharacterGroup {
  groupName: string;
  language: string;
  characters: (AlphabetLetter | null)[]; 
}

export interface NumberItem {
  id: string;
  number: number;
  text: string;
  pronunciation: string;
  audioUrl?: string;
  language: string;
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
  AboutApp: undefined;
  LibraryFilters: undefined;
  Error: undefined;
  Loading: undefined;
};


export type TabParamList = {
  Home: undefined;
  Library: undefined;
  Practice: undefined;
  Japanese: undefined;
  Settings: undefined;
};


