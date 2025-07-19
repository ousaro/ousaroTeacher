import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { Word, User, FlashCard, DailyStats, UserPreferences } from "../types";
import storageService from "../services/storageService";

interface AppState {
  user: User | null;
  words: Word[];
  flashCards: FlashCard[];
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
  | { type: "SET_DAILY_STATS"; payload: DailyStats[] }
  | { type: "UPDATE_TODAY_STATS"; payload: Partial<DailyStats> }
  | { type: "UPDATE_STREAK"; payload: number };


const initialState: AppState = {
  user: null,
  words: [],
  flashCards: [],
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
          : state.user, // Return unchanged if no user
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
    addWord: (word: Word) => Promise<void>;
    updateWord: (id: string, updates: Partial<Word>) => Promise<void>;
    deleteWord: (id: string) => Promise<void>;
    addFlashCard: (flashCard: FlashCard) => Promise<void>;
    updateFlashCard: (id: string, updates: Partial<FlashCard>) => Promise<void>;
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
      dispatch({ type: "SET_LOADING", payload: true });

      const [user, words, flashCards, dailyStats] = await Promise.all([
        storageService.getUser(),
        storageService.getWords(),
        storageService.getFlashCards(),
        storageService.getDailyStats(),
      ]);

      dispatch({ type: "SET_USER", payload: user });
      dispatch({ type: "UPDATE_USER_PREFERENCES", payload: user?.preferences || {} });
      dispatch({ type: "SET_WORDS", payload: words });
      dispatch({ type: "SET_FLASHCARDS", payload: flashCards });
      dispatch({ type: "SET_DAILY_STATS", payload: dailyStats });

      // Calculate current streak
      const today = new Date().toISOString().split("T")[0];
      const sortedStats = dailyStats.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
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
      const updatedPreferences = { ...state.user.preferences, ...preferences };
      await storageService.updateUserPreferences(updatedPreferences)
        .then(() => {
          dispatch({ type: "UPDATE_USER_PREFERENCES", payload: updatedPreferences });  
        })
        .catch((error) => {
          console.error("Error updating user preferences:", error);
          dispatch({ type: "SET_ERROR", payload: "Failed to update preferences" });
        });
    }
  }

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
    addWord,
    updateWord,
    deleteWord,
    addFlashCard,
    updateFlashCard,
    updateTodayStats,
    createDefaultUser,
    updateUserPreferences
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
