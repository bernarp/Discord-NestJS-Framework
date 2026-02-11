import {Injectable} from '@nestjs/common';
import {ClientEvents} from 'discord.js';
import {Client} from '@/common/decorators/client.decorator.js';
import {IDiscordEventManager} from '../interfaces/discord-event-manager.interface.js';
import type {IClient} from '../interfaces/client.interface.js';

/**
 * Service responsible for technical registration of Discord events.
 * Middleman between the discovery system and the actual BotClient.
 */
@Injectable()
export class DiscordEventManager implements IDiscordEventManager {
    /**
     * @param _client - The low-level Discord client wrapper.
     */
    constructor(@Client() private readonly _client: IClient) {}

    /**
     * Proxies the event registration to the BotClient.
     * @param event The Discord event name.
     * @param handler The function to execute.
     * @param once Whether the event should only be triggered once.
     */
    public register<K extends keyof ClientEvents>(event: K, handler: (...args: ClientEvents[K]) => void | Promise<void>, once: boolean = false): void {
        if (once) {
            this._client.registerEventOnce(event, handler);
        } else {
            this._client.registerEventHandler(event, handler);
        }
    }
}
