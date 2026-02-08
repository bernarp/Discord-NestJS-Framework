import {DISCORD_PARAMS_METADATA} from './keys.js';
import {DiscordParamType} from '@/client/enums/discord-param-type.enum.js';
import {IParamMetadata} from '@/client/interfaces/param-metadata.interface.js';

/**
 * Decorator to inject the interaction.guild object into a method parameter.
 */
export function CurrentGuild(): ParameterDecorator {
    return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
        if (!propertyKey) return;
        const metadata: IParamMetadata[] = Reflect.getMetadata(DISCORD_PARAMS_METADATA, target.constructor, propertyKey) || [];
        metadata.push({
            type: DiscordParamType.CURRENT_GUILD,
            index: parameterIndex
        });
        Reflect.defineMetadata(DISCORD_PARAMS_METADATA, metadata, target.constructor, propertyKey);
    };
}
