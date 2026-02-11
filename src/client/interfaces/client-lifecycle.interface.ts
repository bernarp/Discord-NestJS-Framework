/**
 * Interface for managing the Discord Client connection status and readiness.
 * Handles the low-level lifecycle of the gateway connection.
 */
export interface IClientLifecycle {
    /**
     * Returns true if the client is currently ready and connected to the gateway.
     */
    readonly isReady: boolean;

    /**
     * Establishes a connection to the Discord Gateway.
     * @returns {Promise<void>} A promise that resolves upon successful authorization.
     */
    start(): Promise<void>;

    /**
     * Gracefully disconnects from the Discord Gateway and disposes of resources.
     * @returns {Promise<void>}
     */
    shutdown(): Promise<void>;
}
