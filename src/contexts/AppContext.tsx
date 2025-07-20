import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { 
  Word, 
  User, 
  FlashCard, 
  DailyStats, 
  UserPreferences, 
  AlphabetLetter, 
  NumberItem, 
  CharacterGroup
} from "../types";
import storageService  from "../services/storageService";
import { hiraganaGroups, katakanaGroups, japaneseNumbers } from "../data/alphabetData";


interface AppState {
  user: User | null;
  words: Word[];
  flashCards: FlashCard[];
  alphabetLetters: CharacterGroup[];
  numbers: NumberItem[];
  dailyStats: DailyStats[];
  isLoading: boolean;
  error: string | null;
  currentStreak: number;
  todayStats: DailyStats | null;
}

type AppAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_USER"; payload: User | null }
  | { type: "UPDATE_USER_PREFERENCES"; payload: Partial<UserPreferences> }
  | { type: "SET_WORDS"; payload: Word[] }
  | { type: "ADD_WORD"; payload: Word }
  | { type: "UPDATE_WORD"; payload: { id: string; updates: Partial<Word> } }
  | { type: "DELETE_WORD"; payload: string }
  | { type: "SET_FLASHCARDS"; payload: FlashCard[] }
  | { type: "ADD_FLASHCARD"; payload: FlashCard }
  | {
      type: "UPDATE_FLASHCARD";
      payload: { id: string; updates: Partial<FlashCard> };
    }
  | { type: "SET_ALPHABET_LETTERS"; payload: CharacterGroup[] }
  | { type: "UPDATE_ALPHABET_LETTER"; payload: { id: string; updates: Partial<AlphabetLetter> } }
  | { type: "SET_NUMBERS"; payload: NumberItem[] }
  | { type: "UPDATE_NUMBER"; payload: { id: string; updates: Partial<NumberItem> } }
  | { type: "SET_DAILY_STATS"; payload: DailyStats[] }
  | { type: "UPDATE_TODAY_STATS"; payload: Partial<DailyStats> }
  | { type: "UPDATE_STREAK"; payload: number };

const initialState: AppState = {
  user: null,
  words: [],
  flashCards: [],
  alphabetLetters: [],
  numbers: [],
  dailyStats: [],
  isLoading: true,
  error: null,
  currentStreak: 0,
  todayStats: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "SET_USER":
      return { ...state, user: action.payload };

    case "UPDATE_USER_PREFERENCES":
      return {
        ...state,
        user: state.user
          ? {
              ...state.user,
              preferences: {
                ...state.user.preferences,
                ...action.payload,
              },
            }
          : state.user,
      };

    case "SET_WORDS":
      return { ...state, words: action.payload };

    case "ADD_WORD":
      return { ...state, words: [...state.words, action.payload] };

    case "UPDATE_WORD":
      return {
        ...state,
        words: state.words.map((word) =>
          word.id === action.payload.id
            ? { ...word, ...action.payload.updates }
            : word,
        ),
      };

    case "DELETE_WORD":
      return {
        ...state,
        words: state.words.filter((word) => word.id !== action.payload),
      };

    case "SET_FLASHCARDS":
      return { ...state, flashCards: action.payload };

    case "ADD_FLASHCARD":
      return { ...state, flashCards: [...state.flashCards, action.payload] };

    case "UPDATE_FLASHCARD":
      return {
        ...state,
        flashCards: state.flashCards.map((card) =>
          card.id === action.payload.id
            ? { ...card, ...action.payload.updates }
            : card,
        ),
      };

    case "SET_ALPHABET_LETTERS":
      return { ...state, alphabetLetters: action.payload };

    case "UPDATE_ALPHABET_LETTER":
      return {
        ...state,
        alphabetLetters: state.alphabetLetters.map((group) => ({
          ...group,
          characters: group.characters.map((char) =>
            char && char.id === action.payload.id
              ? { ...char, ...action.payload.updates }
              : char
          ),
        })),
      };

    case "SET_NUMBERS":
      return { ...state, numbers: action.payload };

    case "UPDATE_NUMBER":
      return {
        ...state,
        numbers: state.numbers.map((number) =>
          number.id === action.payload.id
            ? { ...number, ...action.payload.updates }
            : number,
        ),
      };

    case "SET_DAILY_STATS":
      return { ...state, dailyStats: action.payload };

    case "UPDATE_TODAY_STATS":
      const today = new Date().toISOString().split("T")[0];
      const existingStats = state.dailyStats.find((s) => s.date === today);
      const updatedStats = existingStats
        ? { ...existingStats, ...action.payload }
        : {
            date: today,
            wordsLearned: 0,
            timeSpent: 0,
            gamesPlayed: 0,
            flashcardsReviewed: 0,
            streakDay: state.currentStreak + 1,
            ...action.payload,
          };

      return {
        ...state,
        todayStats: updatedStats,
        dailyStats: state.dailyStats
          .map((s) => (s.date === today ? updatedStats : s))
          .concat(existingStats ? [] : [updatedStats]),
      };

    case "UPDATE_STREAK":
      return { ...state, currentStreak: action.payload };

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    loadInitialData: () => Promise<void>;
    initializeAlphabetData: () => Promise<void>;
    addWord: (word: Word) => Promise<void>;
    updateWord: (id: string, updates: Partial<Word>) => Promise<void>;
    deleteWord: (id: string) => Promise<void>;
    addFlashCard: (flashCard: FlashCard) => Promise<void>;
    updateFlashCard: (id: string, updates: Partial<FlashCard>) => Promise<void>;
    updateAlphabetLetterProgress: (id: string, increment?: number) => Promise<void>;
    updateNumberProgress: (id: string, increment?: number) => Promise<void>;
    getAlphabetGroupsByLanguage: (language: string) => CharacterGroup[];
    getNumbersByLanguage: (language: string) => NumberItem[];
    updateTodayStats: (updates: Partial<DailyStats>) => Promise<void>;
    createDefaultUser: () => Promise<void>;
    updateUserPreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const loadInitialData = async () => {
    try {
      // Initialize alphabet and numbers if not already done
      await initializeAlphabetData();

      dispatch({ type: "SET_LOADING", payload: true });

      const [user, words, flashCards, alphabetLetters, numbers, dailyStats] = await Promise.all([
        storageService.getUser(),
        storageService.getWords(),
        storageService.getFlashCards(),
        storageService.getAlphabetLetters(),
        storageService.getNumbers(),
        storageService.getDailyStats(),
      ]);

      dispatch({ type: "SET_USER", payload: user });
      dispatch({ type: "UPDATE_USER_PREFERENCES", payload: user?.preferences || {} });
      dispatch({ type: "SET_WORDS", payload: words });
      dispatch({ type: "SET_FLASHCARDS", payload: flashCards });
      dispatch({ type: "SET_ALPHABET_LETTERS", payload: alphabetLetters });
      dispatch({ type: "SET_NUMBERS", payload: numbers });
      dispatch({ type: "SET_DAILY_STATS", payload: dailyStats });

      // Calculate current streak
      const today = new Date().toISOString().split("T")[0];
      const sortedStats = dailyStats.sort(
        (a: DailyStats, b: DailyStats) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      let streak = 0;
      let currentDate = new Date();

      for (const stat of sortedStats) {
        const statDate = new Date(stat.date);
        if (
          statDate.toISOString().split("T")[0] ===
          currentDate.toISOString().split("T")[0]
        ) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }

      dispatch({ type: "UPDATE_STREAK", payload: streak });

      // Set today's stats
      const todayStats = dailyStats.find((s: DailyStats) => s.date === today);
      if (todayStats) {
        dispatch({ type: "UPDATE_TODAY_STATS", payload: todayStats });
      }



    } catch (error) {
      console.error("Error loading initial data:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to load app data" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const initializeAlphabetData = async () => {
    try {
      // Initialize hiragana alphabet
      await storageService.initializeAlphabetLetters(hiraganaGroups, "hiragana");

      // Initialize katakana alphabet
      await storageService.initializeAlphabetLetters(katakanaGroups, "katakana");

      // Initialize Japanese numbers
      await storageService.initializeNumbers(japaneseNumbers, "japanese");

      // Reload the data to update state
      const [updatedAlphabetLetters, updatedNumbers] = await Promise.all([
        storageService.getAlphabetLetters(),
        storageService.getNumbers(),
      ]);

      dispatch({ type: "SET_ALPHABET_LETTERS", payload: updatedAlphabetLetters });
      dispatch({ type: "SET_NUMBERS", payload: updatedNumbers });

    } catch (error) {
      console.error("Error initializing alphabet data:", error);
    }
  };

  const addWord = async (word: Word) => {
    try {
      await storageService.addWord(word);
      dispatch({ type: "ADD_WORD", payload: word });
    } catch (error) {
      console.error("Error adding word:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to add word" });
    }
  };

  const updateWord = async (id: string, updates: Partial<Word>) => {
    try {
      await storageService.updateWord(id, updates);
      dispatch({ type: "UPDATE_WORD", payload: { id, updates } });
    } catch (error) {
      console.error("Error updating word:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to update word" });
    }
  };

  const deleteWord = async (id: string) => {
    try {
      await storageService.deleteWord(id);
      dispatch({ type: "DELETE_WORD", payload: id });
    } catch (error) {
      console.error("Error deleting word:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to delete word" });
    }
  };

  const addFlashCard = async (flashCard: FlashCard) => {
    try {
      await storageService.addFlashCard(flashCard);
      dispatch({ type: "ADD_FLASHCARD", payload: flashCard });
    } catch (error) {
      console.error("Error adding flashcard:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to add flashcard" });
    }
  };

  const updateFlashCard = async (id: string, updates: Partial<FlashCard>) => {
    try {
      await storageService.updateFlashCard(id, updates);
      dispatch({ type: "UPDATE_FLASHCARD", payload: { id, updates } });
    } catch (error) {
      console.error("Error updating flashcard:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to update flashcard" });
    }
  };

  const updateAlphabetLetterProgress = async (id: string, increment: number = 10) => {
    try {
      await storageService.updateAlphabetProgress(id, increment);
      
      // Find the letter in the current state to get current progress
      let foundLetter: AlphabetLetter | null = null;
      for (const group of state.alphabetLetters) {
        const letter = group.characters.find((char): char is AlphabetLetter => 
          char !== null && char.id === id
        );
        if (letter) {
          foundLetter = letter;
          break;
        }
      }
      
      if (foundLetter) {
        const newProgress = Math.min(100, (foundLetter.progress || 0) + increment);
        dispatch({ 
          type: "UPDATE_ALPHABET_LETTER", 
          payload: { id, updates: { progress: newProgress } } 
        });
      }
    } catch (error) {
      console.error("Error updating alphabet letter progress:", error);
    }
  };

  const updateNumberProgress = async (id: string, increment: number = 10) => {
    try {
      await storageService.updateNumberProgress(id, increment);
      const updatedNumber = state.numbers.find(n => n.id === id);
      if (updatedNumber) {
        const newProgress = Math.min(100, (updatedNumber.progress || 0) + increment);
        dispatch({ 
          type: "UPDATE_NUMBER", 
          payload: { id, updates: { progress: newProgress } } 
        });
      }
    } catch (error) {
      console.error("Error updating number progress:", error);
    }
  };

  const getAlphabetGroupsByLanguage = (language: string): CharacterGroup[] => {
    return state.alphabetLetters.filter(group => group.language === language);
  };

  const getNumbersByLanguage = (language: string): NumberItem[] => {
    return state.numbers.filter(number => number.language === language);
  };

  const updateTodayStats = async (updates: Partial<DailyStats>) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const currentStats = state.todayStats || {
        date: today,
        wordsLearned: 0,
        timeSpent: 0,
        gamesPlayed: 0,
        flashcardsReviewed: 0,
        streakDay: state.currentStreak + 1,
      };

      const updatedStats = { ...currentStats, ...updates };
      await storageService.saveDailyStats(updatedStats);
      dispatch({ type: "UPDATE_TODAY_STATS", payload: updates });
    } catch (error) {
      console.error("Error updating daily stats:", error);
    }
  };

  const updateUserPreferences = async (preferences: Partial<UserPreferences>) => {
    if (state.user) {
      try {
        await storageService.updateUserPreferences(preferences);
        dispatch({ type: "UPDATE_USER_PREFERENCES", payload: preferences });
      } catch (error) {
        console.error("Error updating user preferences:", error);
        dispatch({ type: "SET_ERROR", payload: "Failed to update preferences" });
      }
    }
  };

  const createDefaultUser = async () => {
    try {
      const defaultUser: User = {
        id: Date.now().toString(),
        name: "Ousaro",
        nativeLanguage: "English",
        learningLanguages: ["Japanese"],
        currentStreak: 0,
        longestStreak: 0,
        totalWordsLearned: 0,
        dailyGoal: 20,
        achievements: [],
        preferences: {
          theme: "dark",
          primaryColor: "#0ea5e9",
          notifications: true,
          reminderTime: "19:00",
          practiceMode: "mixed",
          autoPlayAudio: true,
          showTranslations: true,
          firstTimeUser: false,
        },
      };

      await storageService.saveUser(defaultUser);
      dispatch({ type: "SET_USER", payload: defaultUser });
    } catch (error) {
      console.error("Error creating default user:", error);
    }
  };

  const actions = {
    loadInitialData,
    initializeAlphabetData,
    addWord,
    updateWord,
    deleteWord,
    addFlashCard,
    updateFlashCard,
    updateTodayStats,
    createDefaultUser,
    updateUserPreferences,
    updateAlphabetLetterProgress,
    updateNumberProgress,
    getAlphabetGroupsByLanguage,
    getNumbersByLanguage,
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}