import {
  Word,
  User,
  UserPreferences,
} from "../types";
import PerformanceMonitor from "../utils/performanceMonitor";
import SQLiteDatabase from "../database/sqlite";

class SQLiteStorageService {
  private static instance: SQLiteStorageService;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly WORDS_CACHE_TTL = 2 * 60 * 1000; // 2 minutes for words (shorter due to frequent updates)
  
  static getInstance(): SQLiteStorageService {
    if (!SQLiteStorageService.instance) {
      SQLiteStorageService.instance = new SQLiteStorageService();
    }
    return SQLiteStorageService.instance;
  }

  async initialize(): Promise<void> {
    try {
      console.log('Initializing SQLite storage service...');
      await SQLiteDatabase.initialize();
      console.log('SQLite database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SQLite database:', error);
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
    category?: 'all' | 'learning' | 'mastered' | 'new';
    onlyFavorites?: boolean;
    dateRange?: 'all' | 'week' | 'month' | '3months' | '6months';
    sortBy?: 'newest' | 'alphabetical' | 'progress';
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
        rarity: row.rarity,
        dateAdded: row.date_added,
        lastReviewed: row.last_reviewed,
        reviewCount: row.review_count,
        correctCount: row.correct_count,
        isFavorite: Boolean(row.is_favorite),
        isMarkedDifficult: Boolean(row.is_marked_difficult),
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
        rarity: row.rarity,
        dateAdded: row.date_added,
        lastReviewed: row.last_reviewed,
        reviewCount: row.review_count,
        correctCount: row.correct_count,
        isFavorite: Boolean(row.is_favorite),
        isMarkedDifficult: Boolean(row.is_marked_difficult),
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
          rarity, date_added, last_reviewed, review_count,
          correct_count, is_favorite, is_marked_difficult, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        word.id, word.text, word.definition, word.translation, word.notes,
        JSON.stringify(word.tags), word.pronunciation || null,
        word.rarity, word.dateAdded, word.lastReviewed || null,
        word.reviewCount, word.correctCount, word.isFavorite ? 1 : 0,
        word.isMarkedDifficult ? 1 : 0
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
    if (updates.rarity !== undefined) {
      setParts.push('rarity = ?');
      values.push(updates.rarity);
    }
    if (updates.lastReviewed !== undefined) {
      setParts.push('last_reviewed = ?');
      values.push(updates.lastReviewed);
    }
    if (updates.reviewCount !== undefined) {
      setParts.push('review_count = ?');
      values.push(updates.reviewCount);
    }
    if (updates.correctCount !== undefined) {
      setParts.push('correct_count = ?');
      values.push(updates.correctCount);
    }
    if (updates.isFavorite !== undefined) {
      setParts.push('is_favorite = ?');
      values.push(updates.isFavorite ? 1 : 0);
    }
    if (updates.isMarkedDifficult !== undefined) {
      setParts.push('is_marked_difficult = ?');
      values.push(updates.isMarkedDifficult ? 1 : 0);
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
      console.log('Attempting to save user:', user.id);
      const db = await SQLiteDatabase.getDatabase();
      console.log('Database connection obtained successfully');
      
      await db.runAsync(`
        INSERT OR REPLACE INTO users (
          id, name, native_language, learning_languages, theme, primary_color,
          notifications, reminder_time, practice_mode, auto_play_audio,
          show_translations, first_time_user, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        user.id, user.name, user.nativeLanguage, JSON.stringify(user.learningLanguages),
        user.preferences.theme, user.preferences.primaryColor,
        user.preferences.notifications ? 1 : 0, user.preferences.reminderTime,
        user.preferences.practiceMode, user.preferences.autoPlayAudio ? 1 : 0,
        user.preferences.showTranslations ? 1 : 0, user.preferences.firstTimeUser ? 1 : 0
      ]);

      console.log('User saved successfully');
      this.invalidateCache('user');
    } catch (error) {
      console.error('Error in saveUser:', error);
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
      preferences: {
        theme: row.theme,
        primaryColor: row.primary_color,
        notifications: Boolean(row.notifications),
        reminderTime: row.reminder_time,
        practiceMode: row.practice_mode,
        autoPlayAudio: Boolean(row.auto_play_audio),
        showTranslations: Boolean(row.show_translations),
        firstTimeUser: Boolean(row.first_time_user),
      },
    };

    this.setCachedData('user', user);
    return user;
  }

  async updateUserPreferences(updates: Partial<UserPreferences>): Promise<void> {
    try {
      console.log('Attempting to update user preferences:', updates);
      const user = await this.getUser();
      if (!user) {
        console.log('No user found, cannot update preferences');
        return;
      }

      const updatedUser: User = {
        ...user,
        preferences: { ...user.preferences, ...updates }
      };

      await this.saveUser(updatedUser);
      console.log('User preferences updated successfully');
    } catch (error) {
      console.error('Error in updateUserPreferences:', error);
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
