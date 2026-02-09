import {z} from 'zod';

/**
 * Interface for the configuration validation engine.
 * Wraps schema validation logic (e.g. Zod) to provide a consistent contract for the orchestrator.
 */
export interface IConfigValidator {
    /**
     * Validates a raw configuration object against a specific schema.
     *
     * @template T - The resulting configuration type.
     * @param key - The identifier of the configuration (for error context).
     * @param data - The raw merged data from various sources.
     * @param schema - The Zod schema to validate against.
     * @returns {T} The validated, typed, and cleaned configuration data.
     * @throws {ConfigValidationException} If validation fails.
     */
    validate<T>(key: string, data: any, schema: z.ZodType<T>): T;
}
