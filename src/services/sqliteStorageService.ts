import {
  Word,
  User,
} from "../types";
import PerformanceMonitor from "../utils/performanceMonitor";
import SQLiteDatabase from "../database/sqlite";

class SQLiteStorageService {
  private static instance: SQLiteStorageService;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly WORDS_CACHE_TTL = 2 * 60 * 1000; // 2 minutes for words (shorter due to frequent updates)
  private isInitialized = false;
  
  static getInstance(): SQLiteStorageService {
    if (!SQLiteStorageService.instance) {
      SQLiteStorageService.instance = new SQLiteStorageService();
    }
    return SQLiteStorageService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      await SQLiteDatabase.initialize();
      this.isInitialized = true;
      console.log('Storage service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize storage service:', error);
      throw new Error(`SQLite storage service initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Cache management
  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedData<T>(key: string, data: T, customTtl?: number): void {
    const ttl = customTtl || this.CACHE_TTL;
    this.cache.set(key, {
      data: data,
      timestamp: Date.now(),
      ttl: ttl
    });
  }

  private invalidateCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Word management with optimized pagination
  async getWordsPaginated(options: {
    limit: number;
    offset: number;
    searchQuery?: string;
    onlyFavorites?: boolean;
    dateRange?: 'all' | 'week' | 'month' | '3months' | '6months';
    sortBy?: 'newest' | 'alphabetical';
    direction?: 'asc' | 'desc';
  }): Promise<{ words: Word[]; totalCount: number; hasMore: boolean }> {
    return PerformanceMonitor.measureAsync('getWordsPaginated', async () => {
      const cacheKey = `words_paginated_${JSON.stringify(options)}`;
      const cached = this.getCachedData<{ words: Word[]; totalCount: number; hasMore: boolean }>(cacheKey);
      if (cached) return cached;

      const result = await SQLiteDatabase.getWordsPaginated(options);
      
      const words: Word[] = result.words.map((row: any) => ({
        id: row.id,
        text: row.text,
        definition: row.definition,
        translation: row.translation,
        notes: row.notes || '',
        tags: JSON.parse(row.tags || '[]'),
        pronunciation: row.pronunciation,
        dateAdded: row.date_added,
        isFavorite: Boolean(row.is_favorite),
      }));

      const response = {
        words,
        totalCount: result.totalCount,
        hasMore: result.hasMore
      };

      // Cache with shorter TTL for paginated results
      this.setCachedData(cacheKey, response, this.WORDS_CACHE_TTL);
      return response;
    });
  }

  async saveWords(words: Word[]): Promise<void> {
    return PerformanceMonitor.measureAsync('saveWords', async () => {
      // Use batch insert for better performance
      await SQLiteDatabase.batchInsertWords(words);
      this.invalidateCache('words');
    });
  }

  async getWords(): Promise<Word[]> {
    return PerformanceMonitor.measureAsync('getWords', async () => {
      const cached = this.getCachedData<Word[]>('words_all');
      if (cached) return cached;

      const db = await SQLiteDatabase.getDatabase();
      const rows = await db.getAllAsync(`
        SELECT * FROM words 
        ORDER BY date_added DESC
        LIMIT 1000
      `);

      const words: Word[] = rows.map((row: any) => ({
        id: row.id,
        text: row.text,
        definition: row.definition,
        translation: row.translation,
        notes: row.notes || '',
        tags: JSON.parse(row.tags || '[]'),
        pronunciation: row.pronunciation,
        dateAdded: row.date_added,
        isFavorite: Boolean(row.is_favorite),
      }));

      this.setCachedData('words_all', words, this.WORDS_CACHE_TTL);
      return words;
    });
  }

  async addWord(word: Word): Promise<void> {
    return PerformanceMonitor.measureAsync('addWord', async () => {
      const db = await SQLiteDatabase.getDatabase();
      
      await db.runAsync(`
        INSERT OR REPLACE INTO words (
          id, text, definition, translation, notes, tags, pronunciation,
          date_added, is_favorite, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        word.id, word.text, word.definition, word.translation, word.notes,
        JSON.stringify(word.tags), word.pronunciation || null,
        word.dateAdded, word.isFavorite ? 1 : 0
      ]);

      this.invalidateCache('words');
    });
  }

  async updateWord(wordId: string, updates: Partial<Word>): Promise<void> {
    const db = await SQLiteDatabase.getDatabase();
    
    const setParts: string[] = [];
    const values: any[] = [];
    
    if (updates.text !== undefined) {
      setParts.push('text = ?');
      values.push(updates.text);
    }
    if (updates.definition !== undefined) {
      setParts.push('definition = ?');
      values.push(updates.definition);
    }
    if (updates.translation !== undefined) {
      setParts.push('translation = ?');
      values.push(updates.translation);
    }
    if (updates.notes !== undefined) {
      setParts.push('notes = ?');
      values.push(updates.notes);
    }
    if (updates.tags !== undefined) {
      setParts.push('tags = ?');
      values.push(JSON.stringify(updates.tags));
    }
    if (updates.pronunciation !== undefined) {
      setParts.push('pronunciation = ?');
      values.push(updates.pronunciation);
    }
    if (updates.isFavorite !== undefined) {
      setParts.push('is_favorite = ?');
      values.push(updates.isFavorite ? 1 : 0);
    }

    if (setParts.length === 0) return;

    setParts.push('updated_at = CURRENT_TIMESTAMP');
    values.push(wordId);

    await db.runAsync(`
      UPDATE words SET ${setParts.join(', ')} WHERE id = ?
    `, values);

    this.invalidateCache('words');
  }

  async deleteWord(wordId: string): Promise<void> {
    const db = await SQLiteDatabase.getDatabase();
    await db.runAsync('DELETE FROM words WHERE id = ?', [wordId]);
    this.invalidateCache('words');
  }


  // User management
  async saveUser(user: User): Promise<void> {
    try {
      const db = await SQLiteDatabase.getDatabase();
      
      await db.runAsync(`
        INSERT OR REPLACE INTO users (
          id, name, native_language, learning_languages, theme, primary_color,
          practice_mode, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        user.id, user.name, user.nativeLanguage, JSON.stringify(user.learningLanguages),
        user.theme, user.primaryColor,
        user.practiceMode,
      ]);

      this.invalidateCache('user');
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  async getUser(): Promise<User | null> {
    const cached = this.getCachedData<User>('user');
    if (cached) return cached;

    const db = await SQLiteDatabase.getDatabase();
    const row = await db.getFirstAsync<any>(`SELECT * FROM users LIMIT 1`);

    if (!row) return null;

    const user: User = {
      id: row.id,
      name: row.name,
      nativeLanguage: row.native_language,
      learningLanguages: JSON.parse(row.learning_languages || '[]'),
      theme: row.theme,
      primaryColor: row.primary_color,
      practiceMode: row.practice_mode,
    };

    this.setCachedData('user', user);
    return user;
  }

  async updateUserPreferences(updates: Partial<Pick<User, 'theme' | 'primaryColor' | 'practiceMode'>>): Promise<void> {
    try {
      const user = await this.getUser();
      if (!user) {
        return;
      }

      const updatedUser: User = {
        ...user,
        ...updates
      };

      await this.saveUser(updatedUser);
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  // Utility methods
  async cleanup(): Promise<void> {
    this.cache.clear();
  }

  async clearAllData(): Promise<void> {
    const db = await SQLiteDatabase.getDatabase();
    
    await SQLiteDatabase.executeWithTransaction(async () => {
      await db.execAsync('DELETE FROM words;');
      await db.execAsync('DELETE FROM users;');
    });

    this.invalidateCache();
  }

  async exportData(): Promise<string> {
    const data = {
      words: await this.getWords(),
      user: await this.getUser(),
    };

    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.words && Array.isArray(data.words)) {
        await this.saveWords(data.words);
      }
      
      if (data.user) {
        await this.saveUser(data.user);
      }
      
      this.invalidateCache();
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data: Invalid format');
    }
  }

  // Database optimization methods
  async optimizeDatabase(): Promise<void> {
    return PerformanceMonitor.measureAsync('optimizeDatabase', async () => {
      await SQLiteDatabase.optimizeDatabase();
      this.invalidateCache(); // Clear cache after optimization
    });
  }

  async getDatabaseStats(): Promise<{
    wordCount: number;
    dbSize: number;
    indexCount: number;
  }> {
    return PerformanceMonitor.measureAsync('getDatabaseStats', async () => {
      return await SQLiteDatabase.getDatabaseStats();
    });
  }

  // Performance monitoring
  async clearExpiredCache(): Promise<void> {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= value.ttl) {
        this.cache.delete(key);
      }
    }
  }

  async forceWrite(): Promise<void> {
    // SQLite auto-commits, but we can force a checkpoint
    const db = await SQLiteDatabase.getDatabase();
    await db.execAsync('PRAGMA wal_checkpoint(TRUNCATE);');
  }
}

export default SQLiteStorageService.getInstance();
