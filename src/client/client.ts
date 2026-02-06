import {Inject, Injectable, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import * as discord from 'discord.js';
import type {ConfigType} from '@nestjs/config';
import {discordConfig} from '@common/config-env/index.js';
import {IClient} from '@client/interfaces/client.interface.js';
import type {InteractionsManager} from './interactions-manager.js';
import {IINTERACTIONS_MANAGER_TOKEN} from '@/client/client.token.js';
import {RequestContextService} from '@/common/_request-context/services/RequestContext.service.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';
import {randomUUID} from 'crypto';

/**
 * Injection token for Discord Client configurations.
 * Keeping it here for simplicity, but in large systems,
 * move this to a separate constants.ts file.
 */
export const DISCORD_CLIENT_OPTIONS = 'DISCORD_CLIENT_OPTIONS';

@Injectable()
export class BotClient implements IClient, OnModuleInit, OnModuleDestroy {
    private readonly _client: discord.Client;

    /**
     * @param _config - Namespaced Discord configuration.
     * @param _options - Discord.js client options provided via Dependency Injection.
     * @param _interactionsManager - Manager for handling various interactions.
     * @param _requestContext - Service for managing request-scoped data.
     * @param _logger - Custom logger instance.
     */
    constructor(
        @Inject(discordConfig.KEY)
        private readonly _config: ConfigType<typeof discordConfig>,
        @Inject(DISCORD_CLIENT_OPTIONS) private readonly _options: discord.ClientOptions,
        @Inject(IINTERACTIONS_MANAGER_TOKEN) private readonly _interactionsManager: InteractionsManager,
        private readonly _requestContext: RequestContextService,
        @Inject(LOG.LOGGER) private readonly _logger: ILogger
    ) {
        this._client = new discord.Client(this._options);
    }

    /**
     * NestJS Lifecycle Hook: Initializes the bot and establishes a connection to the Discord Gateway.
     */
    async onModuleInit() {
        this._registerBaseEvents();
        this._registerInteractionHandler();
        await this.start();
    }

    /**
     * NestJS Lifecycle Hook: Ensures the bot gracefully shuts down when the application stops.
     */
    async onModuleDestroy() {
        await this.shutdown();
    }

    /**
     * Starts the Discord client and logs into the gateway.
     * @throws Error if authorization fails.
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
     * Closes the connection to the Discord Gateway.
     */
    public async shutdown(): Promise<void> {
        this._logger.warn('Closing Gateway connection...');
        await this._client.destroy();
    }

    /**
     * Retrieves the current Discord user if the client is logged in.
     */
    public getUser(): discord.ClientUser | null {
        return this._client.user;
    }

    /**
     * Returns the current heartbeat ping to the WebSocket.
     */
    public getPing(): number {
        return this._client.ws.ping;
    }

    /**
     * Returns the human-readable string representation of the client's current status.
     */
    public getStatus(): string {
        return discord.Status[this._client.ws.status] ?? 'Unknown';
    }

    /**
     * Registers internal gateway events for logging and debugging.
     */
    private _registerBaseEvents() {
        this._client.once(discord.Events.ClientReady, c => {
            this._logger.log(`Logged in as ${c.user.tag} (ID: ${c.user.id})`);
        });

        this._client.on(discord.Events.Error, error => {
            this._logger.error(`Discord Client Error: ${error.message}`, error.stack);
        });

        this._client.on(discord.Events.Warn, message => {
            this._logger.warn(`Discord Client Warning: ${message}`);
        });
    }

    /**
     * Registers external event handlers.
     * This facilitates Single Responsibility Principle (SRP) by allowing other services
     * to handle specific logic (interactions, messages) without bloating the BotClient class.
     * * @param event - The name of the Discord client event (e.g., 'interactionCreate').
     * @param handler - The callback function to execute when the event fires.
     */
    public registerEventHandler<K extends keyof discord.ClientEvents>(event: K, handler: (...args: discord.ClientEvents[K]) => void) {
        this._client.on(event, handler as any);
    }

    private _registerInteractionHandler() {
        this._client.on(discord.Events.InteractionCreate, interaction => {
            const correlationId = randomUUID();
            this._requestContext.run({correlationId}, () => {
                this._interactionsManager.handleInteraction(interaction);
            });
        });
    }
}
