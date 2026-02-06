import { Injectable } from '@nestjs/common';
import * as ICustomLogger from '../interfaces/ICustomLogger.js';
import { ILogEntry } from '../interfaces/ILogEntry.js';
import { LOGGER_CONFIG, convertToMoscowTime, isColorOutputSupported, isErrorLevel } from '../constants/LoggerConfig.js';

// Interface for the JSON log structure
interface IJsonLogEntry {
    timestamp: string;
    level: string;
    message: string;
    correlationId?: string;
    processId: number;
    category?: string;
    context: {
        filePath: string;
        relativeFilePath: string;
        lineNumber: number;
        methodName?: string;
        className?: string;
    };
    metadata?: Record<string, unknown>;
}

@Injectable()
export class LogFormatter implements ICustomLogger.ILogFormatter {
    private readonly _colorsEnabled: boolean;

    constructor() {
        this._colorsEnabled = LOGGER_CONFIG.DEFAULTS.ENABLE_COLORS && isColorOutputSupported();
    }

    public formatForConsole(logEntry: ILogEntry): string {
        const timestamp = this.formatTimestamp(logEntry.timestamp);
        const level = this._padLevel(logEntry.level);
        const context = this._formatContext(logEntry);
        const message = logEntry.message;
        const correlationIdStr = logEntry.correlationId ? ` | ${logEntry.correlationId.substring(0, 8)}` : '';
        const fullContext = `[${context}${correlationIdStr}]`;
        let baseMessage = `${LOGGER_CONFIG.SYSTEM.LOGGER_PREFIX} - ${timestamp}   ${level}   ${fullContext} ${message}`;
        if (logEntry.metadata && Object.keys(logEntry.metadata).length > 0) {
            const metadataStr = JSON.stringify(logEntry.metadata);
            baseMessage += ` ${metadataStr}`;
        }


        if (!this._colorsEnabled) {
            return baseMessage;
        }

        return this._applyColors(baseMessage, logEntry);
    }


    /**
     * Formats a log entry into a JSON string for file recording.
     */
    public formatForFile(logEntry: ILogEntry): string {
        const jsonEntry: IJsonLogEntry = {
            timestamp: logEntry.timestamp.toISOString(),
            level: logEntry.level,
            message: logEntry.message,
            processId: logEntry.processId,
            context: {
                filePath: logEntry.context.filePath,
                relativeFilePath: logEntry.context.relativeFilePath,
                lineNumber: logEntry.context.lineNumber,
                methodName: logEntry.context.methodName,
                className: logEntry.context.className
            }
        };

        if (logEntry.correlationId) {
            jsonEntry.correlationId = logEntry.correlationId;
        }

        if (logEntry.category) {
            jsonEntry.category = logEntry.category;
        }

        if (logEntry.metadata && Object.keys(logEntry.metadata).length > 0) {
            jsonEntry.metadata = logEntry.metadata;
        }

        if (!jsonEntry.context.methodName) {
            delete jsonEntry.context.methodName;
        }
        if (!jsonEntry.context.className) {
            delete jsonEntry.context.className;
        }

        try {
            return JSON.stringify(jsonEntry);
        } catch (error) {
            return JSON.stringify({
                timestamp: logEntry.timestamp.toISOString(),
                level: logEntry.level,
                message: logEntry.message,
                error: 'serialization_failed'
            });
        }
    }

    public formatTimestamp(timestamp: Date): string {
        const moscowTime = convertToMoscowTime(timestamp);
        return this._formatDateTimeToNestStyle(moscowTime);
    }

    private _applyColors(message: string, logEntry: ILogEntry): string {
        const { COLORS, LEVEL_COLORS } = LOGGER_CONFIG;
        const level = logEntry.level;

        if (isErrorLevel(level)) {
            return `${COLORS.BRIGHT_RED}${message}${COLORS.RESET}`;
        }

        const levelColor = LEVEL_COLORS[level] || COLORS.WHITE;
        const paddedLevel = this._padLevel(level);

        return message.replace(paddedLevel, `${levelColor}${paddedLevel}${COLORS.RESET}`);
    }

    private _formatDateTimeToNestStyle(date: Date): string {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();

        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;

        return `${month}/${day}/${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
    }

    private _padLevel(level: string): string {
        const maxLength = 11;
        return level.padEnd(maxLength);
    }

    private _formatContext(logEntry: ILogEntry): string {
        const { relativeFilePath, lineNumber, methodName, className } = logEntry.context;
        if (
            relativeFilePath.startsWith('node:internal') ||
            relativeFilePath.includes('task_queues') ||
            relativeFilePath.includes('timers.js') ||
            relativeFilePath.includes('process/task_queues')
        ) {
            if (logEntry.category) {
                return logEntry.category;
            }
            if (className && methodName) {
                return `${className}.${methodName}`;
            }
            if (methodName) {
                return methodName;
            }
            return 'AsyncCallback';
        }

        if (relativeFilePath === LOGGER_CONFIG.DEFAULTS.CONTEXT_UNKNOWN) {
            return logEntry.category || LOGGER_CONFIG.DEFAULTS.CONTEXT_UNKNOWN;
        }

        return `${relativeFilePath}:${lineNumber}`;
    }

}
