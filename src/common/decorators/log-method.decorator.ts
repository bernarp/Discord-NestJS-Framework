import { inspect } from 'util';
import { LogLevel } from '@/common/_logger/enums/LogLevel.js';
import type { Interaction } from 'discord.js';

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
    /** If true, hides raw arguments from logs (useful for sensitive data) */
    hideArgs?: boolean;
}

/**
 * Decorator for automatic method call logging.
 * Works standalone by wrapping the method execution.
 * 
 * Automatically extracts Discord Interaction metadata when present.
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
        description,
        hideArgs = false
    } = options;

    return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;
        const methodName = String(propertyKey);
        const className = target.constructor.name;
        const context = `${className}.${methodName}`;

        descriptor.value = function (...args: any[]) {
            const logger = (this as any)._logger;
            if (!logger) {
                return originalMethod.apply(this, args);
            }
            const startTime = Date.now();
            const meta = extractInteractionMeta(args);
            const hasMeta = Object.keys(meta).length > 0;
            const entryMsg = description || 'Called';
            if (logInput) {
                const logData: any = { ...meta };
                if (!hideArgs && !hasInteraction(args)) {
                    logData.args = sanitize(args);
                }

                logger.logWithLevel(level, entryMsg, context, logData);
            }

            const logCompletion = (resultOrError: any, isError: boolean) => {
                const duration = Date.now() - startTime;
                const resultMsg = `Finished in ${duration}ms`;

                if (isError) {
                    logger.err(
                        resultMsg,
                        resultOrError instanceof Error ? resultOrError : String(resultOrError),
                        context
                    );
                } else if (logResult) {
                    const resultMeta = typeof resultOrError === 'object' ? 'Object(...)' : resultOrError;
                    if (resultMeta !== 'Object(...)') {
                        logger.logWithLevel(level, resultMsg, context, { result: resultMeta });
                    } else {
                        logger.logWithLevel(level, resultMsg, context);
                    }
                }
            };



            try {
                const result = originalMethod.apply(this, args);

                if (result instanceof Promise) {
                    return result
                        .then((res) => {
                            logCompletion(res, false);
                            return res;
                        })
                        .catch((err) => {
                            logCompletion(err, true);
                            throw err;
                        });
                }

                logCompletion(result, false);
                return result;
            } catch (error) {
                logCompletion(error, true);
                throw error;
            }
        };

        return descriptor;
    };
}

/**
 * Checks if any argument is a Discord Interaction (duck typing).
 */
function hasInteraction(args: any[]): boolean {
    return args.some(arg => isInteraction(arg));
}

/**
 * Type guard for Discord Interaction.
 */
function isInteraction(arg: any): arg is Interaction {
    return arg && typeof arg === 'object' && 'user' in arg && 'type' in arg;
}

/**
 * Extracts useful metadata from Discord Interaction.
 */
function extractInteractionMeta(args: any[]): Record<string, any> {
    const interaction = args.find(arg => isInteraction(arg));
    if (!interaction) return {};

    const meta: Record<string, any> = {
        user: `${interaction.user.username} (${interaction.user.id})`,
        type: interaction.type
    };

    if (interaction.guild) {
        meta.guild = `${interaction.guild.name} (${interaction.guildId})`;
    } else {
        meta.context = 'DM';
    }

    if (interaction.isCommand?.()) {
        meta.command = interaction.commandName;
        try {
            const options = (interaction as any).options?.data;
            if (options && options.length > 0) {
                meta.options = options.map((opt: any) => `${opt.name}:${opt.value}`);
            }
        } catch {
        }
    }

    if (interaction.isButton?.()) {
        meta.customId = (interaction as any).customId;
    }

    if (interaction.isStringSelectMenu?.()) {
        meta.customId = (interaction as any).customId;
        meta.values = (interaction as any).values;
    }

    return meta;
}

/**
 * Sanitizes arguments for safe logging.
 */
function sanitize(args: any[]): string {
    try {
        return inspect(args, { depth: 1, colors: false, compact: true, breakLength: Infinity });
    } catch {
        return '[Unserializable]';
    }
}
