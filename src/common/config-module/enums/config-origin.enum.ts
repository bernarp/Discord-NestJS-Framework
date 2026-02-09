/**
 * Enum representing the source of a configuration value.
 * Used for auditing and debugging to understand where a specific setting came from.
 */
export enum ConfigOrigin {
    /** Hardcoded default value provided in the source code. */
    DEFAULT = 'default',

    /** Value loaded from a YAML/JSON file (config_mrg). */
    FILE = 'file',

    /** Value injected via environment variables (process.env). */
    ENV = 'env'
}
