/**
 * Interface for the gateway monitor service which handles technical events and diagnostics.
 * Technical events include errors, warnings, and rate-limiting info from the gateway.
 */
export interface IGatewayMonitor {
    /**
     * Registers technical event listeners for monitoring and diagnostics.
     */
    init(): void;
}
