import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { 
  Word, 
  User
} from "../types";
import storageService  from "../services/storageService";
import initializationService from "../services/initializationService";
import PerformanceMonitor from "../utils/performanceMonitor";
import DatabaseOptimizer from "../utils/databaseOptimizer";

export enum ErrorType {
  STORAGE_INIT = 'storage_init',
  DATA_LOAD = 'data_load',
  DATA_SAVE = 'data_save',
  USER_CREATE = 'user_create',
  NETWORK = 'network',
  UNKNOWN = 'unknown'
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
  timestamp: number;
  canRetry: boolean;
}

interface AppState {
  user: User | null;
  words: Word[];
  isLoading: boolean;
  error: AppError | null;
  isInitialized: boolean;
  retryAttempts: number;
}

type AppAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: AppError | null }
  | { type: "SET_USER"; payload: User | null }
  | { type: "UPDATE_USER_PREFERENCES"; payload: Partial<Pick<User, 'theme' | 'primaryColor' | 'practiceMode'>> }
  | { type: "SET_WORDS"; payload: Word[] }
  | { type: "ADD_WORD"; payload: Word }
  | { type: "UPDATE_WORD"; payload: { id: string; updates: Partial<Word> } }
  | { type: "DELETE_WORD"; payload: string }
  | { type: "SET_INITIALIZED"; payload: boolean }
  | { type: "INCREMENT_RETRY"; payload?: void }
  | { type: "RESET_RETRY"; payload?: void };

const initialState: AppState = {
  user: null,
  words: [],
  isLoading: true,
  error: null,
  isInitialized: false,
  retryAttempts: 0,
};

// Helper function to create standardized errors
const createAppError = (type: ErrorType, message: string, details?: string, canRetry: boolean = true): AppError => ({
  type,
  message,
  details,
  timestamp: Date.now(),
  canRetry,
});

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };

    case "SET_USER":
      return { ...state, user: action.payload };

    case "UPDATE_USER_PREFERENCES":
      return {
        ...state,
        user: state.user
          ? {
              ...state.user,
              ...action.payload,
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

    case "SET_INITIALIZED":
      return { ...state, isInitialized: action.payload };

    case "INCREMENT_RETRY":
      return { ...state, retryAttempts: state.retryAttempts + 1 };

    case "RESET_RETRY":
      return { ...state, retryAttempts: 0 };

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
    createDefaultUser: () => Promise<void>;
    updateUserPreferences: (preferences: Partial<Pick<User, 'theme' | 'primaryColor' | 'practiceMode'>>) => Promise<void>;
    reinitializeStorage: () => Promise<void>;
    clearError: () => void;
    retryLastAction: () => Promise<void>;
    forceReload: () => Promise<void>;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const loadInitialData = async () => {
    const maxRetries = 3;
    const currentAttempt = state.retryAttempts + 1;
    
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      // Initialize app once (this will initialize storage/database)
      await initializationService.initializeApp();
      dispatch({ type: "SET_INITIALIZED", payload: true });

      // Load core data (user, words)
      const [user, words] = await Promise.all([
        storageService.getUser(),
        storageService.getWords(),
      ]);

      // Create default user if none exists
      if (!user) {
        await createDefaultUser();
        const newUser = await storageService.getUser();
        dispatch({ type: "SET_USER", payload: newUser });
      } else {
        dispatch({ type: "SET_USER", payload: user });
      }

      dispatch({ type: "SET_WORDS", payload: words });
      dispatch({ type: "RESET_RETRY" });

    } catch (error) {
      console.error("Error loading initial data:", error);
      dispatch({ type: "INCREMENT_RETRY" });
      
      let errorType = ErrorType.DATA_LOAD;
      let errorMessage = "Failed to load app data";
      let canRetry = currentAttempt < maxRetries;
      
      if (error instanceof Error) {
        if (error.message.includes('initialization failed')) {
          errorType = ErrorType.STORAGE_INIT;
          errorMessage = "App initialization failed";
        }
        
        dispatch({ 
          type: "SET_ERROR", 
          payload: createAppError(
            errorType, 
            errorMessage, 
            error.message,
            canRetry
          )
        });
      } else {
        dispatch({ 
          type: "SET_ERROR", 
          payload: createAppError(errorType, errorMessage, String(error), canRetry)
        });
      }
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
      dispatch({ 
        type: "SET_ERROR", 
        payload: createAppError(
          ErrorType.DATA_SAVE, 
          "Failed to add word", 
          error instanceof Error ? error.message : String(error)
        )
      });
    }
  };

  const updateWord = async (id: string, updates: Partial<Word>) => {
    try {
      await storageService.updateWord(id, updates);
      dispatch({ type: "UPDATE_WORD", payload: { id, updates } });
    } catch (error) {
      console.error("Error updating word:", error);
      dispatch({ 
        type: "SET_ERROR", 
        payload: createAppError(
          ErrorType.DATA_SAVE, 
          "Failed to update word", 
          error instanceof Error ? error.message : String(error)
        )
      });
    }
  };

  const deleteWord = async (id: string) => {
    try {
      await storageService.deleteWord(id);
      dispatch({ type: "DELETE_WORD", payload: id });
    } catch (error) {
      console.error("Error deleting word:", error);
      dispatch({ 
        type: "SET_ERROR", 
        payload: createAppError(
          ErrorType.DATA_SAVE, 
          "Failed to delete word", 
          error instanceof Error ? error.message : String(error)
        )
      });
    }
  };

  const updateUserPreferences = async (preferences: Partial<Pick<User, 'theme' | 'primaryColor' | 'practiceMode'>>) => {
    if (state.user) {
      try {
        await storageService.updateUserPreferences(preferences);
        dispatch({ type: "UPDATE_USER_PREFERENCES", payload: preferences });
      } catch (error) {
        console.error("Error updating user preferences:", error);
        dispatch({ 
          type: "SET_ERROR", 
          payload: createAppError(
            ErrorType.DATA_SAVE, 
            "Failed to update preferences", 
            error instanceof Error ? error.message : String(error)
          )
        });
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
        theme: "dark",
        primaryColor: "#0ea5e9",
        practiceMode: "vocabulary"
      };

      await storageService.saveUser(defaultUser);
      dispatch({ type: "SET_USER", payload: defaultUser });
    } catch (error) {
      console.error("Error creating default user:", error);
    }
  };

  const reinitializeStorage = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });
      
      // Reset initialization service
      initializationService.reset();
      
      // Reinitialize everything
      await initializationService.initializeApp();
      dispatch({ type: "SET_INITIALIZED", payload: true });
      
      // Reload data
      await loadInitialData();
    } catch (error) {
      console.error("Error reinitializing storage:", error);
      dispatch({ 
        type: "SET_ERROR", 
        payload: createAppError(
          ErrorType.STORAGE_INIT, 
          "Failed to reinitialize storage", 
          error instanceof Error ? error.message : String(error),
          false
        )
      });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const clearError = () => {
    dispatch({ type: "SET_ERROR", payload: null });
  };

  const retryLastAction = async () => {
    if (state.error?.canRetry && state.retryAttempts < 3) {
      dispatch({ type: "SET_ERROR", payload: null });
      
      // Based on error type, retry the appropriate action
      switch (state.error.type) {
        case ErrorType.STORAGE_INIT:
        case ErrorType.DATA_LOAD:
          await loadInitialData();
          break;
        default:
          // For other errors, just clear and let user retry manually
          dispatch({ type: "RESET_RETRY" });
          break;
      }
    }
  };

  const forceReload = async () => {
    dispatch({ type: "RESET_RETRY" });
    dispatch({ type: "SET_ERROR", payload: null });
    dispatch({ type: "SET_INITIALIZED", payload: false });
    await loadInitialData();
  };

  const actions = {
    loadInitialData,
    addWord,
    updateWord,
    deleteWord,
    createDefaultUser,
    updateUserPreferences,
    reinitializeStorage,
    clearError,
    retryLastAction,
    forceReload,
  };

  useEffect(() => {
    loadInitialData();
    
    // Start background database optimization
    DatabaseOptimizer.backgroundOptimize();
    
    // Set up periodic cache cleanup to prevent memory leaks
    const cacheCleanupInterval = setInterval(() => {
      storageService.clearExpiredCache();
    }, 5 * 60 * 1000); // Clean up every 5 minutes
    
    // Set up periodic database optimization
    const dbOptimizationInterval = setInterval(() => {
      DatabaseOptimizer.optimizeIfNeeded();
    }, 6 * 60 * 60 * 1000); // Check every 6 hours
    
    // Set up performance monitoring (only in development)
    const performanceLogInterval = setInterval(() => {
      PerformanceMonitor.logStats();
      PerformanceMonitor.logMemoryUsage();
      PerformanceMonitor.reset(); // Reset stats to prevent memory buildup
    }, 60 * 1000); // Log every minute in dev mode
    
    // Cleanup function
    return () => {
      clearInterval(cacheCleanupInterval);
      clearInterval(dbOptimizationInterval);
      clearInterval(performanceLogInterval);
      // Force write any pending data when component unmounts
      storageService.forceWrite().catch(console.error);
    };
  }, []); // Empty dependency array is intentional - we only want this to run once

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