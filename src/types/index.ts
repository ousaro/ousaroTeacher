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
  Practice: { practiceType?: "hiragana" | "katakana" | "numbers" | "words" };
  AboutApp: undefined;
  Error: undefined;
  Loading: undefined;
};


export type TabParamList = {
  Home: undefined;
  Practice: undefined;
  Japanese: undefined;
  Settings: undefined;
};


