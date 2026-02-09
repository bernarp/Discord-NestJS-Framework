import {IConfigSnapshot} from '../types/config.types.js';

/**
 * Interface for the configuration persistence and access layer.
 * Manages the state of all loaded configurations within the application lifecycle.
 */
export interface IConfigRepository {
    /**
     * Stores a configuration snapshot in the repository.
     * Implementation should ensure data immutability.
     * @param key - The configuration identifier.
     * @param snapshot - The snapshot metadata and value.
     */
    save(key: string, snapshot: IConfigSnapshot): void;

    /**
     * Retrieves a configuration snapshot.
     * @param key - The configuration identifier.
     * @returns {IConfigSnapshot | undefined} The snapshot or undefined if not found.
     */
    get(key: string): IConfigSnapshot | undefined;

    /**
     * Checks if a configuration key is active and stored.
     * @param key - The identifier to check.
     * @returns {boolean} True if the configuration exists.
     */
    has(key: string): boolean;

    /**
     * Returns a list of all currently loaded configuration keys.
     * @returns {string[]} Array of keys.
     */
    keys(): string[];
}
