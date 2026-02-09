import {DISCORD_PARAMS_METADATA} from './keys.js';
import {DiscordParamType} from '@/client/enums/discord-param-type.enum.js';
import {IParamMetadata} from '@/client/interfaces/param-metadata.interface.js';

/**
 * Decorator to inject the current request context (AsyncLocalStorage) into a method parameter.
 * This provides access to correlationId, user, and other request-scoped metadata
 * without direct dependency on RequestContextService.
 *
 * @example
 * ```typescript
 * public async onCommand(@Ctx() ctx: IRequestContext) {
 *   this.logger.log(`Handling command with TRACE_ID: ${ctx.correlationId}`);
 * }
 * ```
 */
export function Ctx(): ParameterDecorator {
    return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
        if (!propertyKey) return;
        const metadata: IParamMetadata[] = Reflect.getMetadata(DISCORD_PARAMS_METADATA, target.constructor, propertyKey) || [];
        metadata.push({
            type: DiscordParamType.REQUEST_CONTEXT,
            index: parameterIndex
        });
        Reflect.defineMetadata(DISCORD_PARAMS_METADATA, metadata, target.constructor, propertyKey);
    };
}
