import {Inject, Injectable, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import * as discord from 'discord.js';
import type {ConfigType} from '@nestjs/config';
import {discordConfig} from '@common/config-env/index.js';
import {IClient} from '@client/interfaces/client.interface.js';
import {DiscordActivityType, DiscordPresenceStatus, DiscordErrorContext} from '@client/enums/index.js';
import type {InteractionsManager} from './interactions-manager.js';
import {IINTERACTIONS_MANAGER_TOKEN} from '@/client/client.token.js';
import {RequestContextService} from '@/common/_request-context/services/RequestContext.service.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';
import {EventBusService} from '@/common/event-bus/event-bus.service.js';
import {Events} from '@/common/event-bus/events.dictionary.js';
import {SystemErrorEvent} from './events/system-error.event.js';
import {ClientReadyEvent} from './events/client-ready.event.js';
import {ClientDisconnectEvent} from './events/client-disconnect.event.js';
import {randomUUID} from 'crypto';

/**
 * Injection token for Discord Client configurations.
 */
export const DISCORD_CLIENT_OPTIONS = 'DISCORD_CLIENT_OPTIONS';

/**
 * Main wrapper for the Discord.js Client.
 *
 * Implements IClient interface and manages the connection lifecycle,
 * event registration, and interaction routing.
 *
 * @class BotClient
 */
@Injectable()
export class BotClient implements IClient, OnModuleInit, OnModuleDestroy {
    /** @private */
    private readonly _client: discord.Client;
    /** @private */
    private _isReady: boolean = false;

    /**
     * @param _config - Namespaced Discord configuration.
     * @param _options - Discord.js client options provided via Dependency Injection.
     * @param _interactionsManager - Manager for handling various interactions.
     * @param _requestContext - Service for managing request-scoped data.
     * @param _eventBus - Application event bus service.
     * @param _logger - Custom logger instance.
     */
    constructor(
        @Inject(discordConfig.KEY)
        private readonly _config: ConfigType<typeof discordConfig>,
        @Inject(DISCORD_CLIENT_OPTIONS) private readonly _options: discord.ClientOptions,
        @Inject(IINTERACTIONS_MANAGER_TOKEN) private readonly _interactionsManager: InteractionsManager,
        private readonly _requestContext: RequestContextService,
        private readonly _eventBus: EventBusService,
        @Inject(LOG.LOGGER) private readonly _logger: ILogger
    ) {
        this._client = new discord.Client(this._options);
    }

    /**
     * Returns true if the client is ready and connected to the gateway.
     * @returns {boolean}
     */
    public get isReady(): boolean {
        return this._isReady;
    }

    /**
     * NestJS Lifecycle Hook: Initializes the bot and establishes a connection to the Discord Gateway.
     */
    public async onModuleInit(): Promise<void> {
        if (process.env.APP_CLI_MODE === 'true') {
            this._logger.log('CLI Mode detected: Skipping Discord Gateway connection', 'BotClient');
            return;
        }

        this._registerBaseEvents();
        this._registerInteractionHandler();
        await this.start();
    }

    /**
     * NestJS Lifecycle Hook: Ensures the bot gracefully shuts down when the application stops.
     */
    public async onModuleDestroy(): Promise<void> {
        await this.shutdown();
    }

    /**
     * Starts the Discord client and logs into the gateway.
     * @throws {Error} If authorization fails.
     * @returns {Promise<void>}
     */
    public async start(): Promise<void> {
        const {token} = this._config;
        try {
            await this._client.login(token);
        } catch (error) {
            this._logger.error('Critical failure during Gateway authorization', error);
            throw error;
        }
    }

    /**
     * Closes the connection to the Discord Gateway and destroys the client.
     * @returns {Promise<void>}
     */
    public async shutdown(): Promise<void> {
        this._logger.warn('Closing Gateway connection...');
        await this._client.destroy();
    }

    /**
     * Retrieves the current Discord user if the client is logged in.
     * @returns {discord.ClientUser | null}
     */
    public getUser(): discord.ClientUser | null {
        return this._client.user;
    }

    /**
     * Returns the current heartbeat ping to the WebSocket gateway.
     * @returns {number} Latency in milliseconds.
     */
    public getPing(): number {
        return this._client.ws.ping;
    }

    /**
     * Returns the human-readable string representation of the client's current status.
     * @returns {string} Status name.
     */
    public getStatus(): string {
        return discord.Status[this._client.ws.status] ?? 'Unknown';
    }

    /**
     * Returns the internal uptime of the Discord client session.
     * @returns {number} Uptime in milliseconds.
     */
    public getInternalUptime(): number {
        return this._client.uptime ?? 0;
    }

    /**
     * Updates the bot's activity presence (e.g., "Playing...", "Watching...").
     * @param name - The text message for the activity.
     * @param type - The type of activity (Playing, Streaming, etc.).
     */
    public setActivity(name: string, type: DiscordActivityType): void {
        if (!this._client.user) {
            this._logger.warn('Cannot set activity: Client user is not initialized');
            return;
        }
        this._client.user.setActivity(name, {type: type as any});
    }

    /**
     * Updates the bot's online status.
     * @param status - Online status (online, idle, dnd, invisible).
     */
    public setStatus(status: DiscordPresenceStatus): void {
        if (!this._client.user) {
            this._logger.warn('Cannot set status: Client user is not initialized');
            return;
        }
        this._client.user.setPresence({status: status as any});
    }

    /**
     * Registers internal gateway events for logging, diagnostics and reporting.
     * @private
     */
    private _registerBaseEvents(): void {
        this._client.once(discord.Events.ClientReady, c => {
            this._isReady = true;
            this._logger.log(`Logged in as ${c.user.tag} (ID: ${c.user.id})`);
            this._eventBus.emit(Events.LIFECYCLE.READY, new ClientReadyEvent(c as discord.Client));
        });

        this._client.on(discord.Events.Error, error => {
            this._logger.error(`Discord Client Error: ${error.message}`, error.stack);
            this._eventBus.emit(Events.SYSTEM.ERROR, new SystemErrorEvent(error, DiscordErrorContext.GatewayError));
        });

        this._client.on(discord.Events.Warn, message => {
            this._logger.warn(`Discord Client Warning: ${message}`);
            this._eventBus.emit(Events.SYSTEM.ERROR, new SystemErrorEvent(new Error(message), DiscordErrorContext.GatewayWarning));
        });

        this._client.on(discord.Events.ShardDisconnect, () => {
            this._isReady = false;
            this._eventBus.emit(Events.LIFECYCLE.DISCONNECT, new ClientDisconnectEvent());
        });

        this._client.rest.on('rateLimited', info => {
            const message = `Rate limited on [${info.method} ${info.route}]. Limit: ${info.limit}, Expiry: ${info.timeToReset}ms`;
            this._logger.warn(message);
            this._eventBus.emit(Events.SYSTEM.ERROR, new SystemErrorEvent(info, DiscordErrorContext.RateLimit));
        });
    }

    /**
     * Registers a persistent external event handler.
     * @param event - The name of the Discord client event.
     * @param handler - The callback function to execute.
     */
    public registerEventHandler<K extends keyof discord.ClientEvents>(event: K, handler: (...args: discord.ClientEvents[K]) => void | Promise<void>): void {
        this._client.on(event, handler as any);
    }

    /**
     * Registers a one-time external event handler.
     * @param event - The name of the Discord client event.
     * @param handler - The callback function to execute.
     */
    public registerEventOnce<K extends keyof discord.ClientEvents>(event: K, handler: (...args: discord.ClientEvents[K]) => void | Promise<void>): void {
        this._client.once(event, handler as any);
    }

    /**
     * Internal listener for interaction creation with request context wrapping.
     * @private
     */
    private _registerInteractionHandler(): void {
        this._client.on(discord.Events.InteractionCreate, (interaction: discord.Interaction) => {
            const correlationId = randomUUID();
            this._requestContext.run({correlationId}, () => {
                this._interactionsManager.handleInteraction(interaction);
            });
        });
    }
}
