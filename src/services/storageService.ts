// SQLite storage service for all platforms
import SQLiteStorageService from './sqliteStorageService';
import {
  Word,
  User,
  UserPreferences,
} from "../types";

// Unified storage service using only SQLite
class StorageService {
  private static instance: StorageService;
  private storageService: typeof SQLiteStorageService;
  private isInitialized = false;

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  constructor() {
    this.storageService = SQLiteStorageService;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      try {
        console.log('Initializing SQLite storage service...');
        await this.storageService.initialize();
        this.isInitialized = true;
        console.log('SQLite storage service initialized successfully');
      } catch (error) {
        console.error('Failed to initialize SQLite storage service:', error);
        // Reset state to allow retry
        this.isInitialized = false;
        throw new Error(`Storage initialization failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  async initialize(): Promise<void> {
    await this.ensureInitialized();
  }

  // Reset the storage service (for error recovery)
  async resetStorageService(): Promise<void> {
    this.isInitialized = false;
    await this.ensureInitialized();
  }

  // Word management
  async saveWords(words: Word[]): Promise<void> {
    await this.ensureInitialized();
    return this.storageService.saveWords(words);
  }

  async getWords(): Promise<Word[]> {
    await this.ensureInitialized();
    return this.storageService.getWords();
  }

  async addWord(word: Word): Promise<void> {
    await this.ensureInitialized();
    return this.storageService.addWord(word);
  }

  async updateWord(wordId: string, updates: Partial<Word>): Promise<void> {
    await this.ensureInitialized();
    return this.storageService.updateWord(wordId, updates);
  }

  async deleteWord(wordId: string): Promise<void> {
    await this.ensureInitialized();
    return this.storageService.deleteWord(wordId);
  }


  // User management
  async saveUser(user: User): Promise<void> {
    await this.ensureInitialized();
    return this.storageService.saveUser(user);
  }

  async getUser(): Promise<User | null> {
    await this.ensureInitialized();
    return this.storageService.getUser();
  }

  async updateUserPreferences(updates: Partial<UserPreferences>): Promise<void> {
    await this.ensureInitialized();
    return this.storageService.updateUserPreferences(updates);
  }

  // Utility methods
  async clearExpiredCache(): Promise<void> {
    await this.ensureInitialized();
    return this.storageService.clearExpiredCache();
  }

  async forceWrite(): Promise<void> {
    await this.ensureInitialized();
    return this.storageService.forceWrite();
  }

  // Data management
  async clearAllData(): Promise<void> {
    await this.ensureInitialized();
    return this.storageService.clearAllData();
  }

  async exportData(): Promise<string> {
    await this.ensureInitialized();
    return this.storageService.exportData();
  }

  async importData(jsonData: string): Promise<void> {
    await this.ensureInitialized();
    return this.storageService.importData(jsonData);
  }
}

export default StorageService.getInstance();