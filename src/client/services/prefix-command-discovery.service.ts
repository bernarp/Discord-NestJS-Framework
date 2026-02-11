import {Injectable, OnModuleInit, Inject} from '@nestjs/common';
import {DiscoveryService, MetadataScanner} from '@nestjs/core';
import type {DiscoveryService as IDiscoveryService, MetadataScanner as IMetadataScanner} from '@nestjs/core';
import {DISCORD_PARAMS_METADATA, PREFIX_COMMAND_METADATA, PREFIX_SUBCOMMAND_METADATA} from '@/common/decorators/keys.js';
import {IPrefixCommandOptions, IPrefixSubCommandOptions} from '@/client/dto/index.js';
import {DiscordParamType} from '@/client/enums/discord-param-type.enum.js';
import {IPrefixCommandRegistry, IResolvedPrefixCommand, IParamMetadata} from '@/client/interfaces/index.js';
import type {IPrefixCommandRegistry as IPrefixCommandRegistryType} from '@/client/interfaces/index.js';
import {IPREFIX_COMMAND_REGISTRY_TOKEN} from '@/client/client.token.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';
import type {ILogger as ILoggerType} from '@/common/_logger/interfaces/ICustomLogger.js';
import {LogClass} from '@/common/decorators/log-class.decorator.js';
import {LogMethod, LogLevel} from '@/common/decorators/log-method.decorator.js';

/**
 * Service responsible for discovering and registering prefix commands.
 * Scans all providers for @PrefixCommand and @PrefixSubCommand decorators.
 */
@LogClass({level: LogLevel.DEBUG})
@Injectable()
export class PrefixCommandDiscoveryService implements OnModuleInit {
    constructor(
        private readonly _discovery: IDiscoveryService,
        private readonly _metadataScanner: IMetadataScanner,
        @Inject(IPREFIX_COMMAND_REGISTRY_TOKEN) private readonly _registry: IPrefixCommandRegistryType,
        @Inject(LOG.LOGGER) private readonly _logger: ILoggerType
    ) {}

    /** @inheritdoc */
    public onModuleInit(): void {
        this.discoverCommands();
    }

    /**
     * Scans providers for prefix command metadata.
     */
    private discoverCommands(): void {
        const providers = this._discovery.getProviders();
        for (const wrapper of providers) {
            const {instance} = wrapper;
            if (!instance || typeof instance !== 'object') continue;
            const commandOptions: IPrefixCommandOptions = Reflect.getMetadata(PREFIX_COMMAND_METADATA, instance.constructor);
            if (commandOptions) {
                this._registerResolvedCommand(instance, commandOptions);
            }
        }
    }

    /**
     * Resolves subcommands and registers the command in the registry.
     */
    private _registerResolvedCommand(instance: any, options: IPrefixCommandOptions): void {
        const prototype = Object.getPrototypeOf(instance);
        const subCommands = new Map<string, IResolvedPrefixCommand>();

        this._metadataScanner.scanFromPrototype(instance, prototype, (methodName: string) => {
            const subMeta: IPrefixSubCommandOptions = Reflect.getMetadata(PREFIX_SUBCOMMAND_METADATA, instance.constructor, methodName);
            if (subMeta) {
                const paramMap = this._discoverParams(instance, methodName);
                subCommands.set(subMeta.name.toLowerCase(), {
                    options: subMeta as any,
                    instance,
                    methodName,
                    subCommands: new Map(),
                    paramMap
                });
            }
        });
        const mainParamMap = this._discoverParams(instance, 'execute');
        this._registry.register({
            options,
            instance,
            methodName: 'execute',
            subCommands,
            paramMap: mainParamMap
        });

        this._logger.debug(`Discovered prefix command: ${options.name} (${subCommands.size} subcommands)`);
    }

    /**
     * Scans method for @Option decorators and builds a positional parameter map.
     */
    private _discoverParams(instance: any, methodName: string): Map<string, number> {
        const paramMap = new Map<string, number>();
        const metadata: IParamMetadata[] = Reflect.getMetadata(DISCORD_PARAMS_METADATA, instance.constructor, methodName) || [];
        const options = metadata.filter(m => m.type === DiscordParamType.OPTION).sort((a, b) => a.index - b.index);
        options.forEach((opt, idx) => {
            if (opt.data) {
                paramMap.set(opt.data, idx);
            }
        });
        return paramMap;
    }
}
