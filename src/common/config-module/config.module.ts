import {DynamicModule, Module, Global, Provider, Inject} from '@nestjs/common';
import {DiscoveryModule} from '@nestjs/core';
import {ConfigService} from './services/config.service.js';
import {ConfigWatcherService} from './services/config-watcher.service.js';
import {YamlConfigLoader} from './loaders/yaml-config.loader.js';
import {IConfigModuleOptions} from './interfaces/config-module-options.interface.js';
import {CONFIG_DEFAULT_PATHS} from './constants/config.constants.js';
import {CONFIG_MODULE_OPTIONS_TOKEN, ICONFIG_LOADER_TOKEN, ICONFIG_SERVICE_TOKEN, ICONFIG_WATCHER_TOKEN} from './config.token.js';

/**
 * Global module for the Distributed Configuration Engine.
 * Responsible for discovering @Config modules and providing validated settings.
 */
@Global()
@Module({
    imports: [DiscoveryModule],
    providers: [
        {
            provide: ICONFIG_SERVICE_TOKEN,
            useClass: ConfigService
        },
        {
            provide: ICONFIG_WATCHER_TOKEN,
            useClass: ConfigWatcherService
        },
        {
            provide: ICONFIG_LOADER_TOKEN,
            useClass: YamlConfigLoader
        }
    ],
    exports: [ICONFIG_SERVICE_TOKEN, ICONFIG_WATCHER_TOKEN]
})
export class ConfigModule {
    constructor(@Inject(ICONFIG_WATCHER_TOKEN) private readonly _watcher: ConfigWatcherService) {}
    /**
     * Initializes the configuration engine with custom options.
     * @param options - Paths and behavior settings.
     */
    public static forRoot(options: IConfigModuleOptions = {}): DynamicModule {
        const optionsProvider: Provider = {
            provide: CONFIG_MODULE_OPTIONS_TOKEN,
            useValue: {
                defaultsPath: options.defaultsPath ?? CONFIG_DEFAULT_PATHS.DEFAULTS,
                overridesPath: options.overridesPath ?? CONFIG_DEFAULT_PATHS.OVERRIDES,
                envPrefix: options.envPrefix ?? CONFIG_DEFAULT_PATHS.ENV_PREFIX,
                hotReload: options.hotReload ?? false
            }
        };

        return {
            module: ConfigModule,
            providers: [optionsProvider],
            exports: [optionsProvider]
        };
    }
}
