import {DISCORD_PARAMS_METADATA} from './keys.js';
import {DiscordParamType} from '@/client/enums/discord-param-type.enum.js';
import {IParamMetadata} from '@/client/interfaces/param-metadata.interface.js';

/**
 * Decorator to inject a specific option value from the interaction options into a method parameter.
 * @param name - The name of the option to extract.
 */
export function Option(name: string): ParameterDecorator {
    return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
        if (!propertyKey) return;

        const metadata: IParamMetadata[] = Reflect.getMetadata(DISCORD_PARAMS_METADATA, target.constructor, propertyKey) || [];

        metadata.push({
            type: DiscordParamType.OPTION,
            index: parameterIndex,
            data: name
        });

        Reflect.defineMetadata(DISCORD_PARAMS_METADATA, metadata, target.constructor, propertyKey);
    };
}
