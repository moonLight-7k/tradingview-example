type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    data?: any;
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

    private formatLog(level: LogLevel, message: string, data?: any): LogEntry {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            ...(data && { data }),
        };
    }

    private log(level: LogLevel, message: string, data?: any): void {
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

    debug(message: string, data?: any): void {
        this.log('debug', message, data);
    }

    info(message: string, data?: any): void {
        this.log('info', message, data);
    }

    warn(message: string, data?: any): void {
        this.log('warn', message, data);
    }

    error(message: string, data?: any): void {
        this.log('error', message, data);
    }
}

export const logger = new Logger();
