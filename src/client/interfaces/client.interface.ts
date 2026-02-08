import {ClientUser} from 'discord.js';
import {DiscordActivityType, DiscordPresenceStatus, DiscordErrorContext} from '@client/enums/index.js';

/**
 * Type for the global system error handler.
 */
export type TGlobalErrorHandler = (error: Error | any, context: DiscordErrorContext) => void | Promise<void>;

/**
 * Interface defining the contract for the Discord Client wrapper.
 * This abstraction facilitates Dependency Inversion, allowing the rest of the
 * system to interact with the bot through this contract rather than a
 * concrete implementation.
 */
export interface IClient {
    /**
     * Returns true if the client is ready and logged in.
     */
    readonly isReady: boolean;

    /**
     * Initializes the connection to the Discord Gateway.
     * @returns {Promise<void>} A promise that resolves upon successful authorization.
     * @throws {Error} If the token is missing or the gateway authorization fails.
     */
    start(): Promise<void>;

    /**
     * Gracefully shuts down the Discord connection and disposes of resources.
     * @returns {Promise<void>}
     */
    shutdown(): Promise<void>;

    /**
     * Retrieves the current authorized Discord user (the bot profile).
     * @returns {ClientUser | null} The user object or null if the client is offline.
     */
    getUser(): ClientUser | null;

    /**
     * Returns the current WebSocket heartbeat latency (ping).
     * @returns {number} Latency in milliseconds.
     */
    getPing(): number;

    /**
     * Returns a human-readable string representation of the current connection status.
     * @returns {string} Status string (e.g., 'Ready', 'Connecting', 'Disconnected').
     */
    getStatus(): string;

    /**
     * Returns the internal uptime of the Discord client session in milliseconds.
     */
    getInternalUptime(): number;

    /**
     * Updates the bot's activity (e.g., "Playing...", "Watching...").
     */
    setActivity(name: string, type: DiscordActivityType): void;

    /**
     * Updates the bot's online status (e.g., online, idle, dnd).
     */
    setStatus(status: DiscordPresenceStatus): void;

    /**
     * Sets a global error handler for system-level errors (Gateway, REST, Rate Limits).
     */
    setGlobalErrorHandler(handler: TGlobalErrorHandler): void;

    /**
     * Registers an external event handler.
     * @param event - The name of the Discord client event.
     * @param handler - The callback function to execute.
     */
    registerEventHandler<K extends keyof import('discord.js').ClientEvents>(event: K, handler: (...args: import('discord.js').ClientEvents[K]) => void | Promise<void>): void;

    /**
     * Registers a one-time external event handler.
     * @param event - The name of the Discord client event.
     * @param handler - The callback function to execute.
     */
    registerEventOnce<K extends keyof import('discord.js').ClientEvents>(event: K, handler: (...args: import('discord.js').ClientEvents[K]) => void | Promise<void>): void;
}
