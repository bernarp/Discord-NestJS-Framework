import {ClientEvents} from 'discord.js';

/**
 * Structure of the metadata stored for Discord event listeners.
 */
export interface IEventMetadata {
    /**
     * Name of the Discord client event (e.g., 'messageCreate', 'ready').
     */
    event: keyof ClientEvents;

    /**
     * Flag indicating if the listener should be executed only once.
     */
    once: boolean;
}
