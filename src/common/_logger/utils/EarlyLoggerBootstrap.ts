// src/core/_logger/utils/EarlyLoggerBootstrap.ts
import {ConfigService} from '@nestjs/config';
import {CustomLogger} from '../services/CustomLogger.js';
import {LogContextResolver} from '../services/LogContextResolver.js';
import {LogFormatter} from '../services/LogFormatter.js';
import {FileWriter} from '../services/FileWriter.js';
import {LOGGER_CONFIG} from '../constants/LoggerConfig.js';

/**
 * @function createEarlyLogger
 * @description Creates a logger instance for use during the bootstrap phase,
 * before the NestJS DI container is initialized.
 * @returns {Promise<CustomLogger>} Ready-to-use logger instance
 */
export async function createEarlyLogger(): Promise<CustomLogger> {
    const configService = new ConfigService();
    const startupTimestamp = new Date();
    const contextResolver = new LogContextResolver();
    const formatter = new LogFormatter();
    const fileWriter = new FileWriter(configService, startupTimestamp, formatter);
    await fileWriter.initialize();
    const logger = new CustomLogger(contextResolver, formatter, fileWriter, configService, undefined);
    return logger;
}

/**
 * @function createEarlyLoggerOrFallback
 * @description Creates an early logger, and returns a basic console logger in case of an error.
 * @returns {Promise<CustomLogger | Console>} Logger or console in case of an error
 */
export async function createEarlyLoggerOrFallback(): Promise<CustomLogger | Console> {
    try {
        return await createEarlyLogger();
    } catch (error) {
        console.error('Failed to initialize early logger, falling back to console:', error);
        return console;
    }
}
