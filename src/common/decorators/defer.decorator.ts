import {DEFER_METADATA} from './keys.js';

/**
 * Options for the @Defer decorator.
 */
export interface DeferOptions {
    /**
     * Whether the deferred response should be ephemeral (only visible to the user).
     * If not provided, it will check for @Ephemeral decorator or default to false.
     */
    ephemeral?: boolean;
}

/**
 * Decorator that automatically calls interaction.deferReply() before the method is executed.
 * Useful for long-running tasks that exceed Discord's 3-second limit.
 */
export function Defer(options: DeferOptions = {}): MethodDecorator {
    return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        Reflect.defineMetadata(DEFER_METADATA, options, target.constructor, propertyKey);
    };
}
