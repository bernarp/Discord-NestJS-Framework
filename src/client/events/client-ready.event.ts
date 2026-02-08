import {BaseEvent} from '@/common/event-bus/base.event.js';
import {Client} from 'discord.js';

/**
 * Event emitted when the Discord client has successfully logged in
 * and is ready to start receiving events.
 *
 * @class ClientReadyEvent
 * @extends BaseEvent<Client>
 */
export class ClientReadyEvent extends BaseEvent<Client> {
    /**
     * @param client - The ready Discord client instance.
     */
    constructor(client: Client) {
        super(client);
    }
}
