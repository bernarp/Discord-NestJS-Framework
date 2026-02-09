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

/**
 * Zod type name constants for schema processing.
 */
export enum ZodTypeNames {
    OBJECT = 'object',
    ARRAY = 'array',
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    ENUM = 'enum',
    DEFAULT = 'default',
    OPTIONAL = 'optional',
    NULLABLE = 'nullable',
    READONLY = 'readonly',
    CATCH = 'catch',
    EFFECTS = 'effects',
    PIPELINE = 'pipeline',
    BRANDED = 'branded',
    LAZY = 'lazy'
}

/**
 * CLI tool related constants.
 */
export enum ConfigCliConstants {
    TOOL_NAME = '[Config Tool]',
    TYPE_FAIL_COMMENT = 'any; // Type inference failed',
    GENERATED_HEADER = '/**\n * ⚠️ AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.\n * This file contains types inferred from Zod schemas and the ConfigKey mapping.\n */\n\n'
}
