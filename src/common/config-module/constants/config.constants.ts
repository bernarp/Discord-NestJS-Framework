/**
 * Default directory paths for config layers.
 */
export const CONFIG_DEFAULT_PATHS = {
    DEFAULTS: './config_df',
    OVERRIDES: './config_mrg',
    ENV_PREFIX: 'APP__',
    GENERATED_TYPES: 'src/common/config-module/types/config.generated.d.ts'
} as const;

/**
 * System contexts used for logging within the config module.
 */
export enum ConfigContext {
    CLI = 'ConfigCLI',
    SERVICE = 'ConfigService',
    LOADER = 'ConfigLoader'
}
