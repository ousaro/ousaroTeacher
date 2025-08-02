import * as SQLite from 'expo-sqlite';

export class SQLiteDatabase {
  private static instance: SQLiteDatabase;
  private db: SQLite.SQLiteDatabase | null = null;
  private readonly DB_NAME = 'ousaro_teacher.db';
  private readonly DB_VERSION = 1;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): SQLiteDatabase {
    if (!SQLiteDatabase.instance) {
      SQLiteDatabase.instance = new SQLiteDatabase();
    }
    return SQLiteDatabase.instance;
  }

  async initialize(): Promise<void> {
    // Prevent multiple initialization attempts
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    try {
      await this.initializationPromise;
    } finally {
      this.initializationPromise = null;
    }
  }

  private async performInitialization(): Promise<void> {
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        // Close existing connection if any
        if (this.db) {
          await this.closeDatabase();
        }
        
        console.log(`Opening SQLite database (attempt ${retryCount + 1})...`);
        this.db = await SQLite.openDatabaseAsync(this.DB_NAME);
        
        if (!this.db) {
          throw new Error('Failed to open database');
        }
        
        // Configure SQLite for better performance
        await this.db.execAsync(`
          PRAGMA journal_mode = WAL;
          PRAGMA synchronous = NORMAL;
          PRAGMA cache_size = -20000;
          PRAGMA temp_store = MEMORY;
          PRAGMA mmap_size = 268435456;
          PRAGMA optimize;
        `);
        
        // Test the database connection
        await this.db.getFirstAsync('SELECT 1');
        console.log('Database connection test successful');
        
        console.log('Creating tables...');
        await this.createTables();
        console.log('SQLite database initialized successfully');
        return; // Success, exit the retry loop
      } catch (error) {
        retryCount++;
        console.error(`Error initializing SQLite database (attempt ${retryCount}):`, error);
        this.db = null; // Reset database reference on error
        
        if (retryCount >= maxRetries) {
          throw new Error(`Failed to initialize database after ${maxRetries} attempts: ${error}`);
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }
  }

  private async dropAllTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Drop all existing tables to start fresh
    const dropTablesSQL = `
      DROP TABLE IF EXISTS flashcards;
      DROP TABLE IF EXISTS game_results;
      DROP TABLE IF EXISTS alphabet_letters;
      DROP TABLE IF EXISTS numbers;
      DROP TABLE IF EXISTS character_groups;
      DROP TABLE IF EXISTS words;
      DROP TABLE IF EXISTS users;
    `;

    await this.db.execAsync(dropTablesSQL);
    console.log('All existing tables dropped successfully');
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Enable foreign keys
    await this.db.execAsync('PRAGMA foreign_keys = ON;');

    // Create tables
    const createTablesSQL = `
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        native_language TEXT NOT NULL,
        learning_languages TEXT NOT NULL, -- JSON array
        theme TEXT DEFAULT 'auto',
        primary_color TEXT DEFAULT '#007AFF',
        notifications INTEGER DEFAULT 1,
        reminder_time TEXT DEFAULT '09:00',
        practice_mode TEXT DEFAULT 'mixed',
        auto_play_audio INTEGER DEFAULT 1,
        show_translations INTEGER DEFAULT 1,
        first_time_user INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- Words table
      CREATE TABLE IF NOT EXISTS words (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        definition TEXT NOT NULL,
        translation TEXT NOT NULL,
        notes TEXT DEFAULT '',
        tags TEXT NOT NULL DEFAULT '[]', -- JSON array
        pronunciation TEXT,
        rarity INTEGER DEFAULT 0,
        date_added TEXT NOT NULL,
        last_reviewed TEXT,
        review_count INTEGER DEFAULT 0,
        correct_count INTEGER DEFAULT 0,
        is_favorite INTEGER DEFAULT 0,
        is_marked_difficult INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- Character Groups table
      CREATE TABLE IF NOT EXISTS character_groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_name TEXT NOT NULL,
        language TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(group_name, language)
      );

      -- Alphabet Letters table
      CREATE TABLE IF NOT EXISTS alphabet_letters (
        id TEXT PRIMARY KEY,
        character TEXT NOT NULL,
        name TEXT NOT NULL,
        pronunciation TEXT NOT NULL,
        example TEXT NOT NULL,
        audio_url TEXT,
        language TEXT NOT NULL,
        group_id INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES character_groups (id) ON DELETE SET NULL
      );

      -- Numbers table
      CREATE TABLE IF NOT EXISTS numbers (
        id TEXT PRIMARY KEY,
        number INTEGER NOT NULL,
        text TEXT NOT NULL,
        pronunciation TEXT NOT NULL,
        audio_url TEXT,
        language TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- Indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_words_text ON words(text COLLATE NOCASE);
      CREATE INDEX IF NOT EXISTS idx_words_translation ON words(translation COLLATE NOCASE);
      CREATE INDEX IF NOT EXISTS idx_words_definition ON words(definition COLLATE NOCASE);
      CREATE INDEX IF NOT EXISTS idx_words_tags ON words(tags);
      CREATE INDEX IF NOT EXISTS idx_words_date_added ON words(date_added DESC);
      CREATE INDEX IF NOT EXISTS idx_words_last_reviewed ON words(last_reviewed DESC);
      CREATE INDEX IF NOT EXISTS idx_words_is_favorite ON words(is_favorite);
      CREATE INDEX IF NOT EXISTS idx_words_is_marked_difficult ON words(is_marked_difficult);
      CREATE INDEX IF NOT EXISTS idx_words_review_count ON words(review_count DESC);
      CREATE INDEX IF NOT EXISTS idx_words_correct_count ON words(correct_count DESC);
      CREATE INDEX IF NOT EXISTS idx_words_rarity ON words(rarity);
      
      -- Composite indexes for common query patterns
      CREATE INDEX IF NOT EXISTS idx_words_favorite_date ON words(is_favorite, date_added DESC);
      CREATE INDEX IF NOT EXISTS idx_words_difficult_date ON words(is_marked_difficult, date_added DESC);
      CREATE INDEX IF NOT EXISTS idx_words_text_translation ON words(text COLLATE NOCASE, translation COLLATE NOCASE);
      
      -- Full-text search indexes (for better search performance)
      CREATE VIRTUAL TABLE IF NOT EXISTS words_fts USING fts5(
        text, translation, definition, tags,
        content='words',
        content_rowid='rowid'
      );
      
      -- Triggers to keep FTS table in sync
      CREATE TRIGGER IF NOT EXISTS words_fts_insert AFTER INSERT ON words BEGIN
        INSERT INTO words_fts(rowid, text, translation, definition, tags)
        VALUES (new.rowid, new.text, new.translation, new.definition, new.tags);
      END;
      
      CREATE TRIGGER IF NOT EXISTS words_fts_delete AFTER DELETE ON words BEGIN
        INSERT INTO words_fts(words_fts, rowid, text, translation, definition, tags)
        VALUES ('delete', old.rowid, old.text, old.translation, old.definition, old.tags);
      END;
      
      CREATE TRIGGER IF NOT EXISTS words_fts_update AFTER UPDATE ON words BEGIN
        INSERT INTO words_fts(words_fts, rowid, text, translation, definition, tags)
        VALUES ('delete', old.rowid, old.text, old.translation, old.definition, old.tags);
        INSERT INTO words_fts(rowid, text, translation, definition, tags)
        VALUES (new.rowid, new.text, new.translation, new.definition, new.tags);
      END;
      
      CREATE INDEX IF NOT EXISTS idx_alphabet_letters_language ON alphabet_letters(language);
      CREATE INDEX IF NOT EXISTS idx_alphabet_letters_character ON alphabet_letters(character);
      CREATE INDEX IF NOT EXISTS idx_numbers_language ON numbers(language);
      CREATE INDEX IF NOT EXISTS idx_numbers_number ON numbers(number);
    `;

    await this.db.execAsync(createTablesSQL);
  }

  async getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (!this.db) {
      console.log('Database not initialized, initializing now...');
      await this.initialize();
    }
    
    if (!this.db) {
      throw new Error('Failed to initialize database');
    }
    
    // Verify the database connection is still valid
    try {
      await this.db.getFirstAsync('SELECT 1');
    } catch (error) {
      console.log('Database connection invalid, reinitializing...');
      this.db = null;
      await this.initialize();
      if (!this.db) {
        throw new Error('Failed to reinitialize database');
      }
    }
    
    return this.db;
  }

  async closeDatabase(): Promise<void> {
    if (this.db) {
      try {
        console.log('Closing SQLite database...');
        await this.db.closeAsync();
        console.log('Database closed successfully');
      } catch (error) {
        console.error('Error closing database:', error);
      } finally {
        this.db = null;
      }
    }
  }

  // Migration support for future versions
  async getCurrentVersion(): Promise<number> {
    const db = await this.getDatabase();
    try {
      const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
      return result?.user_version || 0;
    } catch (error) {
      console.error('Error getting database version:', error);
      return 0;
    }
  }

  async setVersion(version: number): Promise<void> {
    const db = await this.getDatabase();
    await db.execAsync(`PRAGMA user_version = ${version};`);
  }

  // Utility methods for common operations
  async beginTransaction(): Promise<void> {
    const db = await this.getDatabase();
    await db.execAsync('BEGIN TRANSACTION;');
  }

  async commitTransaction(): Promise<void> {
    const db = await this.getDatabase();
    await db.execAsync('COMMIT;');
  }

  async rollbackTransaction(): Promise<void> {
    const db = await this.getDatabase();
    await db.execAsync('ROLLBACK;');
  }

  async executeWithTransaction<T>(operation: () => Promise<T>): Promise<T> {
    await this.beginTransaction();
    try {
      const result = await operation();
      await this.commitTransaction();
      return result;
    } catch (error) {
      await this.rollbackTransaction();
      throw error;
    }
  }

  // Optimized query methods for words
  async getWordsPaginated(options: {
    limit: number;
    offset: number;
    searchQuery?: string;
    category?: 'all' | 'learning' | 'mastered' | 'new';
    onlyFavorites?: boolean;
    dateRange?: 'all' | 'week' | 'month' | '3months' | '6months';
    sortBy?: 'newest' | 'alphabetical' | 'progress';
    direction?: 'asc' | 'desc';
  }): Promise<{ words: any[]; totalCount: number; hasMore: boolean }> {
    const db = await this.getDatabase();
    
    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    let orderBy = '';
    
    // Search condition using FTS if available
    if (options.searchQuery?.trim()) {
      const searchTerm = options.searchQuery.trim();
      // Try FTS first, fallback to LIKE
      try {
        whereConditions.push(`id IN (
          SELECT rowid FROM words_fts 
          WHERE words_fts MATCH ? 
        )`);
        queryParams.push(`"${searchTerm.replace(/"/g, '""')}"*`);
      } catch {
        // Fallback to LIKE search
        whereConditions.push(`(
          text LIKE ? COLLATE NOCASE OR 
          translation LIKE ? COLLATE NOCASE OR 
          definition LIKE ? COLLATE NOCASE
        )`);
        const likePattern = `%${searchTerm}%`;
        queryParams.push(likePattern, likePattern, likePattern);
      }
    }
    
    // Category filter (placeholder - adjust based on your progress tracking)
    if (options.category && options.category !== 'all') {
      switch (options.category) {
        case 'learning':
          whereConditions.push('review_count > 0 AND correct_count < (review_count * 0.8)');
          break;
        case 'mastered':
          whereConditions.push('correct_count >= (review_count * 0.8) AND review_count > 0');
          break;
        case 'new':
          whereConditions.push('review_count = 0');
          break;
      }
    }
    
    // Favorites filter
    if (options.onlyFavorites) {
      whereConditions.push('is_favorite = 1');
    }
    
    // Date range filter
    if (options.dateRange && options.dateRange !== 'all') {
      const now = new Date();
      let daysAgo = 0;
      switch (options.dateRange) {
        case 'week': daysAgo = 7; break;
        case 'month': daysAgo = 30; break;
        case '3months': daysAgo = 90; break;
        case '6months': daysAgo = 180; break;
      }
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      whereConditions.push('date_added >= ?');
      queryParams.push(cutoffDate.toISOString());
    }
    
    // Sorting
    const direction = options.direction === 'desc' ? 'DESC' : 'ASC';
    switch (options.sortBy) {
      case 'alphabetical':
        orderBy = `ORDER BY text COLLATE NOCASE ${direction}`;
        break;
      case 'progress':
        orderBy = `ORDER BY 
          CASE WHEN review_count = 0 THEN 0 
               ELSE (correct_count * 100.0 / review_count) 
          END ${direction}, date_added DESC`;
        break;
      case 'newest':
      default:
        orderBy = `ORDER BY date_added ${direction}`;
        break;
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM words ${whereClause}`;
    const countResult = await db.getFirstAsync<{ total: number }>(countQuery, queryParams);
    const totalCount = countResult?.total || 0;
    
    // Get paginated results
    const dataQuery = `
      SELECT * FROM words 
      ${whereClause} 
      ${orderBy} 
      LIMIT ? OFFSET ?
    `;
    const dataParams = [...queryParams, options.limit, options.offset];
    const words = await db.getAllAsync(dataQuery, dataParams);
    
    const hasMore = options.offset + options.limit < totalCount;
    
    return { words, totalCount, hasMore };
  }

  // Batch operations for better performance
  async batchInsertWords(words: any[]): Promise<void> {
    const db = await this.getDatabase();
    
    await this.executeWithTransaction(async () => {
      const stmt = await db.prepareAsync(`
        INSERT OR REPLACE INTO words (
          id, text, definition, translation, notes, tags, pronunciation,
          rarity, date_added, last_reviewed, review_count,
          correct_count, is_favorite, is_marked_difficult, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      
      try {
        for (const word of words) {
          await stmt.executeAsync([
            word.id, word.text, word.definition, word.translation, word.notes,
            JSON.stringify(word.tags), word.pronunciation || null,
            word.rarity, word.dateAdded, word.lastReviewed || null,
            word.reviewCount, word.correctCount, word.isFavorite ? 1 : 0,
            word.isMarkedDifficult ? 1 : 0
          ]);
        }
      } finally {
        await stmt.finalizeAsync();
      }
    });
  }

  // Database maintenance
  async optimizeDatabase(): Promise<void> {
    const db = await this.getDatabase();
    await db.execAsync(`
      PRAGMA optimize;
      PRAGMA integrity_check;
      VACUUM;
      ANALYZE;
    `);
  }

  async getDatabaseStats(): Promise<{
    wordCount: number;
    dbSize: number;
    indexCount: number;
  }> {
    const db = await this.getDatabase();
    
    const wordCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM words');
    const dbSize = await db.getFirstAsync<{ size: number }>('PRAGMA page_count');
    const indexCount = await db.getFirstAsync<{ count: number }>(`
      SELECT COUNT(*) as count FROM sqlite_master 
      WHERE type = 'index' AND name NOT LIKE 'sqlite_%'
    `);
    
    return {
      wordCount: wordCount?.count || 0,
      dbSize: (dbSize?.size || 0) * 4096, // Page size is typically 4KB
      indexCount: indexCount?.count || 0
    };
  }
}

export default SQLiteDatabase.getInstance();
