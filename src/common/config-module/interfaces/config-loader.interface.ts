import {IConfigMetadata} from './config-options.interface.js';

/**
 * Interface for the Configuration Loader.
 * Responsible for the multi-stage process of loading, merging, and validating
 * configuration data from various sources (files, env, defaults).
 */
export interface IConfigLoader {
    /**
     * Loads and merges configuration for a specific module based on its metadata.
     *
     * The process follows the hierarchy:
     * 1. Extract defaults from IConfigMetadata.
     * 2. Load and merge partial YAML from 'config_df' (Framework Defaults).
     * 3. Load and merge partial YAML from 'config_mrg' (User Overrides).
     * 4. Merge environment variables.
     * 5. Validate final object against the Zod schema.
     *
     * @param metadata - The metadata of the module being configured.
     * @returns {Promise<T>} The fully resolved and validated configuration.
     */
    load<T>(metadata: IConfigMetadata<T>): Promise<T>;

    /**
     * Reloads configuration from disk. Used for Hot Reloading.
     * @param key - The unique identifier of the config block.
     * @returns {Promise<T | null>} The updated config or null if reloading failed.
     */
    reload<T>(key: string): Promise<T | null>;
}
