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
      CREATE INDEX IF NOT EXISTS idx_words_text ON words(text);
      CREATE INDEX IF NOT EXISTS idx_words_tags ON words(tags);
      CREATE INDEX IF NOT EXISTS idx_words_date_added ON words(date_added);
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
}

export default SQLiteDatabase.getInstance();
