import {Injectable, Inject} from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'yaml';
import type {IConfigFileReader} from '../interfaces/file-reader.interface.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';
import {ConfigContext} from '../constants/config.constants.js';

/**
 * Service responsible for reading and parsing configuration files from the file system.
 * Currently supports YAML format.
 */
@Injectable()
export class ConfigFileReader implements IConfigFileReader {
    constructor(@Inject(LOG.LOGGER) private readonly _logger: ILogger) {}

    /**
     * Reads a YAML file from the specified directory and parses its content.
     * If the file does not exist, returns an empty object.
     *
     * @param directory - The relative directory path (e.g. ./config_df).
     * @param key - The configuration key (filename without extension).
     * @returns {Promise<Record<string, any>>} Parsed object or empty object.
     */
    public async read(directory: string, key: string): Promise<Record<string, any>> {
        const filePath = path.join(process.cwd(), directory, `${key}.yaml`);
        try {
            const content = await fs.readFile(filePath, 'utf8');
            return yaml.parse(content) ?? {};
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                this._logger.debug(`Config file not found (skipping): ${filePath}`, ConfigContext.LOADER);
                return {};
            }
            this._logger.warn(`Failed to parse YAML file at ${filePath}: ${error.message}`, ConfigContext.LOADER);
            return {};
        }
    }
}
