/**
 * Default directory paths for config layers.
 */
export const CONFIG_DEFAULT_PATHS = {
    DEFAULTS: './config_df',
    OVERRIDES: './config_mrg',
    ENV_PREFIX: 'APP__',
    GENERATED_TYPES: 'src/common/config-module/types/config.generated.ts'
} as const;

/**
 * System contexts used for logging within the config module.
 */
export enum ConfigContext {
    CLI = 'ConfigCLI',
    SERVICE = 'ConfigService',
    LOADER = 'ConfigLoader'
}

/**
 * Internal constants for configuration processing.
 */
export enum ConfigInternal {
    ENV_DELIMITER = '__',
    PATH_DELIMITER = '.',
    RELOAD_NOT_IMPLEMENTED = 'Reloading is not fully implemented yet'
}
