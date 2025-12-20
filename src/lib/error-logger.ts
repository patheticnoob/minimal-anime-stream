// Global error logging utility
type ErrorLevel = 'info' | 'warn' | 'error' | 'critical';

interface ErrorLog {
  level: ErrorLevel;
  message: string;
  context?: string;
  timestamp: number;
  error?: Error;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 100;

  log(level: ErrorLevel, message: string, context?: string, error?: Error) {
    const logEntry: ErrorLog = {
      level,
      message,
      context,
      timestamp: Date.now(),
      error,
    };

    this.logs.push(logEntry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output with appropriate level
    const prefix = `[${level.toUpperCase()}]${context ? ` [${context}]` : ''}`;
    
    switch (level) {
      case 'critical':
      case 'error':
        console.error(prefix, message, error || '');
        break;
      case 'warn':
        console.warn(prefix, message, error || '');
        break;
      default:
        console.log(prefix, message, error || '');
    }
  }

  getLogs(level?: ErrorLevel): ErrorLog[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const errorLogger = new ErrorLogger();

// Convenience methods
export const logError = (message: string, context?: string, error?: Error) => {
  errorLogger.log('error', message, context, error);
};

export const logWarn = (message: string, context?: string) => {
  errorLogger.log('warn', message, context);
};

export const logInfo = (message: string, context?: string) => {
  errorLogger.log('info', message, context);
};

export const logCritical = (message: string, context?: string, error?: Error) => {
  errorLogger.log('critical', message, context, error);
};
