import {Inject, Injectable, OnModuleInit} from '@nestjs/common';
import * as discord from 'discord.js';
import {Client} from '@/common/decorators/client.decorator.js';
import type {IClient} from '@/client/interfaces/client.interface.js';
import {IGatewayMonitor} from '@/client/interfaces/gateway-monitor.interface.js';
import {EventBusService} from '@/common/event-bus/event-bus.service.js';
import {Events} from '@/common/event-bus/events.dictionary.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';
import {DiscordErrorContext} from '@client/enums/index.js';
import {LogClass} from '@/common/decorators/log-class.decorator.js';
import {SystemErrorEvent} from '../events/system-error.event.js';
import {ClientReadyEvent} from '../events/client-ready.event.js';

/**
 * Service for monitoring Discord Gateway events and reporting errors/readiness.
 * Centralizes technical logging and system-wide event bubbling.
 */
@LogClass()
@Injectable()
export class GatewayMonitorService implements IGatewayMonitor, OnModuleInit {
    /**
     * @param _client - The low-level Discord client wrapper.
     * @param _eventBus - Application event bus for cross-module signaling.
     * @param _logger - System logger instance.
     */
    constructor(
        @Client() private readonly _client: IClient,
        private readonly _eventBus: EventBusService,
        @Inject(LOG.LOGGER) private readonly _logger: ILogger
    ) {}

    /**
     * NestJS Lifecycle Hook: Auto-initializes technical monitors.
     */
    public onModuleInit(): void {
        this.init();
    }

    /** @inheritdoc */
    public init(): void {
        const client = this._client.instance;

        client.once(discord.Events.ClientReady, c => {
            this._logger.log(`Logged in as ${c.user.tag} (ID: ${c.user.id})`);
            this._eventBus.emit(Events.LIFECYCLE.READY, new ClientReadyEvent(c as discord.Client));
        });

        client.on(discord.Events.Error, error => {
            this._logger.error(`Discord Client Error: ${error.message}`, error.stack);
            this._eventBus.emit(Events.SYSTEM.ERROR, new SystemErrorEvent(error, DiscordErrorContext.GatewayError));
        });

        client.on(discord.Events.Warn, message => {
            this._logger.warn(`Discord Client Warning: ${message}`);
            this._eventBus.emit(Events.SYSTEM.ERROR, new SystemErrorEvent(new Error(message), DiscordErrorContext.GatewayWarning));
        });

        client.rest.on('rateLimited', info => {
            const message = `Rate limited on [${info.method} ${info.route}]. Limit: ${info.limit}, Expiry: ${info.timeToReset}ms`;
            this._logger.warn(message);
            this._eventBus.emit(Events.SYSTEM.ERROR, new SystemErrorEvent(info, DiscordErrorContext.RateLimit));
        });
    }
}
