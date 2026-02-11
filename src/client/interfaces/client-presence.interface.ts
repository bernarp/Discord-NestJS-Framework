import {DiscordActivityType, DiscordPresenceStatus} from '@client/enums/index.js';

/**
 * Interface for managing the bot's presence and activity status.
 * Allows updating what the bot "is doing" and its online status.
 */
export interface IClientPresence {
    /**
     * Sets the bot's current activity (e.g., "Playing Games").
     * @param name - The text message for the activity.
     * @param type - The type of activity (Playing, Watching, etc.).
     */
    setActivity(name: string, type: DiscordActivityType): void;

    /**
     * Sets the bot's online status (e.g., online, idle, dnd).
     * @param status - The Discord presence status.
     */
    setStatus(status: DiscordPresenceStatus): void;
}
