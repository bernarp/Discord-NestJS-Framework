import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import * as discord from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { IClient } from '@client/interfaces/client.interface.js';
import type { InteractionsManager } from './interactions-manager.js';
import { IINTERACTIONS_MANAGER_TOKEN } from '@/client/client.token.js';

/**
 * Injection token for Discord Client configurations.
 * Keeping it here for simplicity, but in large systems,
 * move this to a separate constants.ts file.
 */
export const DISCORD_CLIENT_OPTIONS = 'DISCORD_CLIENT_OPTIONS';

@Injectable()
export class BotClient implements IClient, OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(BotClient.name);
    private readonly client: discord.Client;

    /**
     * @param configService - NestJS configuration service to access environment variables.
     * @param options - Discord.js client options provided via Dependency Injection.
     */
    constructor(
        private readonly configService: ConfigService,
        @Inject(DISCORD_CLIENT_OPTIONS) private readonly options: discord.ClientOptions,
        @Inject(IINTERACTIONS_MANAGER_TOKEN) private readonly interactionsManager: InteractionsManager
    ) {
        this.client = new discord.Client(this.options);
    }

    /**
     * NestJS Lifecycle Hook: Initializes the bot and establishes a connection to the Discord Gateway.
     */
    async onModuleInit() {
        this.registerBaseEvents();
        this.registerInteractionHandler();
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
        const token = this.configService.get<string>('DISCORD_TOKEN');

        if (!token) {
            throw new Error('Invalid configuration: DISCORD_TOKEN is missing in environment variables');
        }

        try {
            await this.client.login(token);
        } catch (error) {
            this.logger.error('Critical failure during Gateway authorization', error);
            throw error;
        }
    }

    /**
     * Closes the connection to the Discord Gateway.
     */
    public async shutdown(): Promise<void> {
        this.logger.warn('Closing Gateway connection...');
        await this.client.destroy();
    }

    /**
     * Retrieves the current Discord user if the client is logged in.
     */
    public getUser(): discord.ClientUser | null {
        return this.client.user;
    }

    /**
     * Returns the current heartbeat ping to the WebSocket.
     */
    public getPing(): number {
        return this.client.ws.ping;
    }

    /**
     * Returns the human-readable string representation of the client's current status.
     */
    public getStatus(): string {
        // discord.Status is an enum, we map it to string names
        return discord.Status[this.client.ws.status] ?? 'Unknown';
    }

    /**
     * Registers internal gateway events for logging and debugging.
     */
    private registerBaseEvents() {
        this.client.once(discord.Events.ClientReady, c => {
            this.logger.log(`Logged in as ${c.user.tag} (ID: ${c.user.id})`);
        });

        this.client.on(discord.Events.Error, error => {
            this.logger.error(`Discord Client Error: ${error.message}`, error.stack);
        });

        this.client.on(discord.Events.Warn, message => {
            this.logger.warn(`Discord Client Warning: ${message}`);
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
        this.client.on(event, handler as any);
    }

    private registerInteractionHandler() {
        this.client.on(discord.Events.InteractionCreate, interaction => {
            this.interactionsManager.handleInteraction(interaction);
        });
    }
}
