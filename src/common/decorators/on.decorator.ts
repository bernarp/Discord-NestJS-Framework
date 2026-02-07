import {applyDecorators, SetMetadata} from '@nestjs/common';
import {ClientEvents} from 'discord.js';
import {DISCORD_EVENT_METADATA} from './keys.js';
import {IEventMetadata} from '@/client/interfaces/event-metadata.interface.js';
import {LogMethod, LogMethodOptions, LogLevel} from './log-method.decorator.js';

/**
 * Decorator to mark a method as a Discord event listener.
 * Automatically adds logging.
 *
 * @param event - The name of the Discord client event.
 * @param options - Optional logging configuration.
 */
export function On(event: keyof ClientEvents, options: LogMethodOptions = {}): MethodDecorator {
    const metadata: IEventMetadata = {event, once: false};

    return applyDecorators(
        SetMetadata(DISCORD_EVENT_METADATA, metadata),
        LogMethod({
            description: `Discord Event: ${event}`,
            level: LogLevel.DEBUG,
            ...options
        })
    );
}
