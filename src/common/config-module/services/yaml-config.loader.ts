import {Injectable, Inject} from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'yaml';
import lodash from 'lodash';
import {IConfigLoader} from '../interfaces/config-loader.interface.js';
import type {IConfigMetadata} from '../interfaces/config-options.interface.js';
import type {IConfigModuleOptions} from '../interfaces/config-module-options.interface.js';
import {CONFIG_DEFAULT_PATHS, ConfigContext} from '../constants/config.constants.js';
import {CONFIG_MODULE_OPTIONS_TOKEN} from '../config.token.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';
import {LogMethod, LogLevel} from '@/common/decorators/log-method.decorator.js';

const {merge} = lodash;

/**
 * YAML-based implementation of the configuration loader.
 * Orchestrates the merge strategy: Defaults (Zod) -> YAML (df) -> YAML (mrg) -> ENV.
 */
@Injectable()
export class YamlConfigLoader implements IConfigLoader {
    private readonly _defaultsPath: string;
    private readonly _overridesPath: string;
    private readonly _envPrefix: string;

    constructor(
        @Inject(CONFIG_MODULE_OPTIONS_TOKEN) private readonly _options: IConfigModuleOptions,
        @Inject(LOG.LOGGER) private readonly _logger: ILogger
    ) {
        this._defaultsPath = this._options.defaultsPath ?? CONFIG_DEFAULT_PATHS.DEFAULTS;
        this._overridesPath = this._options.overridesPath ?? CONFIG_DEFAULT_PATHS.OVERRIDES;
        this._envPrefix = this._options.envPrefix ?? CONFIG_DEFAULT_PATHS.ENV_PREFIX;
    }

    /**
     * Loads, merges and validates configuration for a module.
     */
    @LogMethod({description: 'Config Engine Load', level: LogLevel.DEBUG})
    public async load<T>(metadata: IConfigMetadata<T>): Promise<T> {
        const {key, schema} = metadata;

        try {
            let result: any = {};
            const sourcesFound: string[] = [];
            const frameworkDefaults = await this._loadYamlFile(this._defaultsPath, key);
            if (Object.keys(frameworkDefaults).length > 0) {
                result = merge(result, frameworkDefaults);
                sourcesFound.push('YAML(df)');
            }
            const userOverrides = await this._loadYamlFile(this._overridesPath, key);
            if (Object.keys(userOverrides).length > 0) {
                result = merge(result, userOverrides);
                sourcesFound.push('YAML(mrg)');
            }
            const envValues = this._loadFromEnv(key);
            if (Object.keys(envValues).length > 0) {
                result = merge(result, envValues);
                sourcesFound.push('ENV');
            }
            this._logger.debug(`Config [${key}] merged from sources: [${sourcesFound.join(', ') || 'NONE'}]`, ConfigContext.LOADER);
            const validationResult = schema.safeParse(result);
            if (!validationResult.success) {
                const errors = validationResult.error.issues.map((e: any) => `[${e.path.join('.')}] ${e.message}`).join(', ');
                this._logger.error(`Configuration validation failed for [${key}]: ${errors}`);
                throw new Error(`Invalid configuration for module ${key}: ${errors}`);
            }

            return validationResult.data;
        } catch (error: any) {
            throw error;
        }
    }

    /**
     * Hot-reloads configuration (To be implemented with Watcher).
     */
    public async reload<T>(key: string): Promise<T | null> {
        this._logger.warn(`Reloading [${key}] is not fully implemented yet (Waiting for Tier 3 Watcher)`);
        return null;
    }

    /**
     * Helper to load and parse a YAML file.
     * @private
     */
    private async _loadYamlFile(directory: string, key: string): Promise<any> {
        const filePath = path.join(process.cwd(), directory, `${key}.yaml`);
        try {
            const content = await fs.readFile(filePath, 'utf8');
            return yaml.parse(content) ?? {};
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                this._logger.debug(`Config file not found (skipping): ${filePath}`);
                return {};
            }
            this._logger.warn(`Failed to parse YAML file at ${filePath}: ${error.message}`);
            return {};
        }
    }

    /**
     * Scans process.env for variables matching the pattern APP__KEY__PROPERTY.
     * @private
     */
    private _loadFromEnv(key: string): any {
        const envObj: any = {};
        const prefix = `${this._envPrefix}${key.toUpperCase().replace(/[-]/g, '_')}__`;

        for (const [envKey, value] of Object.entries(process.env)) {
            if (envKey.startsWith(prefix)) {
                const pathParts = envKey
                    .slice(prefix.length)
                    .split('__')
                    .map(p => this._formatEnvKey(p));
                this._setDeep(envObj, pathParts, this._parseEnvValue(value));
            }
        }
        return envObj;
    }

    /**
     * Formats ENV_KEY_PART back to camelCase or property name.
     * @private
     */
    private _formatEnvKey(part: string): string {
        return part.toLowerCase().replace(/_([a-z])/g, (_, char) => char.toUpperCase());
    }

    /**
     * Basic parsing for environment variable values (primitive types).
     * @private
     */
    private _parseEnvValue(value: string | undefined): any {
        if (value === undefined) return undefined;
        if (value === 'true') return true;
        if (value === 'false') return false;
        if (!isNaN(Number(value)) && value.trim() !== '') return Number(value);
        return value;
    }

    /**
     * Helper to set nested property by path.
     * @private
     */
    private _setDeep(obj: any, path: string[], value: any): void {
        let current = obj;
        for (let i = 0; i < path.length - 1; i++) {
            const part = path[i];
            if (!part) continue;
            if (!(part in current)) current[part] = {};
            current = current[part];
        }
        const lastPart = path[path.length - 1];
        if (lastPart) {
            current[lastPart] = value;
        }
    }
}
