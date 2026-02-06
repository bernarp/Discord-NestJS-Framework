import 'reflect-metadata';
import { ApplicationCommandOptionType } from 'discord.js';
import { SUBCOMMAND_METADATA, INTERNAL_SUBCOMMANDS_METADATA } from './keys.js';
import { subCommandDecoratorSchema, SubCommandOptions } from './command.schema.js';

/**
 * Decorator to mark a method as a subcommand.
 *
 * @param options Subcommand options.
 */
export function SubCommand(options: SubCommandOptions): MethodDecorator {
    const result = subCommandDecoratorSchema.safeParse(options);
    if (!result.success) {
        throw new Error(`Invalid SubCommand configuration: ${result.error.message}`);
    }

    return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        const data = result.data;
        Reflect.defineMetadata(SUBCOMMAND_METADATA, { ...data, method: propertyKey }, descriptor.value);
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
