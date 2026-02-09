import {Injectable, Inject, forwardRef} from '@nestjs/common';
import * as chokidar from 'chokidar';
import * as path from 'path';
import type {IConfigModuleOptions} from '../interfaces/config-module-options.interface.js';
import {CONFIG_DEFAULT_PATHS, ConfigContext} from '../constants/config.constants.js';
import {CONFIG_MODULE_OPTIONS_TOKEN, ICONFIG_SERVICE_TOKEN} from '../config.token.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';
import type {IConfigWatcherService} from '../interfaces/config-watcher.interface.js';
import type {IConfigService} from '../interfaces/config-service.interface.js';
import {ConfigService} from './config.service.js';

/**
 * Service responsible for watching configuration files and triggering reloads.
 */
@Injectable()
export class ConfigWatcherService implements IConfigWatcherService {
    private _watcher?: chokidar.FSWatcher;
    private readonly _watchPaths: string[];

    constructor(
        @Inject(CONFIG_MODULE_OPTIONS_TOKEN) private readonly _options: IConfigModuleOptions,
        @Inject(ICONFIG_SERVICE_TOKEN) private readonly _configService: IConfigService,
        @Inject(LOG.LOGGER) private readonly _logger: ILogger
    ) {
        const defaults = path.resolve(process.cwd(), this._options.defaultsPath ?? CONFIG_DEFAULT_PATHS.DEFAULTS);
        const overrides = path.resolve(process.cwd(), this._options.overridesPath ?? CONFIG_DEFAULT_PATHS.OVERRIDES);

        this._watchPaths = [defaults, overrides];

        if (this._options.hotReload) {
            this._initWatcher();
        }
    }

    /**
     * Initializes the file system watcher.
     * @private
     */
    private _initWatcher(): void {
        this._logger.log(`Initializing config watcher on paths: [${this._watchPaths.join(', ')}]`, ConfigContext.SERVICE);

        this._watcher = chokidar.watch(this._watchPaths, {
            persistent: true,
            ignoreInitial: true,
            awaitWriteFinish: {
                stabilityThreshold: 500,
                pollInterval: 100
            }
        });

        this._watcher.on('change', (filePath: string) => {
            const fileName = path.basename(filePath);
            const key = fileName.replace(/\.(yaml|yml|json)$/, '');

            this._logger.log(`Detected change in [${fileName}]. Triggering reload...`, ConfigContext.SERVICE);
            this._configService.reload(key).catch(err => {
                this._logger.error(`Failed to hot-reload [${key}]: ${err.message}`, undefined, ConfigContext.SERVICE);
            });
        });

        this._watcher.on('error', (error: any) => {
            this._logger.error(`Watcher error: ${error.message}`, undefined, ConfigContext.SERVICE);
        });
    }

    /**
     * Cleanup on module destruction.
     */
    public async onModuleDestroy(): Promise<void> {
        if (this._watcher) {
            await this._watcher.close();
            this._logger.debug('Config watcher closed.', ConfigContext.SERVICE);
        }
    }
}
