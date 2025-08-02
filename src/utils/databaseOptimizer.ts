import StorageService from '../services/storageService';

export class DatabaseOptimizer {
  private static instance: DatabaseOptimizer;
  private lastOptimization: Date | null = null;
  private readonly OPTIMIZATION_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

  static getInstance(): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer();
    }
    return DatabaseOptimizer.instance;
  }

  async shouldOptimize(): Promise<boolean> {
    if (!this.lastOptimization) {
      return true;
    }
    
    const timeSinceLastOptimization = Date.now() - this.lastOptimization.getTime();
    return timeSinceLastOptimization >= this.OPTIMIZATION_INTERVAL;
  }

  async optimizeIfNeeded(): Promise<boolean> {
    if (await this.shouldOptimize()) {
      return this.optimize();
    }
    return false;
  }

  async optimize(): Promise<boolean> {
    try {
      console.log('Starting database optimization...');
      const startTime = Date.now();
      
      // Clear expired cache first
      await StorageService.clearExpiredCache();
      
      // Optimize database
      await StorageService.optimizeDatabase();
      
      // Force write any pending changes
      await StorageService.forceWrite();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.lastOptimization = new Date();
      console.log(`Database optimization completed in ${duration}ms`);
      
      return true;
    } catch (error) {
      console.error('Database optimization failed:', error);
      return false;
    }
  }

  async getOptimizationStats(): Promise<{
    lastOptimized: Date | null;
    nextOptimization: Date | null;
    databaseStats: {
      wordCount: number;
      dbSize: number;
      indexCount: number;
    };
  }> {
    const databaseStats = await StorageService.getDatabaseStats();
    
    let nextOptimization: Date | null = null;
    if (this.lastOptimization) {
      nextOptimization = new Date(this.lastOptimization.getTime() + this.OPTIMIZATION_INTERVAL);
    }

    return {
      lastOptimized: this.lastOptimization,
      nextOptimization,
      databaseStats,
    };
  }

  // Manual optimization trigger (for settings screen)
  async forceOptimize(): Promise<boolean> {
    return this.optimize();
  }

  // Background optimization (call this on app startup)
  async backgroundOptimize(): Promise<void> {
    // Run optimization in background without blocking UI
    setTimeout(async () => {
      try {
        await this.optimizeIfNeeded();
      } catch (error) {
        console.error('Background optimization failed:', error);
      }
    }, 5000); // Wait 5 seconds after app start
  }
}

export default DatabaseOptimizer.getInstance();
