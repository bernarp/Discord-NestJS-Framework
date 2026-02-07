import {Injectable, Inject} from '@nestjs/common';
import {Events, Client} from 'discord.js';
import {On, Once} from '@/common/decorators/index.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';

/**
 * Listener for Discord 'ready' and 'messageCreate' events for testing Discovery system.
 */
@Injectable()
export class ReadyListener {
    constructor(@Inject(LOG.LOGGER) private readonly _logger: ILogger) {}

    /**
     * Triggered once when the bot is ready.
     */
    @Once(Events.ClientReady, {logInput: false})
    public async onReady(client: Client<true>): Promise<void> {}

    /**
     * Triggered every time a message is created.
     */
    @On(Events.MessageCreate)
    public async onMessage(message: any): Promise<void> {
        if (message.author?.bot) return;
    }
}
