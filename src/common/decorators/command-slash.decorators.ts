import 'reflect-metadata';
import { applyDecorators, Injectable, SetMetadata } from '@nestjs/common';
import { COMMAND_METADATA, INTERNAL_SUBCOMMANDS_METADATA } from './keys.js';
import { rootCommandSchema, CommandOptions } from './command.schema.js';

/**
 * Decorator to mark a class as a root slash command.
 * Automatically collects all subcommands from methods decorated with @SubCommand.
 *
 * @param options basic command options.
 */
export function CommandSlash(options: CommandOptions): ClassDecorator {
    return (target: Function) => {
        const subCommands = Reflect.getMetadata(INTERNAL_SUBCOMMANDS_METADATA, target) || [];
        const finalOptions = subCommands.length > 0 ? subCommands : options.options || [];
        const result = rootCommandSchema.safeParse(options);
        if (!result.success) {
            throw new Error(`Invalid CommandSlash configuration for "${options.name}": ${result.error.message}`);
        }
        const finalConfig = {
            ...result.data,
            options: finalOptions
        };
        applyDecorators(SetMetadata(COMMAND_METADATA, finalConfig), Injectable())(target);
    };
}
