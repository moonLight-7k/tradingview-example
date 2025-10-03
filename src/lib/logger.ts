type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogData = Record<string, unknown> | string | number | boolean | null | undefined;

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    data?: LogData;
}

class Logger {
    private isDevelopment = process.env.NODE_ENV === 'development';
    private logLevel: LogLevel =
        (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || 'info';

    private levels: Record<LogLevel, number> = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3,
    };

    private shouldLog(level: LogLevel): boolean {
        return this.levels[level] >= this.levels[this.logLevel];
    }

    private formatLog(level: LogLevel, message: string, data?: LogData): LogEntry {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            ...(data && { data }),
        };
    }

    private log(level: LogLevel, message: string, data?: LogData): void {
        if (!this.shouldLog(level)) return;

        const logEntry = this.formatLog(level, message, data);
        const consoleMethod = level === 'debug' ? 'log' : level;

        if (this.isDevelopment) {
            console[consoleMethod](
                `[${logEntry.timestamp}] [${level.toUpperCase()}] ${message}`,
                data || ''
            );
        } else {
            // In production, you might want to send logs to a service
            console[consoleMethod](JSON.stringify(logEntry));
        }

        // TODO: Send critical errors to error tracking service (e.g., Sentry)
        if (level === 'error') {
            // Example: sendToErrorTracking(logEntry);
        }
    }

    debug(message: string, data?: LogData): void {
        this.log('debug', message, data);
    }

    info(message: string, data?: LogData): void {
        this.log('info', message, data);
    }

    warn(message: string, data?: LogData): void {
        this.log('warn', message, data);
    }

    error(message: string, data?: LogData): void {
        this.log('error', message, data);
    }

    /**
     * Create a logger with context (useful for adding consistent metadata)
     */
    createChild(context: Record<string, unknown>): Logger {
        const childLogger = new Logger();
        const originalLog = childLogger.log.bind(childLogger);

        childLogger.log = (level: LogLevel, message: string, data?: LogData) => {
            const contextData = typeof data === 'object' && data !== null
                ? { ...context, ...data as Record<string, unknown> }
                : { ...context, data };
            originalLog(level, message, contextData);
        };

        return childLogger;
    }

    /**
     * Log performance metrics
     */
    performance(operation: string, duration: number, data?: LogData): void {
        const perfData = typeof data === 'object' && data !== null
            ? { duration: `${duration}ms`, operation, ...data as Record<string, unknown> }
            : { duration: `${duration}ms`, operation, additionalData: data };

        this.info(`Performance: ${operation}`, perfData);
    }

    /**
     * Log API requests/responses
     */
    apiCall(method: string, url: string, status?: number, duration?: number, data?: LogData): void {
        const apiData = typeof data === 'object' && data !== null
            ? { method, url, status, duration: duration ? `${duration}ms` : undefined, ...data as Record<string, unknown> }
            : { method, url, status, duration: duration ? `${duration}ms` : undefined, additionalData: data };

        this.info(`API: ${method} ${url}`, apiData);
    }
}

export const logger = new Logger();
