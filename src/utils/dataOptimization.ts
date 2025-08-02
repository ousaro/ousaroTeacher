// Performance optimization utilities for mobile data loading

import { AlphabetLetter, NumberItem, CharacterGroup } from "../types";

/**
 * Lazy data loader with caching for better mobile performance
 */
class DataOptimizer {
  private static instance: DataOptimizer;
  private cache: Map<string, any> = new Map();
  static getInstance(): DataOptimizer {
    if (!DataOptimizer.instance) {
      DataOptimizer.instance = new DataOptimizer();
    }
    return DataOptimizer.instance;
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
 
}

export default DataOptimizer.getInstance();
