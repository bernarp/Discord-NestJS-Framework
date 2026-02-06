/**
 * @enum LogLevel
 * @description Enumeration of logging levels with corresponding priorities.
 * Defines the hierarchy of message importance and is used for log filtering and routing.
 */
export enum LogLevel {
    /**
     * Debug information for developers
     */
    DEBUG = 'DEBUG',

    /**
     * HTTP requests and responses
     */
    HTTP = 'HTTP',

    /**
     * Informational messages about normal system operation
     */
    INFO = 'INFO',

    /**
     * Errors that do not stop the application
     */
    ERROR = 'ERROR',

    /**
     * Critical errors that can stop the application
     */
    FATAL_ERROR = 'FATAL_ERROR',
    WARN = 'WARN'
}

/**
 * @constant LOG_LEVEL_PRIORITY
 * @description Priorities of logging levels to determine message importance.
 * Used for filtering and sorting logs by criticality.
 */
export const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.HTTP]: 1,
    [LogLevel.INFO]: 2,
    [LogLevel.WARN]: 3,
    [LogLevel.ERROR]: 4,
    [LogLevel.FATAL_ERROR]: 5
};

/**
 * @constant ERROR_LEVELS
 * @description Set of levels that are considered errors and should be written to errors.json.
 * Used to determine log routing to the appropriate files.
 */
export const ERROR_LEVELS: Set<LogLevel> = new Set([LogLevel.ERROR, LogLevel.FATAL_ERROR]);
