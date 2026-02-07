import {LogMethod, LogMethodOptions} from './log-method.decorator.js';

/**
 * Class decorator that applies @LogMethod to all methods of the class.
 * Useful for "global" logging within a specific service or controller.
 *
 * @param options - Standard LogMethod options.
 */
export function LogClass(options: LogMethodOptions = {}): ClassDecorator {
    return (target: Function) => {
        const prototype = target.prototype;
        const propertyNames = Object.getOwnPropertyNames(prototype);

        for (const name of propertyNames) {
            const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
            if (!descriptor || typeof descriptor.value !== 'function' || name === 'constructor') {
                continue;
            }

            // Apply LogMethod decorator logic to the method
            const decorated = LogMethod(options)(target.prototype, name, descriptor);
            if (decorated) {
                Object.defineProperty(prototype, name, decorated);
            }
        }
    };
}
