import { SetMetadata } from '@nestjs/common';

export const LOG_METHOD_KEY = 'LOG_METHOD_KEY';

/**
 * Logging level enumeration.
 */
export enum LogLevel {
    LOG = 'log',
    DEBUG = 'debug',
    WARN = 'warn',
    ERROR = 'error'
}

/**
 * Options for the method logging decorator.
 */
export interface LogMethodOptions {
    /** Whether to log incoming arguments. */
    logInput?: boolean;
    /** Whether to log the execution result. */
    logResult?: boolean;
    /** Action description for logs */
    description?: string;
    /** Logging level */
    level?: LogLevel;
}

/**
 * Decorator for automatic method call logging.
 * Defaults to 'debug' level.
 *
 * @param options Logging settings.
 */
export const LogMethod = (options: LogMethodOptions = {}) =>
    SetMetadata(LOG_METHOD_KEY, {
        level: LogLevel.DEBUG,
        logInput: true,
        logResult: true,
        ...options
    });
