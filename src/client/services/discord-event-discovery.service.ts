import {Injectable, OnModuleInit, Inject} from '@nestjs/common';
import {DiscoveryService, MetadataScanner, Reflector} from '@nestjs/core';
import {DISCORD_EVENT_METADATA} from '@/common/decorators/keys.js';
import {IEventMetadata} from '../interfaces/event-metadata.interface.js';
import {IDISCORD_EVENT_MANAGER_TOKEN} from '../client.token.js';
import type {IDiscordEventManager} from '../interfaces/discord-event-manager.interface.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';
import {LogMethod, LogLevel, LogClass} from '@/common/decorators/index.js';

/**
 * Service responsible for discovering and registering Discord event listeners.
 * Scans all providers for @On and @Once decorators and registers them with the Event Manager.
 */
@Injectable()
export class DiscordEventDiscoveryService implements OnModuleInit {
    constructor(
        private readonly _discoveryService: DiscoveryService,
        private readonly _metadataScanner: MetadataScanner,
        private readonly _reflector: Reflector,
        @Inject(IDISCORD_EVENT_MANAGER_TOKEN) private readonly _eventManager: IDiscordEventManager,
        @Inject(LOG.LOGGER) private readonly _logger: ILogger
    ) {}

    /**
     * NestJS Lifecycle Hook: Triggered after all modules are initialized.
     */
    public onModuleInit(): void {
        this.discoverEvents();
    }

    /**
     * Scans for methods decorated with @On or @Once.
     */
    private discoverEvents(): void {
        const providers = this._discoveryService.getProviders();
        providers
            .filter(wrapper => wrapper.instance && Object.getPrototypeOf(wrapper.instance))
            .forEach(wrapper => {
                const {instance} = wrapper;
                const prototype = Object.getPrototypeOf(instance);
                this._metadataScanner.scanFromPrototype(instance, prototype, methodName => {
                    const method = instance[methodName];
                    const metadata = this._reflector.get<IEventMetadata>(DISCORD_EVENT_METADATA, method);
                    if (!metadata) return;
                    const handler = method.bind(instance);
                    this._eventManager.register(metadata.event, handler, metadata.once);
                    this._logRegistration(metadata.event, `${instance.constructor.name}.${methodName}`, metadata.once);
                });
            });
    }

    /**
     * Internal helper for logging event registration via decorator.
     */
    @LogMethod({
        level: LogLevel.DEBUG,
        description: 'Discord Event Listener Bound',
        logResult: false
    })
    private _logRegistration(event: string, target: string, once: boolean): void {}
}
