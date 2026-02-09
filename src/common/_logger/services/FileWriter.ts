import {Injectable, OnModuleDestroy, OnModuleInit, Inject} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as IFileWriter from '../interfaces/IFileWriter.js';
import {ILogEntry} from '../interfaces/ILogEntry.js';
import * as ICustomLogger from '../interfaces/ICustomLogger.js';
import {LOG, LOGGER_CONFIG, isErrorLevel} from '../constants/LoggerConfig.js';
import {Subject} from 'rxjs';

@Injectable()
export class FileWriter implements IFileWriter.IFileWriter, OnModuleInit, OnModuleDestroy {
    private _logDirectory!: string;
    private _logsFilePath!: string;
    private _errorsFilePath!: string;
    private _options!: IFileWriter.IFileWriterOptions;
    public readonly logWritten$ = new Subject<ILogEntry>();

    private readonly _buffer: ILogEntry[] = [];
    private _flushTimer?: NodeJS.Timeout;
    private _isInitialized = false;
    private _initializationPromise: Promise<void> | null = null;

    constructor(
        private readonly _configService: ConfigService,
        @Inject(LOG.STARTUP_TIMESTAMP)
        private readonly _startupTimestamp: Date,
        @Inject(LOG.LOG_FORMATTER)
        private readonly _formatter: ICustomLogger.ILogFormatter
    ) {}

    async onModuleInit(): Promise<void> {
        await this.initialize();
    }

    async onModuleDestroy(): Promise<void> {
        await this.dispose();
    }

    public initialize(): Promise<void> {
        if (this._initializationPromise) {
            return this._initializationPromise;
        }

        this._initializationPromise = (async () => {
            if (process.env.APP_CLI_MODE === 'true') {
                this._isInitialized = true;
                return;
            }
            if (this._isInitialized) {
                return;
            }
            try {
                const logsPath = this._configService.get<string>('LOGS_PATH');

                this._options = {
                    baseLogsPath: logsPath || LOGGER_CONFIG.PATHS.BASE_LOGS_DIR,
                    startupTimestamp: this._startupTimestamp,
                    maxFileSize: this._configService.get<number>('LOG_MAX_FILE_SIZE') || LOGGER_CONFIG.PERFORMANCE.MAX_FILE_SIZE,
                    enableBuffering: this._configService.get<boolean>('LOG_ENABLE_BUFFERING') ?? LOGGER_CONFIG.DEFAULTS.ENABLE_BUFFERING,
                    bufferSize: this._configService.get<number>('LOG_BUFFER_SIZE') || LOGGER_CONFIG.PERFORMANCE.DEFAULT_BUFFER_SIZE
                };

                this._logDirectory = this._buildLogDirectory();
                this._logsFilePath = path.join(this._logDirectory, LOGGER_CONFIG.PATHS.LOGS_FILE_NAME);
                this._errorsFilePath = path.join(this._logDirectory, LOGGER_CONFIG.PATHS.ERRORS_FILE_NAME);

                await this._ensureDirectoryExists(this._logDirectory);
                await this._createLogFiles();
                this._setupPeriodicFlush();

                this._isInitialized = true;
            } catch (error) {
                const errorMessage = `Failed to initialize file writer: ${error instanceof Error ? error.message : String(error)}`;
                console.error(errorMessage);
                this._initializationPromise = null;
                throw new Error(errorMessage);
            }
        })();

        return this._initializationPromise;
    }

    public async writeLogEntry(logEntry: ILogEntry): Promise<void> {
        await this.initialize();

        if (this._shouldBuffer()) {
            this._buffer.push(logEntry);
            if (this._buffer.length >= (this._options.bufferSize || LOGGER_CONFIG.PERFORMANCE.DEFAULT_BUFFER_SIZE)) {
                await this.flush();
            }
            return;
        }

        await this._writeLogEntryToFile(logEntry);
    }

    public async writeLogEntries(logEntries: ILogEntry[]): Promise<void> {
        await this.initialize();

        const regularLogs: ILogEntry[] = [];
        const errorLogs: ILogEntry[] = [];

        for (const entry of logEntries) {
            if (isErrorLevel(entry.level)) {
                errorLogs.push(entry);
            } else {
                regularLogs.push(entry);
            }
        }

        const writePromises: Promise<void>[] = [];

        if (regularLogs.length > 0) {
            writePromises.push(this._writeBatchToFile(regularLogs, this._logsFilePath));
        }

        if (errorLogs.length > 0) {
            writePromises.push(this._writeBatchToFile(errorLogs, this._errorsFilePath));
        }

        await Promise.all(writePromises);
        for (const entry of logEntries) {
            this.logWritten$.next(entry);
        }
    }

    public getLogDirectory(): string {
        return this._logDirectory;
    }

    public getLogsFilePath(): string {
        return this._logsFilePath;
    }

    public getErrorsFilePath(): string {
        return this._errorsFilePath;
    }

    public async dispose(): Promise<void> {
        if (this._flushTimer) {
            clearInterval(this._flushTimer);
            this._flushTimer = undefined;
        }
        await this.flush();
        this.logWritten$.complete();
    }

    public async flush(): Promise<void> {
        if (this._buffer.length === 0) {
            return;
        }
        await this._flushBuffer();
    }

    private _buildLogDirectory(): string {
        const timestamp = this._options.startupTimestamp;
        const year = timestamp.getFullYear();
        const month = String(timestamp.getMonth() + 1).padStart(2, '0');
        const day = String(timestamp.getDate()).padStart(2, '0');
        const hours = String(timestamp.getHours()).padStart(2, '0');
        const minutes = String(timestamp.getMinutes()).padStart(2, '0');
        const seconds = String(timestamp.getSeconds()).padStart(2, '0');

        const directoryName = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
        return path.resolve(this._options.baseLogsPath, directoryName);
    }

    private async _ensureDirectoryExists(dirPath: string): Promise<void> {
        try {
            await fs.access(dirPath);
        } catch {
            await fs.mkdir(dirPath, {recursive: true});
        }
    }

    private async _createLogFiles(): Promise<void> {
        const filesToCreate = [this._logsFilePath, this._errorsFilePath];
        for (const filePath of filesToCreate) {
            try {
                await fs.access(filePath);
            } catch {
                await fs.writeFile(filePath, '', {
                    encoding: LOGGER_CONFIG.SYSTEM.FILE_ENCODING
                });
            }
        }
    }

    /**
     * Writes a single log entry to the file (JSON Lines format)
     */
    private async _writeLogEntryToFile(logEntry: ILogEntry): Promise<void> {
        try {
            const jsonContent = this._formatter.formatForFile(logEntry);
            const contentWithNewline = jsonContent + '\n';

            const targetFile = isErrorLevel(logEntry.level) ? this._errorsFilePath : this._logsFilePath;

            await fs.appendFile(targetFile, contentWithNewline, {
                encoding: LOGGER_CONFIG.SYSTEM.FILE_ENCODING
            });
            this.logWritten$.next(logEntry);
        } catch (error) {
            console.error(`Failed to write log entry to file: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Writes a batch of logs to the file in an optimized way
     */
    private async _writeBatchToFile(logEntries: ILogEntry[], filePath: string): Promise<void> {
        try {
            const jsonLines = logEntries.map(entry => this._formatter.formatForFile(entry)).join('\n') + '\n';

            await fs.appendFile(filePath, jsonLines, {
                encoding: LOGGER_CONFIG.SYSTEM.FILE_ENCODING
            });
        } catch (error) {
            console.error(`Failed to write batch to file: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private _shouldBuffer(): boolean {
        return this._options.enableBuffering === true;
    }

    private async _flushBuffer(): Promise<void> {
        if (this._buffer.length === 0) {
            return;
        }
        const entriesToFlush = [...this._buffer];
        this._buffer.length = 0;
        await this.writeLogEntries(entriesToFlush);
    }

    private _setupPeriodicFlush(): void {
        if (!this._options.enableBuffering) {
            return;
        }
        this._flushTimer = setInterval(() => {
            this._flushBuffer().catch(error => {
                console.error(`Failed to flush log buffer: ${error instanceof Error ? error.message : String(error)}`);
            });
        }, LOGGER_CONFIG.PERFORMANCE.FLUSH_INTERVAL_MS);
    }
}
