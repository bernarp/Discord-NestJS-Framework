import {ChatInputCommandInteraction, AutocompleteInteraction} from 'discord.js';

/**
 * Interface for individual slash command definitions.
 */
export interface ICommand {
    /**
     * The name of the command.
     */
    readonly name: string;

    /**
     * Executes the command logic.
     * @param interaction The slash command interaction object.
     */
    execute(interaction: ChatInputCommandInteraction): Promise<void> | void;

    /**
     * Optional method for handling autocomplete for this specific command.
     * @param interaction The autocomplete interaction object.
     */
    autocomplete?(interaction: AutocompleteInteraction): Promise<void> | void;
}
