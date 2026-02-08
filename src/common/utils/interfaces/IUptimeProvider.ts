/**
 * Interface for providing and formatting process uptime.
 */
export interface IUptimeProvider {
    /**
     * Gets raw uptime in seconds.
     */
    getUptimeSeconds(): number;

    /**
     * Returns formatted uptime string (e.g., "1h 23m 45s").
     */
    getFormattedUptime(): string;
}
