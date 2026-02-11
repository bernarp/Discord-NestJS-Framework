import {SetMetadata} from '@nestjs/common';
import {PREFIX_SUBCOMMAND_METADATA} from './keys.js';
import {IPrefixSubCommandOptions} from '@/client/dto/index.js';

/**
 * Decorator that marks a method as a Prefix Sub-command.
 */
export function PrefixSubCommand(options: IPrefixSubCommandOptions): MethodDecorator {
    return (target: any, key: string | symbol, descriptor: PropertyDescriptor) => {
        SetMetadata(PREFIX_SUBCOMMAND_METADATA, options)(target, key, descriptor);
        return descriptor;
    };
}
