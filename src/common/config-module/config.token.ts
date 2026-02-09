/**
 * Metadata key for storing configuration options on classes using Reflect.
 */
export const CONFIG_METADATA_KEY = 'config:metadata';

/**
 * DI Token for the Config loader implementation (Orchestrator).
 */
export const ICONFIG_LOADER_TOKEN = 'ICONFIG_LOADER_TOKEN';

/**
 * DI Token for the Config service.
 */
export const ICONFIG_SERVICE_TOKEN = 'ICONFIG_SERVICE_TOKEN';

/**
 * DI Token for the Config watcher service.
 */
export const ICONFIG_WATCHER_TOKEN = 'ICONFIG_WATCHER_TOKEN';

/**
 * DI Token for the ConfigModule options.
 */
export const CONFIG_MODULE_OPTIONS_TOKEN = 'CONFIG_MODULE_OPTIONS_TOKEN';

/**
 * DI Token for the logic of reading configuration files.
 */
export const ICONFIG_FILE_READER_TOKEN = 'ICONFIG_FILE_READER_TOKEN';

/**
 * DI Token for the logic of environment variable processing.
 */
export const IENV_PROCESSOR_TOKEN = 'IENV_PROCESSOR_TOKEN';

/**
 * DI Token for the logic of schema validation.
 */
export const ICONFIG_VALIDATOR_TOKEN = 'ICONFIG_VALIDATOR_TOKEN';

/**
 * DI Token for the configuration repository.
 */
export const ICONFIG_REPOSITORY_TOKEN = 'ICONFIG_REPOSITORY_TOKEN';
