import {SetMetadata} from '@nestjs/common';
import {PREFIX_COMMAND_METADATA} from './keys.js';
import {IPrefixCommandOptions} from '@/client/dto/index.js';

/**
 * Decorator that marks a class as a Prefix Command handler.
 */
export function PrefixCommand(options: IPrefixCommandOptions): ClassDecorator {
    return (target: any) => {
        SetMetadata(PREFIX_COMMAND_METADATA, options)(target);
    };
}
