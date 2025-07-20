import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Word,
  FlashCard,
  User,
  GameResult,
  AlphabetLetter,
  NumberItem,
  DailyStats,
  PracticeSession,
  UserPreferences,
  CharacterGroup,
} from "../types";

class StorageService {
  private static instance: StorageService;

  // Storage keys
  private readonly keys = {
    WORDS: "@OusaroTeacher:words",
    FLASHCARDS: "@OusaroTeacher:flashcards",
    USER: "@OusaroTeacher:user",
    GAME_RESULTS: "@OusaroTeacher:gameResults",
    ALPHABET_LETTERS: "@OusaroTeacher:alphabetLetters",
    NUMBERS: "@OusaroTeacher:numbers",
    DAILY_STATS: "@OusaroTeacher:dailyStats",
    PRACTICE_SESSIONS: "@OusaroTeacher:practiceSessions",
    APP_SETTINGS: "@OusaroTeacher:appSettings",
  };

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Generic storage methods
  private async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      throw new Error(`Failed to save ${key}`);
    }
  }

  private async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
      return null;
    }
  }

  private async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw new Error(`Failed to remove ${key}`);
    }
  }

  // Word management (existing methods)
  async saveWords(words: Word[]): Promise<void> {
    await this.setItem(this.keys.WORDS, words);
  }

  async getWords(): Promise<Word[]> {
    const words = await this.getItem<Word[]>(this.keys.WORDS);
    return words || [];
  }

  async addWord(word: Word): Promise<void> {
    const words = await this.getWords();
    const existingIndex = words.findIndex((w) => w.id === word.id);

    if (existingIndex >= 0) {
      words[existingIndex] = word;
    } else {
      words.push(word);
    }

    await this.saveWords(words);
  }

  async updateWord(wordId: string, updates: Partial<Word>): Promise<void> {
    const words = await this.getWords();
    const index = words.findIndex((w) => w.id === wordId);

    if (index >= 0) {
      words[index] = { ...words[index], ...updates };
      await this.saveWords(words);
    }
  }

  async deleteWord(wordId: string): Promise<void> {
    const words = await this.getWords();
    const filteredWords = words.filter((w) => w.id !== wordId);
    await this.saveWords(filteredWords);
  }

  // Enhanced Alphabet Letters management
  async getAlphabetLetters(): Promise<CharacterGroup[]> {
    const letters = await this.getItem<CharacterGroup[]>(this.keys.ALPHABET_LETTERS);
    return letters || [];
  }

  async saveAlphabetLetters(letters: CharacterGroup[]): Promise<void> {
    console.log("Saving alphabet letters:", letters);
    await this.setItem(this.keys.ALPHABET_LETTERS, letters);
  }

 async initializeAlphabetLetters(alphabetData: CharacterGroup[], language: string): Promise<void> {
    const existingGroups = await this.getAlphabetLetters();
    
    // Check if letters for this language already exist by flattening all characters
    const existingCharacters = existingGroups
      .filter(group => group.language === language)
    
    if (existingCharacters.length === 0) {
      // Convert alphabet data to CharacterGroup objects
      const newGroups: CharacterGroup[] = alphabetData.map((item, groupIndex) => ({
        groupName: item.groupName,
        language: language,
        characters: item.characters?.map((char: AlphabetLetter | null, charIndex: number): AlphabetLetter => ({
          id: `${language}_${char?.character}_${Date.now()}_${groupIndex}_${charIndex}`,
          character: char?.character || "",
          name: char?.name || "",
          pronunciation: char?.pronunciation || "",
          example: char?.example || "",
          progress: 0, // Start with 0 progress
          language: language,
          audioUrl: char?.audioUrl || "", // Can be undefined
        }))
      }));

      // Combine with existing groups from other languages
      const allGroups = [...existingGroups, ...newGroups];
      await this.saveAlphabetLetters(allGroups);
    }
  }

async updateAlphabetLetter(letterId: string, updates: Partial<AlphabetLetter>): Promise<void> {
    const groups = await this.getAlphabetLetters();
    
    // Find the group and character index
    for (const group of groups) {
      const characterIndex = group.characters.findIndex(
        (char): char is AlphabetLetter => char !== null && char.id === letterId
      );
      
      if (characterIndex >= 0) {
        const existingCharacter = group.characters[characterIndex] as AlphabetLetter;
        group.characters[characterIndex] = { ...existingCharacter, ...updates };
        await this.saveAlphabetLetters(groups);
        return;
      }
    }
  }

  async updateAlphabetProgress(letterId: string, progressIncrement: number = 10): Promise<void> {
    const groups = await this.getAlphabetLetters();
    
    // Find the group and character index
    for (const group of groups) {
      const characterIndex = group.characters.findIndex(
        (char): char is AlphabetLetter => char !== null && char.id === letterId
      );
      
      if (characterIndex >= 0) {
        const character = group.characters[characterIndex] as AlphabetLetter;
        const currentProgress = character.progress || 0;
        const newProgress = Math.min(100, currentProgress + progressIncrement);
        
        group.characters[characterIndex] = { ...character, progress: newProgress };
        await this.saveAlphabetLetters(groups);
        return;
      }
    }
  }


  // Enhanced Numbers management
  async getNumbers(): Promise<NumberItem[]> {
    const numbers = await this.getItem<NumberItem[]>(this.keys.NUMBERS);
    return numbers || [];
  }

  async saveNumbers(numbers: NumberItem[]): Promise<void> {
    await this.setItem(this.keys.NUMBERS, numbers);
  }

  async initializeNumbers(numberData: NumberItem[], language: string): Promise<void> {
    const existingNumbers = await this.getNumbers();
    
    // Check if numbers for this language already exist
    const existingForLanguage = existingNumbers.filter(n => n.language === language);
    
    if (existingForLanguage.length === 0) {
      // Convert number data to NumberItem objects
      const newNumbers: NumberItem[] = numberData.map((item, index) => ({
        id: `${language}_${item.number}_${Date.now()}_${index}`,
        number: item.number,
        text: item.text,
        pronunciation: item.pronunciation,
        progress: 0, // Start with 0 progress
        language: language,
        audioUrl: undefined, // Can be added later
      }));

      // Combine with existing numbers from other languages
      const allNumbers = [...existingNumbers, ...newNumbers];
      await this.saveNumbers(allNumbers);
    }
  }

  async updateNumber(numberId: string, updates: Partial<NumberItem>): Promise<void> {
    const numbers = await this.getNumbers();
    const index = numbers.findIndex((n) => n.id === numberId);

    if (index >= 0) {
      numbers[index] = { ...numbers[index], ...updates };
      await this.saveNumbers(numbers);
    }
  }

  async updateNumberProgress(numberId: string, progressIncrement: number = 10): Promise<void> {
    const numbers = await this.getNumbers();
    const index = numbers.findIndex((n) => n.id === numberId);

    if (index >= 0) {
      const currentProgress = numbers[index].progress || 0;
      const newProgress = Math.min(100, currentProgress + progressIncrement);
      numbers[index].progress = newProgress;
      await this.saveNumbers(numbers);
    }
  }

  async getNumbersByLanguage(language: string): Promise<NumberItem[]> {
    const allNumbers = await this.getNumbers();
    return allNumbers.filter(number => number.language === language);
  }

  // FlashCard management (existing methods)
  async saveFlashCards(flashCards: FlashCard[]): Promise<void> {
    await this.setItem(this.keys.FLASHCARDS, flashCards);
  }

  async getFlashCards(): Promise<FlashCard[]> {
    const flashCards = await this.getItem<FlashCard[]>(this.keys.FLASHCARDS);
    return flashCards || [];
  }

  async addFlashCard(flashCard: FlashCard): Promise<void> {
    const flashCards = await this.getFlashCards();
    flashCards.push(flashCard);
    await this.saveFlashCards(flashCards);
  }

  async updateFlashCard(
    flashCardId: string,
    updates: Partial<FlashCard>,
  ): Promise<void> {
    const flashCards = await this.getFlashCards();
    const index = flashCards.findIndex((fc) => fc.id === flashCardId);

    if (index >= 0) {
      flashCards[index] = { ...flashCards[index], ...updates };
      await this.saveFlashCards(flashCards);
    }
  }

  // User management (existing methods)
  async saveUser(user: User): Promise<void> {
    await this.setItem(this.keys.USER, user);
  }

  async getUser(): Promise<User | null> {
    return await this.getItem<User>(this.keys.USER);
  }

  async updateUserPreferences(
    updates: Partial<UserPreferences>,
  ): Promise<void> {
    const user = await this.getUser();
    if (user) {
      user.preferences = { ...user.preferences, ...updates };
      await this.saveUser(user);
    }
  }

  // Game results (existing methods)
  async saveGameResult(result: GameResult): Promise<void> {
    const results =
      (await this.getItem<GameResult[]>(this.keys.GAME_RESULTS)) || [];
    results.push(result);
    await this.setItem(this.keys.GAME_RESULTS, results);
  }

  async getGameResults(): Promise<GameResult[]> {
    const results = await this.getItem<GameResult[]>(this.keys.GAME_RESULTS);
    return results || [];
  }

  // Daily stats (existing methods)
  async saveDailyStats(stats: DailyStats): Promise<void> {
    const allStats =
      (await this.getItem<DailyStats[]>(this.keys.DAILY_STATS)) || [];
    const existingIndex = allStats.findIndex((s) => s.date === stats.date);

    if (existingIndex >= 0) {
      allStats[existingIndex] = stats;
    } else {
      allStats.push(stats);
    }

    await this.setItem(this.keys.DAILY_STATS, allStats);
  }

  async getDailyStats(): Promise<DailyStats[]> {
    const stats = await this.getItem<DailyStats[]>(this.keys.DAILY_STATS);
    return stats || [];
  }

  // Practice sessions (existing methods)
  async savePracticeSession(session: PracticeSession): Promise<void> {
    const sessions =
      (await this.getItem<PracticeSession[]>(this.keys.PRACTICE_SESSIONS)) ||
      [];
    sessions.push(session);
    await this.setItem(this.keys.PRACTICE_SESSIONS, sessions);
  }

  async getPracticeSessions(): Promise<PracticeSession[]> {
    const sessions = await this.getItem<PracticeSession[]>(
      this.keys.PRACTICE_SESSIONS,
    );
    return sessions || [];
  }

  // Utility methods (existing methods)
  async clearAllData(): Promise<void> {
    const allKeys = Object.values(this.keys);
    await AsyncStorage.multiRemove(allKeys);
  }

  async exportData(): Promise<string> {
    const data = {
      words: await this.getWords(),
      flashCards: await this.getFlashCards(),
      user: await this.getUser(),
      gameResults: await this.getGameResults(),
      alphabetLetters: await this.getAlphabetLetters(),
      numbers: await this.getNumbers(),
      dailyStats: await this.getDailyStats(),
      practiceSessions: await this.getPracticeSessions(),
    };

    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);

      if (data.words) await this.saveWords(data.words);
      if (data.flashCards) await this.saveFlashCards(data.flashCards);
      if (data.user) await this.saveUser(data.user);
      if (data.alphabetLetters)
        await this.saveAlphabetLetters(data.alphabetLetters);
      if (data.numbers) await this.saveNumbers(data.numbers);

      // Game results and stats are arrays, so we need to append them
      if (data.gameResults) {
        for (const result of data.gameResults) {
          await this.saveGameResult(result);
        }
      }

      if (data.dailyStats) {
        for (const stats of data.dailyStats) {
          await this.saveDailyStats(stats);
        }
      }

      if (data.practiceSessions) {
        for (const session of data.practiceSessions) {
          await this.savePracticeSession(session);
        }
      }
    } catch (error) {
      console.error("Error importing data:", error);
      throw new Error("Failed to import data. Please check the file format.");
    }
  }
}

export default StorageService.getInstance();