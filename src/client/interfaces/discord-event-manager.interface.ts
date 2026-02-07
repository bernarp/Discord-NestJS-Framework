import {ClientEvents} from 'discord.js';

/**
 * Interface for the Discord Event Manager.
 * Responsibile for registering and managing event listeners for the Discord client.
 */
export interface IDiscordEventManager {
    /**
     * Registers an event listener.
     * @param event The Discord event name.
     * @param handler The function to execute when the event occurs.
     * @param once Whether the event should only be triggered once.
     */
    register<K extends keyof ClientEvents>(event: K, handler: (...args: ClientEvents[K]) => void | Promise<void>, once?: boolean): void;
}
