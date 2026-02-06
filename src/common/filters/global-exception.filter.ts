import {ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger, Optional} from '@nestjs/common';
import {BaseInteraction} from 'discord.js';
import {HttpAdapterHost} from '@nestjs/core';
import {BotException} from '@/common/exceptions/bot.exception.js';
import {RequestContextService} from '@/common/_request-context/services/RequestContext.service.js';
import {ExceptionFormatterService} from './services/exception-formatter.service.js';
import {DiscordErrorResponseService} from './services/discord-error-response.service.js';

/**
 * @class GlobalExceptionFilter
 * @description Universal exception filter ("Catch-All").
 * Acts as an orchestrator: intercepts any errors in the application,
 * logs them with a Trace ID, and delegates response delivery to specialized services
 * based on the execution context (Discord or HTTP).
 *
 * @implements {ExceptionFilter}
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    /**
     * @private
     * @readonly
     */
    private readonly _logger = new Logger(GlobalExceptionFilter.name);

    /**
     * @constructor
     * @param {RequestContextService} _requestContext - Context service for retrieving Correlation ID.
     * @param {ExceptionFormatterService} _formatter - Service for formatting errors into user-friendly details.
     * @param {DiscordErrorResponseService} _discordResponse - Service for sending Discord-specific error responses.
     * @param {HttpAdapterHost} [_httpAdapterHost] - Adapter for handling HTTP responses (optional).
     */
    constructor(
        private readonly _requestContext: RequestContextService,
        private readonly _formatter: ExceptionFormatterService,
        private readonly _discordResponse: DiscordErrorResponseService,
        @Optional() private readonly _httpAdapterHost?: HttpAdapterHost
    ) {}

    /**
     * @method catch
     * @description Main entry point for catching and handling exceptions.
     * @param {unknown} exception - The intercepted exception object.
     * @param {ArgumentsHost} host - Object containing arguments and execution context.
     */
    async catch(exception: unknown, host: ArgumentsHost) {
        const ctxType = host.getType();
        const traceId = this._requestContext.getCorrelationId() || 'N/A';
        this._logException(exception, traceId);
        const errorDetails = this._formatter.format(exception);
        const discordInteraction = this._tryGetDiscordInteraction(host);
        if (discordInteraction) {
            await this._discordResponse.sendError(discordInteraction, errorDetails, traceId);
            return;
        }
        if (ctxType === 'http' && this._httpAdapterHost) {
            this._handleHttpError(exception, host);
            return;
        }
        this._logger.warn(`[${traceId}] Unhandled context type: ${ctxType}`);
    }

    /**
     * @private
     * @method _tryGetDiscordInteraction
     * @description Attempts to extract a Discord interaction object from the execution host.
     * @param {ArgumentsHost} host - Execution context host.
     * @returns {BaseInteraction | null} The interaction object or null if not found.
     */
    private _tryGetDiscordInteraction(host: ArgumentsHost): BaseInteraction | null {
        const args = host.getArgs();
        const interaction = args.find(arg => arg instanceof BaseInteraction);
        return (interaction as BaseInteraction) || null;
    }

    /**
     * @private
     * @method _handleHttpError
     * @description Processes exception within an HTTP request context.
     * @param {unknown} exception - The exception.
     * @param {ArgumentsHost} host - Execution context host.
     */
    private _handleHttpError(exception: unknown, host: ArgumentsHost) {
        if (!this._httpAdapterHost) return;

        const {httpAdapter} = this._httpAdapterHost;
        const ctx = host.switchToHttp();

        const httpStatus = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        const responseBody = {
            statusCode: httpStatus,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
            message: (exception as any).message || 'Internal Server Error'
        };

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }

    /**
     * @private
     * @method _logException
     * @description Logs the exception based on its type and severity.
     * @param {unknown} exception - The exception to log.
     * @param {string} traceId - The tracing identifier (Correlation ID).
     */
    private _logException(exception: unknown, traceId: string) {
        if (exception instanceof BotException) {
            this._logger.warn(`[${traceId}] Business Logic Error: ${exception.message}`);
        } else {
            const errorStack = exception instanceof Error ? exception.stack : String(exception);
            this._logger.error(`[${traceId}] System Critical:`, errorStack);
        }
    }
}
