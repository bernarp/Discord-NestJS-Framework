import {Inject, Injectable} from '@nestjs/common';
import {Client} from '@/common/decorators/client.decorator.js';
import type {IClient} from '@/client/interfaces/client.interface.js';
import {IClientPresence} from '@/client/interfaces/client-presence.interface.js';
import {DiscordActivityType, DiscordPresenceStatus} from '@client/enums/index.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';
import {LogClass} from '@/common/decorators/log-class.decorator.js';

/**
 * Service for managing bot presence and activity.
 * Isolated from the main client lifecycle for better decomposition.
 */
@LogClass()
@Injectable()
export class ClientPresenceService implements IClientPresence {
    /**
     * @param _client - The low-level Discord client wrapper.
     * @param _logger - System logger instance.
     */
    constructor(
        @Client() private readonly _client: IClient,
        @Inject(LOG.LOGGER) private readonly _logger: ILogger
    ) {}

    /** @inheritdoc */
    public setActivity(name: string, type: DiscordActivityType): void {
        const user = this._client.instance.user;
        if (!user) {
            this._logger.warn('Cannot set activity: Client user is not initialized');
            return;
        }
        user.setActivity(name, {type: type as any});
    }

    /** @inheritdoc */
    public setStatus(status: DiscordPresenceStatus): void {
        const user = this._client.instance.user;
        if (!user) {
            this._logger.warn('Cannot set status: Client user is not initialized');
            return;
        }
        user.setPresence({status: status as any});
    }
}
