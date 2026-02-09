/**
 * Configuration options for the ConfigModule itself during initialization.
 */
export interface IConfigModuleOptions {
    /**
     * Absolute or relative path to the directory containing default YAML files.
     * Default: './config_df'
     */
    defaultsPath?: string;

    /**
     * Absolute or relative path to the directory containing override YAML files.
     * Default: './config_mrg'
     */
    overridesPath?: string;

    /**
     * Whether to enable real-time file watching and hot reloading.
     * Default: false
     */
    hotReload?: boolean;

    /**
     * Prefix for environment variables to be matched with configuration keys.
     * Default: 'APP__' (e.g., APP__AUTH__PORT)
     */
    envPrefix?: string;
}
