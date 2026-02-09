import {ConfigException} from './config.exception.js';

/**
 * Exception thrown when a configuration object fails Zod schema validation.
 * Contains the specific key and human-readable details of formatting/constraint errors.
 */
export class ConfigValidationException extends ConfigException {
    /**
     * @param key - The unique identifier of the failed configuration.
     * @param details - Concatenated string of validation error items.
     */
    constructor(key: string, details: string) {
        super(`Configuration validation failed for [${key}]: ${details}`);
    }
}
