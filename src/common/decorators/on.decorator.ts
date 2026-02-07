import {SetMetadata} from '@nestjs/common';
import {ClientEvents} from 'discord.js';
import {DISCORD_EVENT_METADATA} from './keys.js';
import {IEventMetadata} from '@/client/interfaces/event-metadata.interface.js';

/**
 * Decorator to mark a method as a Discord event listener.
 * The method will be executed every time the specified event occurs.
 *
 * @param event - The name of the Discord client event.
 */
export function On(event: keyof ClientEvents): MethodDecorator {
    const metadata: IEventMetadata = {event, once: false};
    return SetMetadata(DISCORD_EVENT_METADATA, metadata);
}
