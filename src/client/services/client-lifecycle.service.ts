import {Inject, Injectable, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import type {ConfigType} from '@nestjs/config';
import {discordConfig} from '@common/config-env/index.js';
import {ICLIENT_TOKEN} from '@/client/client.token.js';
import type {IClient} from '@/client/interfaces/client.interface.js';
import type {IClientLifecycle} from '@/client/interfaces/client-lifecycle.interface.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';
import {Client} from '@/common/decorators/client.decorator.js';

/**
 * Service responsible for managing the Discord Client connection lifecycle.
 */
@Injectable()
export class ClientLifecycleService implements IClientLifecycle, OnModuleInit, OnModuleDestroy {
    private _isReady: boolean = false;

    constructor(
        @Inject(discordConfig.KEY)
        private readonly _config: ConfigType<typeof discordConfig>,
        @Client() private readonly _client: IClient,
        @Inject(LOG.LOGGER) private readonly _logger: ILogger
    ) {}

    public get isReady(): boolean {
        return this._isReady;
    }

    public async onModuleInit(): Promise<void> {
        if (process.env.APP_CLI_MODE === 'true') {
            return;
        }

        // We listen for ready/disconnect to update our internal ready state
        this._client.instance.once('ready', () => {
            this._isReady = true;
        });

        this._client.instance.on('shardDisconnect', () => {
            this._isReady = false;
        });

        await this.start();
    }

    public async onModuleDestroy(): Promise<void> {
        await this.shutdown();
    }

    public async start(): Promise<void> {
        const {token} = this._config;
        try {
            await this._client.instance.login(token);
        } catch (error) {
            this._logger.error('Critical failure during Gateway authorization', error);
            throw error;
        }
    }

    public async shutdown(): Promise<void> {
        this._logger.warn('Closing Gateway connection...');
        await this._client.instance.destroy();
    }
}
