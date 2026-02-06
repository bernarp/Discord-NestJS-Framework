import {LogLevel} from '../enums/LogLevel.js';
import path from 'path';

/**
 * @constant LOGGER_CONFIG
 * @description Core configuration constants for the logging system.
 * Contains settings for paths, formats, and logger behavior.
 */
export const LOGGER_CONFIG = {
    /**
     * Base paths for log files
     */
    PATHS: {
        BASE_LOGS_DIR: './logs',
        LOGS_FILE_NAME: 'logs.json',
        ERRORS_FILE_NAME: 'errors.json'
    } as const,

    /**
     * Time formats, methods, and messages
     */
    FORMATS: {
        TIMESTAMP_FORMAT: 'M/d/yyyy, h:mm:ss a',
        CONSOLE_MESSAGE_TEMPLATE: '[Nest] -- {timestamp}  {level}  [{context}] {message}',
        DIRECTORY_TIMESTAMP_FORMAT: 'yyyy-MM-dd_HH-mm-ss',
        MSK_TIMEZONE_OFFSET: 3 // MSK
    } as const,

    /**
     * Performance settings
     */
    PERFORMANCE: {
        DEFAULT_BUFFER_SIZE: 100,
        MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
        FLUSH_INTERVAL_MS: 2500, // 2.5 seconds
        STACK_TRACE_DEPTH: 10
    } as const,

    /**
     * Default settings
     */
    DEFAULTS: {
        LOG_LEVEL: LogLevel.INFO,
        ENABLE_CONSOLE_OUTPUT: true,
        ENABLE_FILE_OUTPUT: true,
        ENABLE_BUFFERING: true,
        CONTEXT_UNKNOWN: 'Unknown',
        ENABLE_COLORS: true
    } as const,

    /**
     * System constants
     */
    SYSTEM: {
        LOGGER_PREFIX: '[discord-bot]',
        STACK_TRACE_CALLER_DEPTH: 4,
        FILE_ENCODING: 'utf8' as const,
        JSON_INDENT: 2
    } as const,

    /**
     * ANSI color codes for the terminal
     */
    COLORS: {
        // Main colors
        RESET: '\x1b[0m',
        BRIGHT: '\x1b[1m',
        DIM: '\x1b[2m',

        // Text colors
        BLACK: '\x1b[30m',
        RED: '\x1b[31m',
        GREEN: '\x1b[32m',
        YELLOW: '\x1b[33m',
        BLUE: '\x1b[34m',
        MAGENTA: '\x1b[35m',
        CYAN: '\x1b[36m',
        WHITE: '\x1b[37m',

        // Bright colors
        BRIGHT_RED: '\x1b[91m',
        BRIGHT_GREEN: '\x1b[92m',
        BRIGHT_YELLOW: '\x1b[93m',
        BRIGHT_BLUE: '\x1b[94m',
        BRIGHT_MAGENTA: '\x1b[95m',
        BRIGHT_CYAN: '\x1b[96m',
        BRIGHT_WHITE: '\x1b[97m'
    } as const,

    /**
     * Mapping of log levels to colors
     */
    LEVEL_COLORS: {
        [LogLevel.DEBUG]: '\x1b[36m',
        [LogLevel.HTTP]: '\x1b[35m',
        [LogLevel.INFO]: '\x1b[32m',
        [LogLevel.WARN]: '\x1b[33m', // Yellow
        [LogLevel.ERROR]: '\x1b[31m',
        [LogLevel.FATAL_ERROR]: '\x1b[91m'
    } as const
} as const;

/**
 * @constant DI_TOKENS
 * @description Tokens for the Dependency Injection logging system.
 * Used for registering and retrieving dependencies in the NestJS container.
 */
export const LOG = {
    /**
     * Token for the main logger interface
     */
    LOGGER: 'ILogger',

    /**
     * Token for the file writer
     */
    FILE_WRITER: 'IFileWriter',

    /**
     * Token for the context resolver
     */
    CONTEXT_RESOLVER: 'ILogContextResolver',

    /**
     * Token for the log formatter
     */
    LOG_FORMATTER: 'ILogFormatter',

    /**
     * Token for file writer options
     */
    FILE_WRITER_OPTIONS: 'IFileWriterOptions',

    /**
     * Token for application startup time (Date)
     * Provides a single source of time for all services.
     */
    STARTUP_TIMESTAMP: 'StartupTimestamp'
} as const;

/**
 * @function createLogDirectoryName
 * @description Creates a log directory name based on the startup timestamp.
 * @param {Date} startupTime - Application startup time.
 * @returns {string} Formatted directory name.
 */
export function createLogDirectoryName(startupTime: Date): string {
    const year = startupTime.getFullYear();
    const month = String(startupTime.getMonth() + 1).padStart(2, '0');
    const day = String(startupTime.getDate()).padStart(2, '0');
    const hours = String(startupTime.getHours()).padStart(2, '0');
    const minutes = String(startupTime.getMinutes()).padStart(2, '0');
    const seconds = String(startupTime.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

/**
 * @function getFullLogPath
 * @description Returns the full path to the log directory for a specific run.
 * @param {Date} startupTime - Application startup time.
 * @returns {string} Absolute path to the log directory.
 */
export function getFullLogPath(startupTime: Date): string {
    const directoryName = createLogDirectoryName(startupTime);
    return path.resolve(LOGGER_CONFIG.PATHS.BASE_LOGS_DIR, directoryName);
}

/**
 * @function isErrorLevel
 * @description Checks if the log level represents an error.
 * @param {LogLevel} level - Log level to check.
 * @returns {boolean} true if the level is an error.
 */
export function isErrorLevel(level: LogLevel): boolean {
    return level === LogLevel.ERROR || level === LogLevel.FATAL_ERROR;
}

/**
 * @function shouldLogAtLevel
 * @description Determines if a message should be logged based on the minimum level.
 * @param {LogLevel} messageLevel - Message level.
 * @param {LogLevel} minimumLevel - Minimum logging level.
 * @returns {boolean} true if the message should be logged.
 */
export function shouldLogAtLevel(messageLevel: LogLevel, minimumLevel: LogLevel): boolean {
    const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
        [LogLevel.DEBUG]: 0,
        [LogLevel.HTTP]: 1,
        [LogLevel.INFO]: 2,
        [LogLevel.WARN]: 3,
        [LogLevel.ERROR]: 4,
        [LogLevel.FATAL_ERROR]: 5
    };

    return LOG_LEVEL_PRIORITY[messageLevel] >= LOG_LEVEL_PRIORITY[minimumLevel];
}

/**
 * @function convertToMoscowTime
 * @description Converts time to Moscow time (UTC+3).
 * @param {Date} date - Source date for conversion.
 * @returns {Date} Date adjusted to Moscow time.
 */
export function convertToMoscowTime(date: Date): Date {
    const mskOffset = LOGGER_CONFIG.FORMATS.MSK_TIMEZONE_OFFSET * 60; // In minutes
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    return new Date(utc + mskOffset * 60000);
}

/**
 * @function isColorOutputSupported
 * @description Checks if the terminal supports color output.
 * @returns {boolean} true if color output is supported.
 */
export function isColorOutputSupported(): boolean {
    return !!(
        process.stdout.isTTY &&
        (process.env.COLORTERM || process.env.TERM === 'xterm' || process.env.TERM === 'xterm-256color' || process.env.TERM?.includes('color'))
    );
}
