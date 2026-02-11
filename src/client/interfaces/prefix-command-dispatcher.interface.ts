import {Message} from 'discord.js';

/**
 * Interface for the Prefix Command Dispatcher.
 * Handles detection and routing of message-based commands.
 */
export interface IPrefixCommandDispatcher {
    /**
     * Entry point for message processing.
     * @param message - The Discord message.
     */
    handleMessage(message: Message): Promise<void>;
}
