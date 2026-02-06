import {Subject} from 'rxjs';
import {ILogEntry} from './ILogEntry.js';

/**
 * @interface IFileWriter
 * @description Abstraction for writing logs to the file system.
 */
export interface IFileWriter {
    readonly logWritten$: Subject<ILogEntry>;

    initialize(): Promise<void>;
    writeLogEntry(logEntry: ILogEntry): Promise<void>;
    writeLogEntries(logEntries: ILogEntry[]): Promise<void>;
    getLogDirectory(): string;
    getLogsFilePath(): string;
    getErrorsFilePath(): string;
    dispose(): Promise<void>;

    /**
     * Forcefully writes all buffered logs to the file.
     * @returns {Promise<void>} Promise that resolves after all buffered logs are written.
     */
    flush(): Promise<void>;
}

/**
 * @interface IFileWriterOptions
 * @description Configuration options for the log file writer.
 */
export interface IFileWriterOptions {
    readonly baseLogsPath: string;
    readonly startupTimestamp: Date;
    readonly maxFileSize?: number;
    readonly enableBuffering?: boolean;
    readonly bufferSize?: number;
}
