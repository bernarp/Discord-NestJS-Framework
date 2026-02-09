import {OnModuleInit} from '@nestjs/common';
import {TConfigKey, IConfigSnapshot} from '../types/config.types.js';
import {ConfigUpdatedEvent} from '../events/config-updated.event.js';

/**
 * Interface for the Centralized Configuration Service.
 */
export interface IConfigService extends OnModuleInit {
    /**
     * Retrieves a configuration object by its unique key.
     * @param key - The unique configuration key.
     */
    get<T>(key: TConfigKey): T;

    /**
     * Returns the full snapshot including metadata.
     * @param key - The config key.
     */
    getSnapshot<T>(key: TConfigKey): IConfigSnapshot<T> | undefined;

    /**
     * Returns a Reactive Proxy that always points to the latest value.
     * @param key - The config key.
     */
    getProxy<T extends object>(key: TConfigKey): T;

    /**
     * Forced reload of a configuration module.
     * @param key - The config key to reload.
     */
    reload(key: string): Promise<ConfigUpdatedEvent | void>;
}
