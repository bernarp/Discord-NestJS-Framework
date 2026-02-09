import {Injectable, Inject} from '@nestjs/common';
import {z} from 'zod';
import type {IConfigValidator} from '../interfaces/config-validator.interface.js';
import {ConfigValidationException} from '../exceptions/config-validation.exception.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';

/**
 * Service responsible for validating configuration data using Zod schemas.
 * Ensures data integrity and provides descriptive error messages on failure.
 */
@Injectable()
export class ConfigValidator implements IConfigValidator {
    constructor(@Inject(LOG.LOGGER) private readonly _logger: ILogger) {}

    /**
     * Validates a raw configuration object against a specific Zod schema.
     *
     * @template T - The expected configuration type.
     * @param key - The configuration key (for error context).
     * @param data - The merged configuration object to validate.
     * @param schema - The Zod schema defining the contract.
     * @returns {T} The validated, typed, and potentially transformed configuration object.
     * @throws {ConfigValidationException} If the data does not conform to the schema.
     */
    public validate<T>(key: string, data: any, schema: z.ZodType<T>): T {
        const result = schema.safeParse(data);
        if (!result.success) {
            const errors = result.error.issues.map(e => `[${e.path.join('.')}] ${e.message}`).join(', ');

            this._logger.error(`Configuration validation failed for [${key}]: ${errors}`);
            throw new ConfigValidationException(key, errors);
        }

        return result.data;
    }
}
