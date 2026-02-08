import 'reflect-metadata';
import {ApplicationCommandOptionType} from 'discord.js';
import {SUBCOMMAND_METADATA, INTERNAL_SUBCOMMANDS_METADATA, DISCORD_PARAMS_METADATA} from './keys.js';
import {subCommandDecoratorSchema, SubCommandOptions} from './command.schema.js';
import {IParamMetadata} from '@/client/interfaces/param-metadata.interface.js';
import {DiscordParamType} from '@/client/enums/discord-param-type.enum.js';
import {TypeMapper} from '@/client/utils/type-mapper.util.js';

/**
 * Method decorator that registers a method as a handler for a specific Subcommand.
 * Automatically discovers parameters decorated with @Option.
 */
export function SubCommand(options: SubCommandOptions): MethodDecorator {
    const result = subCommandDecoratorSchema.safeParse(options);
    if (!result.success) {
        throw new Error(`Invalid SubCommand configuration: ${result.error.message}`);
    }
    return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        const data = result.data;
        const params: IParamMetadata[] = Reflect.getMetadata(DISCORD_PARAMS_METADATA, target.constructor, propertyKey) || [];
        const paramTypes = Reflect.getMetadata('design:paramtypes', target, propertyKey) || [];
        const autoOptions = params
            .filter(p => p.type === DiscordParamType.OPTION)
            .map(p => {
                const metatype = paramTypes[p.index];
                const autoType = TypeMapper.mapToDiscordType(metatype);

                return {
                    name: p.optionOptions?.name || p.data!,
                    description: p.optionOptions?.description || `Option ${p.data}`,
                    type: p.optionOptions?.type || autoType || ApplicationCommandOptionType.String,
                    required: p.optionOptions?.required ?? true,
                    autocomplete: p.optionOptions?.autocomplete
                };
            });

        const finalOptions = [...(data.options || []), ...autoOptions];
        finalOptions.sort((a, b) => {
            if (a.required && !b.required) return -1;
            if (!a.required && b.required) return 1;
            return 0;
        });
        Reflect.defineMetadata(SUBCOMMAND_METADATA, {...data, method: propertyKey}, target.constructor, propertyKey);
        const existingSubCommands = Reflect.getMetadata(INTERNAL_SUBCOMMANDS_METADATA, target.constructor) || [];
        existingSubCommands.push({
            type: ApplicationCommandOptionType.Subcommand,
            name: data.name,
            description: data.description,
            options: finalOptions
        });

        Reflect.defineMetadata(INTERNAL_SUBCOMMANDS_METADATA, existingSubCommands, target.constructor);
    };
}
