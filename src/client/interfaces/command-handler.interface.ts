import {ChatInputCommandInteraction, AutocompleteInteraction} from 'discord.js';
import {IBaseHandler} from './base-handler.interface.js';
import {ICommand} from './command.interface.js';

/**
 * Interface for slash command handlers.
 */
export interface ICommandHandler extends IBaseHandler<ChatInputCommandInteraction> {
    /**
     * Optional method for handling autocomplete interactions.
     * @param interaction The autocomplete interaction object.
     */
    autocomplete?(interaction: AutocompleteInteraction): Promise<void> | void;

    /**
     * Registers a specific command implementation.
     * @param command The command to register.
     */
    registerCommand(command: ICommand): void;
}
