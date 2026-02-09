import {ZodType} from 'zod';

/**
 * Options passed to the @Config decorator to register a module's configuration.
 */
export interface IConfigOptions<T = any> {
    /**
     * Unique identifier for the configuration block (e.g., 'auth', 'database').
     * This key will be used to look up files and environment variables.
     */
    key: string;

    /**
     * Zod schema used for validation and type inference.
     * The configuration will be validated against this schema during startup.
     */
    schema: ZodType<T>;
}

/**
 * Metadata stored in the Reflect registry about a configuration-enabled class.
 */
export interface IConfigMetadata<T = any> extends IConfigOptions<T> {
    /** The class constructor where the decorator was applied. */
    target: any;
}
