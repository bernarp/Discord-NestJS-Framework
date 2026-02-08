import {DISCORD_PARAMS_METADATA} from './keys.js';
import {DiscordParamType} from '@/client/enums/discord-param-type.enum.js';
import {IParamMetadata} from '@/client/interfaces/param-metadata.interface.js';
import {IDiscordPipe} from '../../common/pipes/interfaces/discord-pipe.interface.js';
import {OptionType} from '@/client/enums/command-option.enum.js';

/**
 * Options for the @Option decorator.
 */
export interface IOptionDecoratorOptions {
    name: string;
    description: string;
    type?: OptionType;
    required?: boolean;
    autocomplete?: boolean;
}

/**
 * Decorator to inject a specific option value from the interaction options into a method parameter.
 * Automatically handles metadata for Discord API registration.
 *
 * @param options - The name of the option OR a configuration object.
 * @param pipes - Optional pipes to apply to the input value.
 */
export function Option(options: string | IOptionDecoratorOptions, ...pipes: (IDiscordPipe | Function)[]): ParameterDecorator {
    return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
        if (!propertyKey) return;

        const name = typeof options === 'string' ? options : options.name;
        const config = typeof options === 'object' ? options : undefined;

        const metadata: IParamMetadata[] = Reflect.getMetadata(DISCORD_PARAMS_METADATA, target.constructor, propertyKey) || [];

        metadata.push({
            type: DiscordParamType.OPTION,
            index: parameterIndex,
            data: name,
            pipes: pipes,
            optionOptions: config
                ? {
                      name: config.name,
                      description: config.description,
                      required: config.required,
                      type: config.type,
                      autocomplete: config.autocomplete
                  }
                : undefined
        });

        Reflect.defineMetadata(DISCORD_PARAMS_METADATA, metadata, target.constructor, propertyKey);
    };
}
