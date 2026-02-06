import { inspect } from 'util';
import { LogLevel } from '@/common/_logger/enums/LogLevel.js';

export { LogLevel };

/**
 * Options for the method logging decorator.
 */
export interface LogMethodOptions {
    /** Whether to log incoming arguments. */
    logInput?: boolean;
    /** Whether to log the execution result. */
    logResult?: boolean;
    /** Action description for logs (used as prefix) */
    description?: string;
    /** Logging level (defaults to DEBUG) */
    level?: LogLevel;
}

/**
 * Decorator for automatic method call logging.
 * Works standalone by wrapping the method execution.
 * 
 * Requirement: The class instance must have a '_logger' property 
 * implementing at least basic logging methods.
 *
 * @param options Logging settings.
 */
export function LogMethod(options: LogMethodOptions = {}): MethodDecorator {
    const {
        level = LogLevel.DEBUG,
        logInput = true,
        logResult = true,
        description
    } = options;

    return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;
        const methodName = String(propertyKey);
        const className = target.constructor.name;
        const prefix = description ? `[${description}] ` : '';

        descriptor.value = function (...args: any[]) {
            const logger = (this as any)._logger;
            if (!logger) {
                return originalMethod.apply(this, args);
            }

            const startTime = Date.now();

            if (logInput) {
                const safeArgs = sanitize(args);
                logger.logWithLevel(
                    level,
                    `${prefix}Call: ${className}.${methodName}`,
                    `${className}.${methodName}`,
                    { args: safeArgs }
                );
            }

            const handleResult = (result: any) => {
                if (logResult) {
                    const duration = Date.now() - startTime;
                    logger.logWithLevel(
                        level,
                        `${prefix}Return: ${className}.${methodName} (+${duration}ms)`,
                        `${className}.${methodName}`,
                        { result: typeof result === 'object' ? 'Object(...)' : result }
                    );
                }
                return result;
            };

            const handleError = (error: any) => {
                const duration = Date.now() - startTime;
                logger.err(
                    `${prefix}Error: ${className}.${methodName} (+${duration}ms)`,
                    error instanceof Error ? error : String(error),
                    `${className}.${methodName}`
                );
                throw error;
            };

            try {
                const result = originalMethod.apply(this, args);

                if (result instanceof Promise) {
                    return result.then(handleResult).catch(handleError);
                }
                return handleResult(result);
            } catch (error) {
                handleError(error);
            }
        };

        return descriptor;
    };
}

/**
 * Sanitizes arguments for safe logging.
 */
function sanitize(args: any[]): string {
    try {
        return inspect(args, { depth: 1, colors: false, compact: true });
    } catch {
        return '[Circular/Unserializable Data]';
    }
}

