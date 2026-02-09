import {Injectable, Inject} from '@nestjs/common';
import type {IConfigLoader} from '../interfaces/config-loader.interface.js';
import type {IConfigMetadata} from '../interfaces/config-options.interface.js';
import type {IConfigModuleOptions} from '../interfaces/config-module-options.interface.js';
import type {IConfigFileReader} from '../interfaces/file-reader.interface.js';
import type {IEnvProcessor} from '../interfaces/env-processor.interface.js';
import type {IConfigValidator} from '../interfaces/config-validator.interface.js';
import {ConfigMerger} from '../utils/config-merger.util.js';
import {CONFIG_MODULE_OPTIONS_TOKEN, ICONFIG_FILE_READER_TOKEN, IENV_PROCESSOR_TOKEN, ICONFIG_VALIDATOR_TOKEN} from '../config.token.js';
import {CONFIG_DEFAULT_PATHS, ConfigContext} from '../constants/config.constants.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';
import {LogMethod, LogLevel} from '@/common/decorators/log-method.decorator.js';
import {ConfigLoaderException} from '../exceptions/config-loader.exception.js';

/**
 * Orchestrator service for the configuration loading pipeline.
 * Coordinates multiple providers (file, env, validator) to produce a validated configuration.
 * Adheres to SRP by delegating specific logic to specialized services.
 */
@Injectable()
export class ConfigOrchestrator implements IConfigLoader {
    /** Path to framework default configurations. */
    private readonly _defaultsPath: string;
    /** Path to user-defined configuration overrides. */
    private readonly _overridesPath: string;
    /** Prefix used for scanning environment variables. */
    private readonly _envPrefix: string;

    constructor(
        @Inject(CONFIG_MODULE_OPTIONS_TOKEN) private readonly _options: IConfigModuleOptions,
        @Inject(ICONFIG_FILE_READER_TOKEN) private readonly _fileReader: IConfigFileReader,
        @Inject(IENV_PROCESSOR_TOKEN) private readonly _envProcessor: IEnvProcessor,
        @Inject(ICONFIG_VALIDATOR_TOKEN) private readonly _validator: IConfigValidator,
        @Inject(LOG.LOGGER) private readonly _logger: ILogger
    ) {
        this._defaultsPath = this._options.defaultsPath ?? CONFIG_DEFAULT_PATHS.DEFAULTS;
        this._overridesPath = this._options.overridesPath ?? CONFIG_DEFAULT_PATHS.OVERRIDES;
        this._envPrefix = this._options.envPrefix ?? CONFIG_DEFAULT_PATHS.ENV_PREFIX;
    }

    /**
     * Executes the configuration loading pipeline.
     * 1. Reads raw data from files (df and mrg).
     * 2. Extracts data from environment variables.
     * 3. Performs a deep merge of all sources.
     * 4. Validates the result against the provided Zod schema.
     *
     * @template T - The type of the configuration object.
     * @param metadata - Configuration metadata including key and schema.
     * @returns {Promise<T>} Validated configuration object.
     * @throws {ConfigLoaderException} If an unexpected error occurs during the pipeline.
     * @throws {ConfigValidationException} If the merged configuration is invalid.
     */
    @LogMethod({description: 'Config Pipeline Execution', level: LogLevel.DEBUG})
    public async load<T>(metadata: IConfigMetadata<T>): Promise<T> {
        const {key, schema} = metadata;

        try {
            const frameworkDefaults = await this._fileReader.read(this._defaultsPath, key);
            const userOverrides = await this._fileReader.read(this._overridesPath, key);
            const envValues = this._envProcessor.extract(key, this._envPrefix);
            const mergedRaw = ConfigMerger.merge(frameworkDefaults, userOverrides, envValues);
            this._logger.debug(`Config [${key}] raw sources merged.`, ConfigContext.LOADER);
            return this._validator.validate(key, mergedRaw, schema);
        } catch (error: any) {
            if (error instanceof Error && (error.name.includes('Config') || error.constructor.name.includes('Config'))) {
                throw error;
            }
            throw new ConfigLoaderException(key, error.message);
        }
    }

    /**
     * Hot-reloads configuration (to be implemented via service calls).
     * @returns {Promise<null>} Always returns null in current implementation.
     */
    public async reload<T>(_key: string): Promise<T | null> {
        return null;
    }
}
