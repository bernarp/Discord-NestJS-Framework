import { EPHEMERAL_METADATA } from './keys.js';

/**
 * Decorator that marks a command or a specific subcommand to always respond ephemerally.
 * Can be used on classes (applies to all methods) or individual methods.
 */
export function Ephemeral(): MethodDecorator & ClassDecorator {
    return (target: object | Function, propertyKey?: string | symbol) => {
        if (propertyKey) {
            Reflect.defineMetadata(EPHEMERAL_METADATA, true, target.constructor, propertyKey);
        } else {
            Reflect.defineMetadata(EPHEMERAL_METADATA, true, target);
        }
    };
}
