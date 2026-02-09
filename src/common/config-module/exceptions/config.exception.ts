/**
 * Base abstract exception class for all errors within the configuration domain.
 * Provides standard error identification for the Global Exception Filter.
 */
export class ConfigException extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
