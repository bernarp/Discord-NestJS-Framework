import {LoggerService} from '@nestjs/common';
import {LogLevel} from '../enums/LogLevel.js';
import {ILogEntry, ILogContext} from './ILogEntry.js';

/**
 * @interface ILogContextResolver
 * @description Abstraction for determining contextual information about the logger's call site.
 * Provides information about the file, line, and method by analyzing the call stack.
 */
export interface ILogContextResolver {
    /**
     * Determines the logger call context based on the call stack.
     * @param {number} stackDepth - Stack depth for analysis (defaults to auto-detection).
     * @returns {ILogContext} Contextual information about the call site.
     */
    resolveContext(stackDepth?: number): ILogContext;

    /**
     * Clears the context information cache (if caching is used).
     * @returns {void}
     */
    clearCache(): void;
}

/**
 * @interface ILogFormatter
 * @description Abstraction for formatting log messages.
 * Responsible for converting log entries into various output formats.
 */
export interface ILogFormatter {
    /**
     * Formats a log entry for console output in the NestJS style.
     * @param {ILogEntry} logEntry - Log entry to format.
     * @returns {string} Formatted message for the console.
     */
    formatForConsole(logEntry: ILogEntry): string;

    /**
     * Formats a log entry as JSON for writing to a file.
     * @param {ILogEntry} logEntry - Log entry to format.
     * @returns {string} JSON representation of the log entry.
     */
    formatForFile(logEntry: ILogEntry): string;

    /**
     * Formats a timestamp according to NestJS requirements.
     * @param {Date} timestamp - Timestamp to format.
     * @returns {string} Formatted timestamp.
     */
    formatTimestamp(timestamp: Date): string;
}

/**
 * @interface ICustomLogger
 * @description Main contract for the custom logger, extending NestJS LoggerService functionality.
 * Provides all necessary logging methods with additional capabilities for context determination and file logging.
 */
export interface ILogger extends LoggerService {
    /**
     * Writes an informational message.
     * @param {string} message - Message to log.
     * @param {string} [context] - Message context or category.
     * @returns {void}
     */
    inf(message: string, context?: string): void;

    /**
     * Writes an error message.
     * @param {string} message - Error message.
     * @param {Error | string} [trace] - Error stack or additional information.
     * @param {string} [context] - Error context or category.
     * @returns {void}
     */
    err(message: string, trace?: Error | string, context?: string): void;

    /**
     * Writes a debug message.
     * @param {string} message - Debug message.
     * @param {string} [context] - Message context or category.
     * @returns {void}
     */
    debug(message: string, context?: string): void;

    /**
     * Writes an HTTP request or response message.
     * @param {string} message - HTTP operation message.
     * @param {string} [context] - Message context or category.
     * @returns {void}
     */
    http(message: string, context?: string): void;

    /**
     * Writes a fatal error message.
     * @param {string} message - Fatal error message.
     * @param {Error | string} [trace] - Error stack or additional information.
     * @param {string} [context] - Error context or category.
     * @returns {void}
     */
    fatalError(message: string, trace?: Error | string, context?: string): void;

    /**
     * Generic logging method with a specified level.
     * @param {LogLevel} level - Logging level.
     * @param {string} message - Message to log.
     * @param {string} [context] - Message context or category.
     * @param {Record<string, unknown>} [metadata] - Additional metadata.
     * @returns {void}
     */
    logWithLevel(level: LogLevel, message: string, context?: string, metadata?: Record<string, unknown>): void;

    /**
     * Forcefully writes all buffered logs to files.
     * @returns {Promise<void>} Promise that resolves after all buffered logs are written.
     */
    flush(): Promise<void>;

    /**
     * Sets the minimum logging level for filtering messages.
     * @param {LogLevel} level - Minimum level for log recordings.
     * @returns {void}
     */
    setLogLevel(level: LogLevel): void;

    /**
     * Returns the current minimum logging level.
     * @returns {LogLevel} Current minimum logging level.
     */
    getLogLevel(): LogLevel;

    /**
     * Performs a graceful shutdown of the logger.
     * Writes all buffered logs and releases resources.
     * @returns {Promise<void>} Promise that resolves after all operations are complete.
     */
    shutdown(): Promise<void>;
}
