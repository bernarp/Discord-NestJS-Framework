import {PREFIX_COMMAND_METADATA} from './keys.js';
import {IPrefixCommandOptions} from '@/client/dto/index.js';

/**
 * Decorator that marks a class as a Prefix Command handler.
 */
export function PrefixCommand(options: IPrefixCommandOptions): ClassDecorator {
    return (target: any) => {
        Reflect.defineMetadata(PREFIX_COMMAND_METADATA, options, target);
    };
}
