import {Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {Observable, tap, catchError, throwError} from 'rxjs';
import {LOG_METHOD_KEY, LogMethodOptions} from '../decorators/log-method.decorator.js';
import {inspect} from 'util';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';
import {LogLevel} from '@/common/_logger/enums/LogLevel.js';

/**
 * Interceptor for automatic logging of method calls marked with @LogMethod.
 * Uses RxJS to intercept execution flow and handle results/errors.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(
        private readonly _reflector: Reflector,
        @Inject(LOG.LOGGER) private readonly _logger: ILogger
    ) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const options = this._reflector.get<LogMethodOptions>(LOG_METHOD_KEY, context.getHandler());
        if (!options) {
            return next.handle();
        }

        const className = context.getClass().name;
        const methodName = context.getHandler().name;
        const contextType = context.getType();
        const {logInput, logResult, level, description} = options;

        const prefix = description ? `[${description}] ` : '';
        const startTime = Date.now();
        const logLevel = level || LogLevel.DEBUG;

        if (logInput) {
            const args = context.getArgs();
            const safeArgs = this._sanitizeArgs(args);

            this._logger.logWithLevel(logLevel, `${prefix}Call: ${className}.${methodName} [${contextType}]`, `${className}.${methodName}`, {
                args: safeArgs
            });
        }

        return next.handle().pipe(
            tap(result => {
                if (logResult) {
                    const duration = Date.now() - startTime;
                    this._logger.logWithLevel(logLevel, `${prefix}Return: ${className}.${methodName} +${duration}ms`, `${className}.${methodName}`, {
                        result: typeof result === 'object' ? 'Object(...)' : result
                    });
                }
            }),
            catchError(err => {
                const duration = Date.now() - startTime;
                this._logger.err(
                    `${prefix}Error: ${className}.${methodName} +${duration}ms`,
                    err instanceof Error ? err : String(err),
                    `${className}.${methodName}`
                );
                return throwError(() => err);
            })
        );
    }

    private _sanitizeArgs(args: any[]): string {
        try {
            return inspect(args, {depth: 1, colors: false, compact: true});
        } catch {
            return '[Circular/Unserializable Data]';
        }
    }
}
