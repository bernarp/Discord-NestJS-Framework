import { LoggerService } from '@nestjs/common';
import { LogLevel } from '../enums/LogLevel.js';
import { ILogEntry, ILogContext } from './ILogEntry.js';

/**
 * @interface ILogContextResolver
 * @description Абстракция для определения контекстной информации о месте вызова логгера.
 * Обеспечивает получение информации о файле, строке и методе через анализ стека вызовов.
 */
export interface ILogContextResolver {
    /**
     * Определяет контекст вызова логгера на основе стека вызовов.
     * @param {number} stackDepth - Глубина стека для анализа (по умолчанию используется автоопределение).
     * @returns {ILogContext} Контекстная информация о месте вызова.
     */
    resolveContext(stackDepth?: number): ILogContext;

    /**
     * Очищает кеш контекстной информации (если используется кеширование).
     * @returns {void}
     */
    clearCache(): void;
}

/**
 * @interface ILogFormatter
 * @description Абстракция для форматирования сообщений логов.
 * Отвечает за преобразование записей логов в различные выходные форматы.
 */
export interface ILogFormatter {
    /**
     * Форматирует запись лога для консольного вывода в стиле NestJS.
     * @param {ILogEntry} logEntry - Запись лога для форматирования.
     * @returns {string} Отформатированное сообщение для консоли.
     */
    formatForConsole(logEntry: ILogEntry): string;

    /**
     * Форматирует запись лога в JSON для записи в файл.
     * @param {ILogEntry} logEntry - Запись лога для форматирования.
     * @returns {string} JSON представление записи лога.
     */
    formatForFile(logEntry: ILogEntry): string;

    /**
     * Форматирует временную метку в соответствии с требованиями NestJS.
     * @param {Date} timestamp - Временная метка для форматирования.
     * @returns {string} Отформатированная временная метка.
     */
    formatTimestamp(timestamp: Date): string;
}

/**
 * @interface ICustomLogger
 * @description Основной контракт кастомного логгера, расширяющий функциональность NestJS LoggerService.
 * Обеспечивает все необходимые методы для логирования с дополнительными возможностями
 * по определению контекста и записи в файлы.
 */
export interface ILogger extends LoggerService {
    /**
     * Записывает информационное сообщение.
     * @param {string} message - Сообщение для логирования.
     * @param {string} [context] - Контекст или категория сообщения.
     * @returns {void}
     */
    inf(message: string, context?: string): void;

    /**
     * Записывает сообщение об ошибке.
     * @param {string} message - Сообщение об ошибке.
     * @param {Error | string} [trace] - Стек ошибки или дополнительная информация.
     * @param {string} [context] - Контекст или категория ошибки.
     * @returns {void}
     */
    err(message: string, trace?: Error | string, context?: string): void;

    /**
     * Записывает отладочное сообщение.
     * @param {string} message - Отладочное сообщение.
     * @param {string} [context] - Контекст или категория сообщения.
     * @returns {void}
     */
    debug(message: string, context?: string): void;

    /**
     * Записывает сообщение о HTTP запросе или ответе.
     * @param {string} message - Сообщение о HTTP операции.
     * @param {string} [context] - Контекст или категория сообщения.
     * @returns {void}
     */
    http(message: string, context?: string): void;

    /**
     * Записывает сообщение о критической ошибке.
     * @param {string} message - Сообщение о критической ошибке.
     * @param {Error | string} [trace] - Стек ошибки или дополнительная информация.
     * @param {string} [context] - Контекст или категория ошибки.
     * @returns {void}
     */
    fatalError(message: string, trace?: Error | string, context?: string): void;

    /**
     * Общий метод логирования с указанием уровня.
     * @param {LogLevel} level - Уровень логирования.
     * @param {string} message - Сообщение для логирования.
     * @param {string} [context] - Контекст или категория сообщения.
     * @param {Record<string, unknown>} [metadata] - Дополнительные метаданные.
     * @returns {void}
     */
    logWithLevel(level: LogLevel, message: string, context?: string, metadata?: Record<string, unknown>): void;

    /**
     * Принудительно записывает все буферизованные логи в файлы.
     * @returns {Promise<void>} Promise, который разрешается после записи всех буферизованных логов.
     */
    flush(): Promise<void>;

    /**
     * Устанавливает минимальный уровень логирования для фильтрации сообщений.
     * @param {LogLevel} level - Минимальный уровень для записи логов.
     * @returns {void}
     */
    setLogLevel(level: LogLevel): void;

    /**
     * Возвращает текущий минимальный уровень логирования.
     * @returns {LogLevel} Текущий минимальный уровень логирования.
     */
    getLogLevel(): LogLevel;

    /**
     * Выполняет корректное завершение работы логгера.
     * Записывает все буферизованные логи и освобождает ресурсы.
     * @returns {Promise<void>} Promise, который разрешается после завершения всех операций.
     */
    shutdown(): Promise<void>;
}
