import 'reflect-metadata';
import {ApplicationCommandOptionType} from 'discord.js';
import {SUBCOMMAND_METADATA, INTERNAL_SUBCOMMANDS_METADATA} from './keys.js';
import {subCommandDecoratorSchema, SubCommandOptions} from './command.schema.js';

/**
 * Method decorator that registers a method as a handler for a specific Subcommand.
 *
 * It uses Reflection to attach metadata to the method for routing purposes AND
 * pushes the subcommand structure to the parent class's metadata for API registration.
 *
 * **Note:** The method decorated with this must accept `ChatInputCommandInteraction` as an argument.
 *
 * @param {SubCommandOptions} options - Configuration for the subcommand.
 * @returns {MethodDecorator} The decorated method.
 *
 * @throws {Error} If the configuration is invalid (e.g., missing name or description).
 *
 * @example
 * ```typescript
 * import { SubCommand } from '@/common/decorators';
 * import { OptionType } from '@/common/enums';
 * import { OptionsFactory } from '@/common/utils';
 *
 * export class MusicCommand {
 *
 *   @SubCommand({
 *     name: 'play',
 *     description: 'Play a track from YouTube or Spotify',
 *     options: [
 *       OptionsFactory.String({
 *         name: 'query',
 *         description: 'The URL or song name',
 *         required: true
 *       })
 *     ]
 *   })
 *   async onPlay(interaction: ChatInputCommandInteraction) {
 *     const query = interaction.options.getString('query');
 *     // ... implementation
 *   }
 * }
 * ```
 */
export function SubCommand(options: SubCommandOptions): MethodDecorator {
    const result = subCommandDecoratorSchema.safeParse(options);
    if (!result.success) {
        throw new Error(`Invalid SubCommand configuration: ${result.error.message}`);
    }

    return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        const data = result.data;
        Reflect.defineMetadata(SUBCOMMAND_METADATA, {...data, method: propertyKey}, target.constructor, propertyKey);
        const existingSubCommands = Reflect.getMetadata(INTERNAL_SUBCOMMANDS_METADATA, target.constructor) || [];
        existingSubCommands.push({
            type: ApplicationCommandOptionType.Subcommand,
            name: data.name,
            description: data.description,
            options: data.options || []
        });

        Reflect.defineMetadata(INTERNAL_SUBCOMMANDS_METADATA, existingSubCommands, target.constructor);
    };
}
