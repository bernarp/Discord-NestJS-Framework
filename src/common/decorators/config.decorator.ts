import {CONFIG_METADATA_KEY} from '../config-module/config.token.js';
import {IConfigOptions} from '../config-module/interfaces/config-options.interface.js';

/**
 * Decorator to register a module as a managed configuration source.
 * This decorator marks the class (usually a module or a specific config DTO)
 * for the Distributed Configuration Engine to discover during bootstrap.
 *
 * @param options - Configuration options including a unique key and a Zod schema for validation.
 *
 * @example
 * ```typescript
 * @Config({
 *   key: 'database',
 *   schema: DatabaseConfigSchema
 * })
 * export class DatabaseConfig {}
 * ```
 */
export function Config(options: IConfigOptions): ClassDecorator {
    return (target: object) => {
        Reflect.defineMetadata(CONFIG_METADATA_KEY, options, target);
    };
}
