import {ConfigException} from './config.exception.js';

/**
 * Exception thrown when the configuration pipeline fails during the data retrieval or merging phases.
 */
export class ConfigLoaderException extends ConfigException {
    /**
     * @param key - The unique identifier of the configuration that failed to load.
     * @param originalError - The message from the underlying system error (e.g. FS error).
     */
    constructor(key: string, originalError: string) {
        super(`Failed to load configuration for [${key}]: ${originalError}`);
    }
}
