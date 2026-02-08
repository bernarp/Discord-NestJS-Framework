/**
 * Interface for providing system and environment information.
 */
export interface ISystemInfoProvider {
    /**
     * Gets Node.js version.
     */
    getNodeVersion(): string;

    /**
     * Gets platform information.
     */
    getPlatform(): string;

    /**
     * Gets memory usage information.
     */
    getMemoryUsage(): string;
}
