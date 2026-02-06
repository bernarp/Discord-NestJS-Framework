import {ClientUser} from 'discord.js';

/**
 * Interface defining the contract for the Discord Client wrapper.
 * * This abstraction facilitates Dependency Inversion, allowing the rest of the
 * system to interact with the bot through this contract rather than a
 * concrete implementation.
 */
export interface IClient {
    /**
     * Initializes the connection to the Discord Gateway.
     * * @returns {Promise<void>} A promise that resolves upon successful authorization.
     * @throws {Error} If the token is missing or the gateway authorization fails.
     */
    start(): Promise<void>;

    /**
     * Gracefully shuts down the Discord connection and disposes of resources.
     * * @returns {Promise<void>}
     */
    shutdown(): Promise<void>;

    /**
     * Retrieves the current authorized Discord user (the bot profile).
     * * @returns {ClientUser | null} The user object or null if the client is offline.
     */
    getUser(): ClientUser | null;

    /**
     * Returns the current WebSocket heartbeat latency (ping).
     * * @returns {number} Latency in milliseconds.
     */
    getPing(): number;

    /**
     * Returns a human-readable string representation of the current connection status.
     * * @returns {string} Status string (e.g., 'Ready', 'Connecting', 'Disconnected').
     */
    getStatus(): string;
}
