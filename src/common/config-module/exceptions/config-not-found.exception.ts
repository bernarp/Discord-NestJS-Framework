import {ConfigException} from './config.exception.js';

/**
 * Exception thrown when an application component attempts to access a configuration
 * that has not been registered or failed to initialize during the boot phase.
 */
export class ConfigNotFoundException extends ConfigException {
    /**
     * @param key - The requested configuration key.
     */
    constructor(key: string) {
        super(`Configuration snapshot not found for key [${key}]`);
    }
}
