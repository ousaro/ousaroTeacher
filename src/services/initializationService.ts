import storageService from './storageService';

class InitializationService {
  private static instance: InitializationService;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  static getInstance(): InitializationService {
    if (!InitializationService.instance) {
      InitializationService.instance = new InitializationService();
    }
    return InitializationService.instance;
  }

  /**
   * Initialize the app once at startup
   * This should be called only once when the app starts
   */
  async initializeApp(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    
    try {
      await this.initializationPromise;
      this.isInitialized = true;
      console.log('App initialization completed successfully');
    } catch (error) {
      console.error('App initialization failed:', error);
      this.isInitialized = false;
      throw error;
    } finally {
      this.initializationPromise = null;
    }
  }

  private async performInitialization(): Promise<void> {
    console.log('Starting app initialization...');
    
    // Initialize storage service (which will initialize the database)
    await storageService.initialize();
    
    // Add any other app-wide initialization here
    // For example: analytics, crash reporting, etc.
  }

  /**
   * Check if the app is initialized
   */
  isAppInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Reset initialization state (for testing or error recovery)
   */
  reset(): void {
    this.isInitialized = false;
    this.initializationPromise = null;
  }
}

export default InitializationService.getInstance();
