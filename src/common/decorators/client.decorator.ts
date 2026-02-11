import {Inject} from '@nestjs/common';
import {ICLIENT_TOKEN} from '@/client/client.token.js';
import {DISCORD_PARAMS_METADATA} from './keys.js';
import {DiscordParamType} from '@/client/enums/discord-param-type.enum.js';
import {IParamMetadata} from '@/client/interfaces/param-metadata.interface.js';

/**
 * Decorator to inject the Discord client instance.
 * Supports both NestJS constructor injection and interaction parameter discovery.
 *
 * @returns {ParameterDecorator}
 */
export function Client(): ParameterDecorator {
    return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
        if (!propertyKey) {
            return Inject(ICLIENT_TOKEN)(target, propertyKey, parameterIndex);
        }

        const metadata: IParamMetadata[] = Reflect.getMetadata(DISCORD_PARAMS_METADATA, target.constructor, propertyKey) || [];
        metadata.push({
            type: DiscordParamType.CLIENT,
            index: parameterIndex
        });

        Reflect.defineMetadata(DISCORD_PARAMS_METADATA, metadata, target.constructor, propertyKey);
    };
}
