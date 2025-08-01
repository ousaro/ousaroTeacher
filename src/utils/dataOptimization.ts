// Performance optimization utilities for mobile data loading

import { AlphabetLetter, NumberItem, CharacterGroup } from "../types";

/**
 * Lazy data loader with caching for better mobile performance
 */
class DataOptimizer {
  private static instance: DataOptimizer;
  private cache: Map<string, any> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();

  static getInstance(): DataOptimizer {
    if (!DataOptimizer.instance) {
      DataOptimizer.instance = new DataOptimizer();
    }
    return DataOptimizer.instance;
  }

  /**
   * Optimized data loading with chunking for mobile
   */
  async loadDataChunked<T>(
    key: string,
    dataLoader: () => Promise<T> | T,
    chunkSize: number = 50
  ): Promise<T> {
    // Return cached data if available
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    // Return existing promise if already loading
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key);
    }

    // Create new loading promise
    const loadingPromise = this.performChunkedLoad(dataLoader, chunkSize);
    this.loadingPromises.set(key, loadingPromise);

    try {
      const result = await loadingPromise;
      this.cache.set(key, result);
      this.loadingPromises.delete(key);
      return result;
    } catch (error) {
      this.loadingPromises.delete(key);
      throw error;
    }
  }

  private async performChunkedLoad<T>(
    dataLoader: () => Promise<T> | T,
    chunkSize: number
  ): Promise<T> {
    return new Promise(async (resolve, reject) => {
      try {
        // Use requestIdleCallback for non-blocking loading
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(async () => {
            try {
              const result = await dataLoader();
              resolve(result);
            } catch (error) {
              reject(error);
            }
          });
        } else {
          // Fallback for environments without requestIdleCallback
          setTimeout(async () => {
            try {
              const result = await dataLoader();
              resolve(result);
            } catch (error) {
              reject(error);
            }
          }, 0);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Flatten and optimize character data for FlatList
   */
  flattenCharacterGroups(groups: CharacterGroup[]): AlphabetLetter[] {
    const flattened: AlphabetLetter[] = [];
    
    for (const group of groups) {
      if (group?.characters) {
        for (const char of group.characters) {
          if (char !== null) {
            flattened.push(char);
          }
        }
      }
    }
    
    return flattened;
  }

  /**
   * Optimize data for mobile rendering
   */
  optimizeForMobile<T extends AlphabetLetter | NumberItem>(data: T[]): T[] {
    // Remove unnecessary properties for rendering
    return data.map(item => ({
      ...item,
      // Remove heavy properties that aren't needed for initial render
      progress: undefined, // Remove progress for performance
    })) as T[];
  }

  /**
   * Batch process data updates
   */
  batchUpdate<T>(
    items: T[],
    updateFn: (item: T) => T,
    batchSize: number = 20
  ): Promise<T[]> {
    return new Promise((resolve) => {
      const result: T[] = [];
      let currentIndex = 0;

      const processBatch = () => {
        const endIndex = Math.min(currentIndex + batchSize, items.length);
        
        for (let i = currentIndex; i < endIndex; i++) {
          result.push(updateFn(items[i]));
        }

        currentIndex = endIndex;

        if (currentIndex < items.length) {
          // Use setTimeout to prevent blocking
          setTimeout(processBatch, 0);
        } else {
          resolve(result);
        }
      };

      processBatch();
    });
  }

  /**
   * Clear cache to free memory
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache size for monitoring
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}

export default DataOptimizer.getInstance();
