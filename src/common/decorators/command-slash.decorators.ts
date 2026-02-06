import 'reflect-metadata';
import {applyDecorators, Injectable, SetMetadata} from '@nestjs/common';
import {COMMAND_METADATA, INTERNAL_SUBCOMMANDS_METADATA} from './keys.js';
import {rootCommandSchema, CommandOptions} from './command.schema.js';

/**
 * Class decorator that marks a class as a Discord Slash Command provider.
 *
 * This decorator performs several key architectural functions:
 * 1. Validates the command configuration using Zod (Fail-fast principle).
 * 2. Automatically aggregates any methods decorated with `@SubCommand` using Reflection.
 * 3. Marks the class as a NestJS `@Injectable()` provider, enabling Dependency Injection.
 * 4. Stores metadata for the CommandHandler to register the command with Discord API.
 *
 * @param {CommandOptions} options - The configuration object for the command.
 * @returns {ClassDecorator} The decorated class.
 *
 * @throws {Error} If the configuration does not match the Zod schema (e.g., uppercase names, invalid length).
 *
 * @example
 * ```typescript
 * import { CommandSlash } from '@/common/decorators';
 * import { CommandRegistrationType } from '@/common/enums';
 *
 * @CommandSlash({
 *   name: 'moderation',
 *   description: 'Moderation tools for the server',
 *   register: CommandRegistrationType.GUILD,
 *   defaultMemberPermissions: ['BAN_MEMBERS']
 * })
 * export class ModerationCommand {
 *   constructor(private readonly service: ModerationService) {}
 *   // ... methods with @SubCommand
 * }
 * ```
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
