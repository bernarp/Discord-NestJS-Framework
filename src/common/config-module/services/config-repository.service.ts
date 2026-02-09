import {Injectable} from '@nestjs/common';
import {IConfigRepository} from '../interfaces/config-repository.interface.js';
import {IConfigSnapshot} from '../types/config.types.js';

/**
 * In-memory implementation of the configuration repository.
 * Handles storage of configuration snapshots and ensures data immutability.
 */
@Injectable()
export class ConfigRepository implements IConfigRepository {
    /** Internal storage map for snapshots. */
    private readonly _storage = new Map<string, IConfigSnapshot>();

    /**
     * Saves a configuration snapshot and deep-freezes its value.
     * @param key - Unique identifier for the configuration.
     * @param snapshot - The snapshot object containing value and metadata.
     */
    public save(key: string, snapshot: IConfigSnapshot): void {
        if (snapshot.value && typeof snapshot.value === 'object') {
            this._deepFreeze(snapshot.value);
        }
        this._storage.set(key, snapshot);
    }

    /**
     * Retrieves a configuration snapshot by its key.
     * @param key - Unique identifier for the configuration.
     * @returns {IConfigSnapshot | undefined} The snapshot or undefined if not registered.
     */
    public get(key: string): IConfigSnapshot | undefined {
        return this._storage.get(key);
    }

    /**
     * Checks if a configuration key exists in the repository.
     * @param key - The key to check.
     * @returns {boolean} True if found.
     */
    public has(key: string): boolean {
        return this._storage.has(key);
    }

    /**
     * Returns an array of all registered configuration keys.
     * @returns {string[]} Array of keys.
     */
    public keys(): string[] {
        return Array.from(this._storage.keys());
    }

    /**
     * Recursively freezes an object and its properties to prevent runtime mutation.
     * @param obj - The object to freeze.
     * @returns {any} The frozen object.
     * @private
     */
    private _deepFreeze(obj: any): any {
        Object.freeze(obj);
        Object.getOwnPropertyNames(obj).forEach(prop => {
            if (obj.hasOwnProperty(prop) && obj[prop] !== null && (typeof obj[prop] === 'object' || typeof obj[prop] === 'function') && !Object.isFrozen(obj[prop])) {
                this._deepFreeze(obj[prop]);
            }
        });
        return obj;
    }
}
