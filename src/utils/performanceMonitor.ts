// Performance monitoring utility for tracking storage operations
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private operations: Map<string, { startTime: number; count: number; totalTime: number }> = new Map();
  private enabled: boolean = __DEV__; // Only enable in development

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startOperation(operationName: string): string {
    if (!this.enabled) return '';
    
    const operationId = `${operationName}_${Date.now()}_${Math.random()}`;
    const existing = this.operations.get(operationName) || { startTime: 0, count: 0, totalTime: 0 };
    
    this.operations.set(operationName, {
      ...existing,
      startTime: performance.now(),
      count: existing.count + 1
    });
    
    return operationId;
  }

  endOperation(operationName: string): number {
    if (!this.enabled) return 0;
    
    const operation = this.operations.get(operationName);
    if (!operation) return 0;
    
    const endTime = performance.now();
    const duration = endTime - operation.startTime;
    
    this.operations.set(operationName, {
      ...operation,
      totalTime: operation.totalTime + duration
    });
    
    return duration;
  }

  getStats(): Record<string, { averageTime: number; count: number; totalTime: number }> {
    if (!this.enabled) return {};
    
    const stats: Record<string, { averageTime: number; count: number; totalTime: number }> = {};
    
    for (const [name, data] of this.operations.entries()) {
      stats[name] = {
        averageTime: data.count > 0 ? data.totalTime / data.count : 0,
        count: data.count,
        totalTime: data.totalTime
      };
    }
    
    return stats;
  }

  logStats(): void {
    if (!this.enabled) return;
    
    const stats = this.getStats();
    console.group('📊 Storage Performance Stats');
    
    Object.entries(stats).forEach(([operation, data]) => {
      console.log(`${operation}:`, {
        averageTime: `${data.averageTime.toFixed(2)}ms`,
        count: data.count,
        totalTime: `${data.totalTime.toFixed(2)}ms`
      });
    });
    
    console.groupEnd();
  }

  reset(): void {
    this.operations.clear();
  }

  // Helper method to wrap async operations
  async measureAsync<T>(operationName: string, operation: () => Promise<T>): Promise<T> {
    try {
      const result = await operation();
      this.endOperation(operationName);
      return result;
    } catch (error) {
      this.endOperation(operationName);
      throw error;
    }
  }


  // Memory usage tracking (if available)
  getMemoryUsage(): { used: number; total: number } | null {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize / 1024 / 1024, // Convert to MB
        total: memory.totalJSHeapSize / 1024 / 1024 // Convert to MB
      };
    }
    return null;
  }

  logMemoryUsage(): void {
    const memory = this.getMemoryUsage();
    if (memory) {
      console.log(`🧠 Memory Usage: ${memory.used.toFixed(2)}MB / ${memory.total.toFixed(2)}MB`);
    }
  }
}

export default PerformanceMonitor.getInstance();
