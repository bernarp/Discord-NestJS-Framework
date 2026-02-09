/**
 * Enum representing the source of a configuration value.
 * Used for auditing and debugging to understand where a specific setting came from.
 */
export enum ConfigOrigin {
    /** Hardcoded default value provided in the framework (config_df). */
    DEFAULTS = 'YAML(df)',

    /** Value loaded from a YAML/JSON file override (config_mrg). */
    OVERRIDES = 'YAML(mrg)',

    /** Value injected via environment variables (process.env). */
    ENV = 'ENV',

    /** No source found. */
    NONE = 'NONE'
}
