import {Injectable, LoggerService, OnModuleDestroy, Inject, Optional} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import * as ICustomLogger from '../interfaces/ICustomLogger.js';
import * as IFileWriter from '../interfaces/IFileWriter.js';
import {LogLevel} from '../enums/LogLevel.js';
import {ILogEntry} from '../interfaces/ILogEntry.js';
import {LOG, LOGGER_CONFIG, shouldLogAtLevel} from '../constants/LoggerConfig.js';
import {RequestContextService} from '@common/_request-context/services/RequestContext.service.js';

@Injectable()
export class CustomLogger implements ICustomLogger.ILogger, LoggerService, OnModuleDestroy {
    private _currentLogLevel: LogLevel;

    constructor(
        @Inject(LOG.CONTEXT_RESOLVER)
        private readonly _contextResolver: ICustomLogger.ILogContextResolver,
        @Inject(LOG.LOG_FORMATTER)
        private readonly _formatter: ICustomLogger.ILogFormatter,
        @Inject(LOG.FILE_WRITER)
        private readonly _fileWriter: IFileWriter.IFileWriter,
        private readonly _configService: ConfigService,
        @Optional()
        private readonly _requestContextService?: RequestContextService
    ) {
        const logLevelFromEnv = this._configService.get<string>('LOG_LEVEL');
        this._currentLogLevel = this._parseLogLevel(logLevelFromEnv, LOGGER_CONFIG.DEFAULTS.LOG_LEVEL);
    }

    public async onModuleDestroy(): Promise<void> {
        await this.shutdown();
    }

    public log(message: any, context?: string): void {
        this.inf(String(message), context);
    }

    /**
     * @public
     * @description Implementation of the `error` method from the `LoggerService` interface.
     * Delegates the call to our internal `err` method.
     * @param message - The error message.
     * @param trace - The call stack (can be a string).
     * @param context - The context.
     */
    public error(message: any, trace?: string, context?: string): void {
        this.err(String(message), trace, context);
    }

    public err(message: any, trace?: Error | string, context?: string): void {
        const metadata = trace ? {trace: this._extractErrorInfo(trace)} : undefined;
        this.logWithLevel(LogLevel.ERROR, String(message), context, metadata);
    }

    public warn(message: any, context?: string): void {
        this.logWithLevel(LogLevel.WARN, String(message), context);
    }

    public debug(message: any, context?: string): void {
        this.logWithLevel(LogLevel.DEBUG, String(message), context);
    }

    public verbose(message: any, context?: string): void {
        this.debug(String(message), context);
    }

    public inf(message: string, context?: string): void {
        this.logWithLevel(LogLevel.INFO, message, context);
    }

    public http(message: string, context?: string): void {
        this.logWithLevel(LogLevel.HTTP, message, context);
    }

    public fatalError(message: string, trace?: Error | string, context?: string): void {
        const metadata = trace ? {trace: this._extractErrorInfo(trace)} : undefined;
        this.logWithLevel(LogLevel.FATAL_ERROR, message, context, metadata);
    }

    public logWithLevel(level: LogLevel, message: string, context?: string, metadata?: Record<string, unknown>): void {
        if (!shouldLogAtLevel(level, this._currentLogLevel)) {
            return;
        }

        const logEntry = this._createLogEntry(level, message, context, metadata);

        this._outputToConsole(logEntry);
        this._writeToFile(logEntry);
    }

    public async flush(): Promise<void> {
        try {
            await this._fileWriter.flush();
        } catch (error) {
            console.error(`Failed to flush logs: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    public setLogLevel(level: LogLevel): void {
        this._currentLogLevel = level;
    }

    public getLogLevel(): LogLevel {
        return this._currentLogLevel;
    }

    public async shutdown(): Promise<void> {
        try {
            await this.flush();
            await this._fileWriter.dispose();
            this._contextResolver.clearCache();
        } catch (error) {
            console.error(`Failed to shutdown logger: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private _createLogEntry(level: LogLevel, message: string, context?: string, metadata?: Record<string, unknown>): ILogEntry {
        return {
            timestamp: new Date(),
            level,
            message,
            context: this._contextResolver.resolveContext(),
            metadata,
            processId: process.pid,
            category: context,
            correlationId: this._requestContextService?.getCorrelationId()
        };
    }

    private _outputToConsole(logEntry: ILogEntry): void {
        if (!LOGGER_CONFIG.DEFAULTS.ENABLE_CONSOLE_OUTPUT) {
            return;
        }

        try {
            const formattedMessage = this._formatter.formatForConsole(logEntry);
            console.log(formattedMessage);
        } catch (error) {
            console.log(`${logEntry.level}: ${logEntry.message}`);
        }
    }

    private _writeToFile(logEntry: ILogEntry): void {
        if (!LOGGER_CONFIG.DEFAULTS.ENABLE_FILE_OUTPUT) {
            return;
        }

        this._fileWriter.writeLogEntry(logEntry).catch(error => {
            console.error(`Failed to write log to file: ${error instanceof Error ? error.message : String(error)}`);
        });
    }

    private _extractErrorInfo(error: Error | string): string {
        if (typeof error === 'string') {
            return error;
        }

        return `${error.name}: ${error.message}${error.stack ? '\n' + error.stack : ''}`;
    }

    private _parseLogLevel(level: string | undefined, defaultLevel: LogLevel): LogLevel {
        if (!level) {
            return defaultLevel;
        }
        const upperLevel = level.toUpperCase();
        if (Object.values(LogLevel).includes(upperLevel as LogLevel)) {
            return upperLevel as LogLevel;
        }
        return defaultLevel;
    }
}
