import {Injectable, Inject, OnModuleInit} from '@nestjs/common';
import {DiscoveryService, ModulesContainer} from '@nestjs/core';
import type {IConfigSnapshot, TConfigKey} from '../types/config.types.js';
import type {IConfigLoader} from '../interfaces/config-loader.interface.js';
import type {IConfigMetadata} from '../interfaces/config-options.interface.js';
import type {IConfigRepository} from '../interfaces/config-repository.interface.js';
import {ConfigContext} from '../constants/config.constants.js';
import {CONFIG_METADATA_KEY, ICONFIG_LOADER_TOKEN, ICONFIG_REPOSITORY_TOKEN} from '../config.token.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';
import {EventBusService} from '@/common/event-bus/event-bus.service.js';
import {Events} from '@/common/event-bus/events.dictionary.js';
import {ConfigUpdatedEvent} from '../events/config-updated.event.js';
import {Emits} from '@/common/decorators/emits.decorator.js';
import {LogMethod, LogLevel} from '@/common/decorators/log-method.decorator.js';
import {IConfigService} from '../interfaces/config-service.interface.js';
import {ConfigNotFoundException} from '../exceptions/config-not-found.exception.js';

/**
 * Centralized service for managing and accessing application configurations.
 * Acts as a registry for all modules decorated with @Config.
 * Orchestrates discovery, storage, and reactive access.
 */
@Injectable()
export class ConfigService implements IConfigService, OnModuleInit {
    /** Registry of discoverable config metadata for reloading. */
    private readonly _metadataRegistry = new Map<TConfigKey, IConfigMetadata>();

    constructor(
        private readonly _discovery: DiscoveryService,
        private readonly _modulesContainer: ModulesContainer,
        private readonly _eventBus: EventBusService,
        @Inject(ICONFIG_LOADER_TOKEN) private readonly _orchestrator: IConfigLoader,
        @Inject(ICONFIG_REPOSITORY_TOKEN) private readonly _repository: IConfigRepository,
        @Inject(LOG.LOGGER) private readonly _logger: ILogger
    ) {}

    /**
     * NestJS Lifecycle Hook: Discovers all @Config decorated classes and loads their data.
     */
    public async onModuleInit(): Promise<void> {
        this._logger.log('Initializing Distributed Configuration Engine...', ConfigContext.SERVICE);
        await this._discoverAndLoadConfigs();
    }

    /**
     * Retrieves a configuration object by its unique key.
     * @param key - The key specified in the @Config decorator.
     * @returns {T} The validated and immutable configuration object.
     * @throws {ConfigNotFoundException} If the configuration key is not found.
     */
    public get<T>(key: TConfigKey): T {
        const snapshot = this._repository.get(key);
        if (!snapshot) {
            throw new ConfigNotFoundException(key);
        }
        return snapshot.value as T;
    }

    /**
     * Returns the full snapshot including metadata (version, timestamp).
     * @param key - The config key.
     */
    public getSnapshot<T>(key: TConfigKey): IConfigSnapshot<T> | undefined {
        return this._repository.get(key) as IConfigSnapshot<T>;
    }

    /**
     * Returns a Reactive Proxy that always points to the latest value in the repository.
     * Provides deep property access safety and immutability guard.
     * @param key - The config key.
     */
    public getProxy<T extends object>(key: TConfigKey): T {
        if (!this._repository.has(key)) {
            throw new ConfigNotFoundException(key);
        }

        const self = this;
        return new Proxy({} as T, {
            get: (_, prop) => {
                const latest = self._repository.get(key);
                if (!latest) return undefined;

                const value = (latest.value as any)[prop];

                // If the reached value is an object, we could potentially wrap it in another proxy
                // for deep reactivity, but per Lead Dev requirement, simple property proxying from latest snapshot is sufficient.
                return value;
            },
            set: () => {
                throw new Error(`Configuration [${key}] is immutable. Please update the source YAML/ENV files instead.`);
            }
        });
    }

    /**
     * Hot-reloads configuration from all sources.
     * @param key - The config key to reload.
     */
    @LogMethod({description: 'Hot-Reload Configuration', level: LogLevel.INFO})
    @Emits(Events.SYSTEM.CONFIG_UPDATED)
    public async reload(key: string): Promise<ConfigUpdatedEvent | void> {
        const metadata = this._metadataRegistry.get(key);
        if (!metadata) {
            this._logger.warn(`Attempted to reload non-registered config: [${key}]`, ConfigContext.SERVICE);
            return;
        }

        const oldSnapshot = this._repository.get(key);
        try {
            const newValue = await this._orchestrator.load(metadata);

            const newSnapshot: IConfigSnapshot = {
                value: newValue,
                version: (oldSnapshot?.version ?? 0) + 1,
                updatedAt: new Date()
            };

            this._repository.save(key, newSnapshot);

            return new ConfigUpdatedEvent({
                key,
                value: newValue,
                oldValue: oldSnapshot?.value
            });
        } catch (error: any) {
            // Orchestrator handles specific error logging; we just re-throw
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

        this._logger.log(`Successfully loaded ${this._repository.keys().length} configuration module(s).`);
    }

    /**
     * Registers and loads a specific configuration block via Orchestrator.
     * @private
     */
    @LogMethod({description: 'Register Config Module', level: LogLevel.DEBUG})
    private async _registerConfig(target: any, metadata: IConfigMetadata): Promise<void> {
        const {key} = metadata;
        if (this._repository.has(key)) {
            this._logger.warn(`Duplicate configuration key detected: [${key}]. Skipping second registration.`, ConfigContext.SERVICE);
            return;
        }

        try {
            const value = await this._orchestrator.load(metadata);

            this._repository.save(key, {
                value,
                version: 1,
                updatedAt: new Date()
            });

            this._metadataRegistry.set(key, {...metadata, target});
        } catch (error: any) {
            this._logger.error(`Failed to initialize configuration for [${key}]. Error: ${error.message}`, undefined, ConfigContext.SERVICE);
        }
    }
}
