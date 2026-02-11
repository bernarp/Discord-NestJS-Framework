import {Inject, Injectable} from '@nestjs/common';
import * as discord from 'discord.js';
import {IClient} from '@client/interfaces/client.interface.js';
import {DiscordActivityType, DiscordPresenceStatus} from '@client/enums/index.js';
import {DISCORD_CLIENT_OPTIONS} from '@/client/client.token.js';

/**
 * Solid wrapper for the Discord.js Client instance.
 *
 * Implements IClient interface and serves as the primary provider
 * of the Discord Client object within the DI container.
 */
@Injectable()
export class BotClient implements IClient {
    /** @private */
    private readonly _client: discord.Client;

    /**
     * @param _options - Discord.js client options provided via Dependency Injection.
     */
    constructor(@Inject(DISCORD_CLIENT_OPTIONS) private readonly _options: discord.ClientOptions) {
        this._client = new discord.Client(this._options);
    }

    /** @inheritdoc */
    public get instance(): discord.Client {
        return this._client;
    }

    /** @inheritdoc */
    public get isReady(): boolean {
        return this._client.isReady();
    }

    /** @inheritdoc */
    public async start(): Promise<void> {
        // Implementation moved to ClientLifecycleService, but kept for interface compatibility
    }

    /** @inheritdoc */
    public async shutdown(): Promise<void> {
        // Implementation moved to ClientLifecycleService, but kept for interface compatibility
    }

    /** @inheritdoc */
    public getUser(): discord.ClientUser | null {
        return this._client.user;
    }

    /** @inheritdoc */
    public getPing(): number {
        return this._client.ws.ping;
    }

    /** @inheritdoc */
    public getStatus(): string {
        return discord.Status[this._client.ws.status] ?? 'Unknown';
    }

    /** @inheritdoc */
    public getInternalUptime(): number {
        return this._client.uptime ?? 0;
    }

    /** @inheritdoc */
    public setActivity(name: string, type: DiscordActivityType): void {
        this._client.user?.setActivity(name, {type: type as any});
    }

    /** @inheritdoc */
    public setStatus(status: DiscordPresenceStatus): void {
        this._client.user?.setPresence({status: status as any});
    }

    /** @inheritdoc */
    public registerEventHandler<K extends keyof discord.ClientEvents>(event: K, handler: (...args: discord.ClientEvents[K]) => void | Promise<void>): void {
        this._client.on(event, handler as any);
    }

    /** @inheritdoc */
    public registerEventOnce<K extends keyof discord.ClientEvents>(event: K, handler: (...args: discord.ClientEvents[K]) => void | Promise<void>): void {
        this._client.once(event, handler as any);
    }
}
