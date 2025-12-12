/**
 * Centralized Request Logger
 * Logs all API requests for debugging and monitoring
 */

interface LogEntry {
  timestamp: number;
  method: string;
  url: string;
  status?: number;
  duration?: number;
  error?: string;
}

class RequestLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 100; // Keep last 100 logs

  /**
   * Log a request start
   */
  logRequest(method: string, url: string): number {
    const timestamp = Date.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🌐 [API] ${method} ${url}`);
    }

    return timestamp;
  }

  /**
   * Log a successful response
   */
  logResponse(method: string, url: string, status: number, startTime: number): void {
    const duration = Date.now() - startTime;
    
    const entry: LogEntry = {
      timestamp: startTime,
      method,
      url,
      status,
      duration,
    };

    this.addLog(entry);

    if (process.env.NODE_ENV === 'development') {
      const emoji = status >= 200 && status < 300 ? '✅' : '⚠️';
      console.log(`${emoji} [API] ${method} ${url} - ${status} (${duration}ms)`);
    }
  }

  /**
   * Log an error
   */
  logError(method: string, url: string, error: Error, startTime: number): void {
    const duration = Date.now() - startTime;

    const entry: LogEntry = {
      timestamp: startTime,
      method,
      url,
      duration,
      error: error.message,
    };

    this.addLog(entry);

    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ [API] ${method} ${url} - Error: ${error.message} (${duration}ms)`);
    }
  }

  /**
   * Add log entry (with size limit)
   */
  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Keep only last N logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs with errors
   */
  getErrorLogs(): LogEntry[] {
    return this.logs.filter(log => log.error);
  }

  /**
   * Get stats
   */
  getStats() {
    const total = this.logs.length;
    const errors = this.logs.filter(log => log.error).length;
    const avgDuration = this.logs.reduce((sum, log) => sum + (log.duration || 0), 0) / total;

    return {
      total,
      errors,
      success: total - errors,
      avgDuration: Math.round(avgDuration),
    };
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = [];
  }
}

// Singleton instance
export const requestLogger = new RequestLogger();

// Expose to window in development for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__apiLogger = requestLogger;
  console.log('💡 API Logger available at window.__apiLogger');
}
