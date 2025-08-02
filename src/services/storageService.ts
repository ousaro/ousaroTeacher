// SQLite storage service for all platforms
import SQLiteStorageService from './sqliteStorageService';
import {
  Word,
  User,
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
        await this.storageService.initialize();
        this.isInitialized = true;
      } catch (error) {
        console.error('Failed to initialize storage service:', error);
        // Reset state to allow retry
        this.isInitialized = false;
        throw new Error(`Storage initialization failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  async initialize(): Promise<void> {
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

  async getWordsPaginated(options: {
    limit: number;
    offset: number;
    searchQuery?: string;
    onlyFavorites?: boolean;
    dateRange?: 'all' | 'week' | 'month' | '3months' | '6months';
    sortBy?: 'newest' | 'alphabetical';
    direction?: 'asc' | 'desc';
  }): Promise<{ words: Word[]; totalCount: number; hasMore: boolean }> {
    await this.ensureInitialized();
    return this.storageService.getWordsPaginated(options);
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

  async updateUserPreferences(updates: Partial<Pick<User, 'theme' | 'primaryColor' | 'practiceMode'>>): Promise<void> {
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

  // Database optimization methods
  async optimizeDatabase(): Promise<void> {
    await this.ensureInitialized();
    return this.storageService.optimizeDatabase();
  }

  async getDatabaseStats(): Promise<{
    wordCount: number;
    dbSize: number;
    indexCount: number;
  }> {
    await this.ensureInitialized();
    return this.storageService.getDatabaseStats();
  }
}

export default StorageService.getInstance();