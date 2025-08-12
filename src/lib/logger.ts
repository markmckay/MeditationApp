export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  sessionId?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private currentSessionId: string | null = null;
  private maxLogs = 1000;

  setSessionId(sessionId: string) {
    this.currentSessionId = sessionId;
    this.info('session', 'Session started', { sessionId });
  }

  clearSessionId() {
    if (this.currentSessionId) {
      this.info('session', 'Session ended', { sessionId: this.currentSessionId });
    }
    this.currentSessionId = null;
  }

  private log(level: LogLevel, category: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      sessionId: this.currentSessionId || undefined
    };

    this.logs.push(entry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output for development
    const levelName = LogLevel[level];
    const sessionInfo = this.currentSessionId ? `[${this.currentSessionId.slice(0, 8)}]` : '';
    console.log(`[${levelName}] ${sessionInfo} [${category}] ${message}`, data || '');
  }

  debug(category: string, message: string, data?: any) {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  info(category: string, message: string, data?: any) {
    this.log(LogLevel.INFO, category, message, data);
  }

  warn(category: string, message: string, data?: any) {
    this.log(LogLevel.WARN, category, message, data);
  }

  error(category: string, message: string, data?: any) {
    this.log(LogLevel.ERROR, category, message, data);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level >= level);
    }
    return [...this.logs];
  }

  getSessionLogs(sessionId: string): LogEntry[] {
    return this.logs.filter(log => log.sessionId === sessionId);
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  clearLogs() {
    this.logs = [];
    this.info('system', 'Logs cleared');
  }
}

export const logger = new Logger();