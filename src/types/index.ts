export interface Word {
  id: string;
  text: string;
  definition: string;
  translation: string;
  notes: string;
  tags: string[];
  pronunciation?: string;
  dateAdded: string;
  isFavorite: boolean;
}

export interface User {
  id: string;
  name: string;
  nativeLanguage: string;
  learningLanguages: string[];
  theme: "light" | "dark";
  primaryColor: string;
  practiceMode: "vocabulary" | "alphabet" | "numbers" | "mixed";
}


export interface AlphabetLetter {
  id: string;
  character: string;
  name: string;
  pronunciation: string;
  example: string;
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
  language: string;
}

// Navigation types
export type RootStackParamList = {
  Main: undefined;
  WordDetails: { wordId: string };
  AddWord: { word?: string; wordId?: string };
  Practice: { practiceType?: "hiragana" | "katakana" | "numbers" | "words" };
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


