import {Injectable, Inject, OnModuleInit} from '@nestjs/common';
import {DiscoveryService, MetadataScanner, ModulesContainer} from '@nestjs/core';
import type {IConfigSnapshot, TConfigKey} from '../types/config.types.js';
import type {IConfigLoader} from '../interfaces/config-loader.interface.js';
import type {IConfigMetadata} from '../interfaces/config-options.interface.js';
import {ConfigContext} from '../constants/config.constants.js';
import {CONFIG_METADATA_KEY, ICONFIG_LOADER_TOKEN} from '../config.token.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';
import {EventBusService} from '@/common/event-bus/event-bus.service.js';
import {Events} from '@/common/event-bus/events.dictionary.js';
import {ConfigUpdatedEvent} from '../events/config-updated.event.js';
import {Emits} from '@/common/decorators/emits.decorator.js';
import {LogMethod, LogLevel} from '@/common/decorators/log-method.decorator.js';

import {IConfigService} from '../interfaces/config-service.interface.js';

/**
 * Centralized service for managing and accessing application configurations.
 * Acts as a registry for all modules decorated with @Config.
 */
@Injectable()
export class ConfigService implements IConfigService {
    /** In-memory storage for all loaded configuration snapshots. */
    private readonly _cache = new Map<TConfigKey, IConfigSnapshot>();

    /** Registry of discoverable config metadata. */
    private readonly _metadataRegistry = new Map<TConfigKey, IConfigMetadata>();

    constructor(
        private readonly _discovery: DiscoveryService,
        private readonly _modulesContainer: ModulesContainer,
        private readonly _eventBus: EventBusService,
        @Inject(ICONFIG_LOADER_TOKEN) private readonly _loader: IConfigLoader,
        @Inject(LOG.LOGGER) private readonly _logger: ILogger
    ) {}

    /**
     * NestJS Lifecycle Hook: Discovers all @Config decorated classes and loads their data.
     */
    public async onModuleInit(): Promise<void> {
        this._logger.log('Initializing Distributed Configuration Engine...');
        await this._discoverAndLoadConfigs();
    }

    /**
     * Retrieves a configuration object by its unique key.
     * @param key - The key specified in the @Config decorator.
     * @returns {T} The validated configuration object.
     * @throws {Error} If the configuration key is not found.
     */
    public get<T>(key: TConfigKey): T {
        const snapshot = this._cache.get(key);
        if (!snapshot) {
            this._logger.error(`Requested configuration key [${key}] not found in registry.`);
            throw new Error(`Configuration with key "${key}" is not registered or failed to load.`);
        }
        return snapshot.value as T;
    }

    /**
     * Returns the full snapshot including metadata (version, timestamp).
     * @param key - The config key.
     */
    public getSnapshot<T>(key: TConfigKey): IConfigSnapshot<T> | undefined {
        return this._cache.get(key) as IConfigSnapshot<T>;
    }

    /**
     * Returns a Reactive Proxy that always points to the latest value in cache.
     * Tier 3: Hot-reloading support.
     * @param key - The config key.
     */
    public getProxy<T extends object>(key: TConfigKey): T {
        const snapshot = this._cache.get(key);
        if (!snapshot) {
            throw new Error(`Cannot create proxy for unknown config key: ${key}`);
        }

        return new Proxy({} as T, {
            get: (_, prop) => {
                const latest = this._cache.get(key);
                if (!latest) return undefined;
                return (latest.value as any)[prop];
            }
        });
    }

    @LogMethod({description: 'Hot-Reload Configuration', level: LogLevel.INFO})
    @Emits(Events.SYSTEM.CONFIG_UPDATED)
    public async reload(key: string): Promise<ConfigUpdatedEvent | void> {
        const metadata = this._metadataRegistry.get(key);
        if (!metadata) {
            this._logger.warn(`Attempted to reload non-registered config: [${key}]`, ConfigContext.SERVICE);
            return;
        }
        const oldSnapshot = this._cache.get(key);
        try {
            const newValue = await this._loader.load(metadata);

            const newSnapshot: IConfigSnapshot = {
                value: newValue,
                version: (oldSnapshot?.version ?? 0) + 1,
                updatedAt: new Date()
            };
            this._cache.set(key, newSnapshot);
            return new ConfigUpdatedEvent({
                key,
                value: newValue,
                oldValue: oldSnapshot?.value
            });
        } catch (error: any) {
            throw error;
        }
    }

    /**
     * Internal discovery mechanism to find and initialize all configurations.
     * @private
     */
    private async _discoverAndLoadConfigs(): Promise<void> {
        const providers = this._discovery.getProviders();

        for (const wrapper of providers) {
            const {metatype} = wrapper;
            if (!metatype) continue;

            const metadata: IConfigMetadata = Reflect.getMetadata(CONFIG_METADATA_KEY, metatype);
            if (metadata) {
                await this._registerConfig(metatype, metadata);
            }
        }
        for (const module of this._modulesContainer.values()) {
            const metadata: IConfigMetadata = Reflect.getMetadata(CONFIG_METADATA_KEY, module.metatype);
            if (metadata) {
                await this._registerConfig(module.metatype, metadata);
            }
        }

        this._logger.log(`Successfully loaded ${this._cache.size} configuration module(s).`);
    }

    /**
     * Registers and loads a specific configuration block.
     * @private
     */
    @LogMethod({description: 'Register Config Module', level: LogLevel.DEBUG})
    private async _registerConfig(target: any, metadata: IConfigMetadata): Promise<void> {
        const {key} = metadata;
        if (this._cache.has(key)) {
            this._logger.warn(`Duplicate configuration key detected: [${key}]. Skipping second registration.`, ConfigContext.SERVICE);
            return;
        }
        try {
            const value = await this._loader.load(metadata);
            this._cache.set(key, {
                value,
                version: 1,
                updatedAt: new Date()
            });
            this._metadataRegistry.set(key, {...metadata, target});
        } catch (error: any) {
            this._logger.error(`Failed to initialize configuration for [${key}]. The module may not function correctly. Error: ${error.message}`, undefined, ConfigContext.SERVICE);
            // We do not re-throw here to allow the application to continue booting.
            // Feature: 'Module Disabling' could be implemented here in the future.
        }
    }
}
