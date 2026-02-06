import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { LOG_METHOD_KEY, LogMethodOptions } from '../decorators/log-method.decorator.js';
import { inspect } from 'util';

/**
 * Interceptor for automatic logging of method calls marked with @LogMethod.
 * Uses RxJS to intercept execution flow and handle results/errors.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);
    constructor(private readonly reflector: Reflector) { }
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const options = this.reflector.get<LogMethodOptions>(LOG_METHOD_KEY, context.getHandler());
        if (!options) {
            return next.handle();
        }

        const className = context.getClass().name;
        const methodName = context.getHandler().name;
        const contextType = context.getType();
        const { logInput, logResult, level, description } = options;

        const prefix = description ? `[${description}] ` : '';
        const startTime = Date.now();

        if (logInput) {
            const args = context.getArgs();
            const safeArgs = this.sanitizeArgs(args);

            this.logger[level || 'debug'](`${prefix}➡️ Call: ${className}.${methodName} [${contextType}]`, safeArgs);
        }

        return next.handle().pipe(
            tap(result => {
                if (logResult) {
                    const duration = Date.now() - startTime;
                    this.logger[level || 'debug'](
                        `${prefix}Return: ${className}.${methodName} +${duration}ms`,
                        typeof result === 'object' ? 'Object(...)' : result
                    );
                }
            }),
            catchError(err => {
                const duration = Date.now() - startTime;
                this.logger.error(`${prefix}Error: ${className}.${methodName} +${duration}ms`, err instanceof Error ? err.stack : err);
                return throwError(() => err);
            })
        );
    }

    private sanitizeArgs(args: any[]): string {
        try {
            return inspect(args, { depth: 1, colors: false, compact: true });
        } catch {
            return '[Circular/Unserializable Data]';
        }
    }
}
