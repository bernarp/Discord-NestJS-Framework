import { safeJsonStringify } from '@/common/utils/safe-json.util.js';
import { LogLevel } from '@/common/_logger/enums/LogLevel.js';

export { LogLevel };

export interface LogMethodOptions {
    /** Whether to log input arguments? (Default: true) */
    logInput?: boolean;
    /** Whether to log the result? (Default: true) */
    logResult?: boolean;
    /** Log level (Default: DEBUG) */
    level?: LogLevel;
    /** Method description (optional) */
    description?: string;
}

/**
 * Decorator for automatic method call logging.
 * Safely serializes arguments and results to single-line JSON.
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
        const contextStr = `${className}.${methodName}`;
        const msgPrefix = description ? `[${description}] ` : '';

        descriptor.value = function (...args: any[]) {
            const logger = (this as any)._logger;

            if (!logger) return originalMethod.apply(this, args);

            const startTime = Date.now();

            if (logInput) {
                const argsJson = safeJsonStringify(args);

                logger.logWithLevel(
                    level,
                    `${msgPrefix}Called`,
                    contextStr,
                    { args: argsJson }
                );
            }

            const handleResult = (result: any) => {
                if (logResult) {
                    const duration = Date.now() - startTime;
                    const resultJson = safeJsonStringify(result);

                    logger.logWithLevel(
                        level,
                        `${msgPrefix}Finished (+${duration}ms)`,
                        contextStr,
                        { result: resultJson }
                    );
                }
                return result;
            };

            const handleError = (error: any) => {
                const duration = Date.now() - startTime;
                logger.err(
                    `${msgPrefix}Failed (+${duration}ms)`,
                    error,
                    contextStr
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
