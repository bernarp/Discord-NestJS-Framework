import {Injectable, OnModuleInit, OnModuleDestroy, Inject} from '@nestjs/common';
import * as discord from 'discord.js';
import {ConfigService} from '@nestjs/config';
import {IClient} from '@client/interfaces/client.interface.js';
import type {InteractionsManager} from './interactions-manager.js';
import {IINTERACTIONS_MANAGER_TOKEN} from '@/client/client.token.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';

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
     * @param _configService - NestJS configuration service to access environment variables.
     * @param _options - Discord.js client options provided via Dependency Injection.
     * @param _logger - Custom logger instance.
     */
    constructor(
        private readonly _configService: ConfigService,
        @Inject(DISCORD_CLIENT_OPTIONS) private readonly _options: discord.ClientOptions,
        @Inject(IINTERACTIONS_MANAGER_TOKEN) private readonly _interactionsManager: InteractionsManager,
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
     * @throws Error if DISCORD_TOKEN is missing or authorization fails.
     */
    public async start(): Promise<void> {
        const token = this._configService.get<string>('DISCORD_TOKEN');

        if (!token) {
            throw new Error('Invalid configuration: DISCORD_TOKEN is missing in environment variables');
        }

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
            this._interactionsManager.handleInteraction(interaction);
        });
    }
}
