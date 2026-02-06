import {LogLevel} from '../enums/LogLevel.js';

/**
 * @interface ILogContext
 * @description Contextual information about the logging call site.
 * Contains data about the file, line, and method from which the logger was called.
 */
export interface ILogContext {
    /**
     * Full path to the file from which the call was made
     */
    readonly filePath: string;

    /**
     * Relative path to the file from the project root
     */
    readonly relativeFilePath: string;

    /**
     * Line number in the file
     */
    readonly lineNumber: number;

    /**
     * Name of the method or function (if known)
     */
    readonly methodName?: string;

    /**
     * Name of the class (if applicable)
     */
    readonly className?: string;
}

/**
 * @interface ILogEntry
 * @description Log entry structure containing all necessary information for logging.
 * Used for both console output and JSON file recording.
 */
export interface ILogEntry {
    /**
     * Timestamp of the log entry creation
     */
    readonly timestamp: Date;

    /**
     * Logging level
     */
    readonly level: LogLevel;

    /**
     * Main log message
     */
    readonly message: string;

    /**
     * Contextual information about the call site
     */
    readonly context: ILogContext;

    /**
     * Additional metadata (optional)
     */
    readonly metadata?: Record<string, unknown>;

    /**
     * Process identifier
     */
    readonly processId: number;

    /**
     * Category or module to which the log belongs
     */
    readonly category?: string;

    /**
     * Correlation identifier for end-to-end tracing
     */
    readonly correlationId?: string;
}

/**
 * @interface IFormattedLogOutput
 * @description Result of log formatting for various output channels.
 * Contains formatted versions for the console and JSON file.
 */
export interface IFormattedLogOutput {
    /**
     * Formatted message for NestJS-style console output
     */
    readonly consoleOutput: string;

    /**
     * JSON representation of the log for file recording
     */
    readonly jsonOutput: string;

    /**
     * Determines if the entry should be written to the error file
     */
    readonly isError: boolean;
}
