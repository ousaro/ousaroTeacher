import * as SQLite from 'expo-sqlite';

export class SQLiteDatabase {
  private static instance: SQLiteDatabase;
  private db: SQLite.SQLiteDatabase | null = null;
  private readonly DB_NAME = 'ousaro_teacher.db';
  private initializationPromise: Promise<void> | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): SQLiteDatabase {
    if (!SQLiteDatabase.instance) {
      SQLiteDatabase.instance = new SQLiteDatabase();
    }
    return SQLiteDatabase.instance;
  }

  async initialize(): Promise<void> {
    // Return immediately if already initialized
    if (this.isInitialized && this.db) {
      return;
    }

    // Prevent multiple initialization attempts
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    try {
      await this.initializationPromise;
      this.isInitialized = true;
    } catch (error) {
      this.isInitialized = false;
      throw error;
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
        
        // Only log on first attempt or final failure
        if (retryCount === 0) {
          console.log('Initializing SQLite database...');
        }
        
        this.db = await SQLite.openDatabaseAsync(this.DB_NAME);
        
        if (!this.db) {
          throw new Error('Failed to open database');
        }
        
        // Configure SQLite for better performance - do this in smaller chunks to avoid null pointer
        try {
          await this.db.execAsync('PRAGMA journal_mode = WAL;');
          await this.db.execAsync('PRAGMA synchronous = NORMAL;');
          await this.db.execAsync('PRAGMA cache_size = -20000;');
          await this.db.execAsync('PRAGMA temp_store = MEMORY;');
          await this.db.execAsync('PRAGMA mmap_size = 268435456;');
        } catch (pragmaError) {
          console.warn('Some PRAGMA settings failed, continuing with basic configuration:', pragmaError);
        }
        
        // Test the database connection
        await this.db.getFirstAsync('SELECT 1');
        
        await this.createTables();
        console.log('SQLite database initialized successfully');
        return; // Success, exit the retry loop
      } catch (error) {
        retryCount++;
        this.db = null; // Reset database reference on error
        
        if (retryCount >= maxRetries) {
          console.error(`Failed to initialize database after ${maxRetries} attempts:`, error);
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
      DROP TABLE IF EXISTS words;
      DROP TABLE IF EXISTS users;
    `;

    await this.db.execAsync(dropTablesSQL);
    console.log('All tables dropped successfully');
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Enable foreign keys
      await this.db.execAsync('PRAGMA foreign_keys = ON;');

      //await this.dropAllTables();
      // Create tables one by one to avoid issues with large SQL blocks
      await this.createUsersTable();
      await this.createWordsTable();
      await this.createIndexes();
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  private async createUsersTable(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        native_language TEXT NOT NULL,
        learning_languages TEXT NOT NULL,
        theme TEXT DEFAULT 'dark',
        primary_color TEXT DEFAULT '#007AFF',
        practice_mode TEXT DEFAULT 'mixed',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  private async createWordsTable(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS words (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        definition TEXT NOT NULL,
        translation TEXT NOT NULL,
        notes TEXT DEFAULT '',
        tags TEXT NOT NULL DEFAULT '[]',
        pronunciation TEXT,
        date_added TEXT NOT NULL,
        is_favorite INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }


  private async createIndexes(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    // Create indexes for better performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_words_text ON words(text COLLATE NOCASE);',
      'CREATE INDEX IF NOT EXISTS idx_words_translation ON words(translation COLLATE NOCASE);',
      'CREATE INDEX IF NOT EXISTS idx_words_date_added ON words(date_added DESC);',
      'CREATE INDEX IF NOT EXISTS idx_words_is_favorite ON words(is_favorite);',
    ];

    for (const indexSql of indexes) {
      try {
        await this.db.execAsync(indexSql);
      } catch (error) {
        console.warn('Failed to create index, continuing...', error);
      }
    }
  }


  async getDatabase(): Promise<SQLite.SQLiteDatabase> {
    // If already initialized and db exists, return immediately
    if (this.isInitialized && this.db) {
      // Quick connection test
      try {
        await this.db.getFirstAsync('SELECT 1');
        return this.db;
      } catch (error) {
        // Connection is invalid, reset and reinitialize
        this.isInitialized = false;
        this.db = null;
      }
    }
    
    // Initialize if not already done
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (!this.db) {
      throw new Error('Failed to initialize database');
    }
    
    return this.db;
  }

  async closeDatabase(): Promise<void> {
    if (this.db) {
      try {
        await this.db.closeAsync();
      } catch (error) {
        console.error('Error closing database:', error);
      } finally {
        this.db = null;
        this.isInitialized = false;
      }
    }
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
    onlyFavorites?: boolean;
    dateRange?: 'all' | 'week' | 'month' | '3months' | '6months';
    sortBy?: 'newest' | 'alphabetical';
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
      whereConditions.push(`(
          text LIKE ? COLLATE NOCASE OR 
          translation LIKE ? COLLATE NOCASE
        )`);
      const likePattern = `%${searchTerm}%`;
      queryParams.push(likePattern, likePattern);
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
          date_added, is_favorite, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      
      try {
        for (const word of words) {
          await stmt.executeAsync([
            word.id, word.text, word.definition, word.translation, word.notes,
            JSON.stringify(word.tags), word.pronunciation || null,
            word.dateAdded, word.isFavorite ? 1 : 0,
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
