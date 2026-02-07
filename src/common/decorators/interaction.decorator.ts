import { DISCORD_PARAMS_METADATA } from './keys.js';
import { DiscordParamType } from '@/client/interactions/params/discord-param-type.enum.js';
import { IParamMetadata } from '@/client/interactions/params/param-metadata.interface.js';

/**
 * Decorator to inject the full interaction object into a method parameter.
 */
export function Interaction(): ParameterDecorator {
    return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
        if (!propertyKey) return;
        const metadata: IParamMetadata[] = Reflect.getMetadata(DISCORD_PARAMS_METADATA, target.constructor, propertyKey) || [];
        metadata.push({
            type: DiscordParamType.INTERACTION,
            index: parameterIndex
        });

        Reflect.defineMetadata(DISCORD_PARAMS_METADATA, metadata, target.constructor, propertyKey);
    };
}
