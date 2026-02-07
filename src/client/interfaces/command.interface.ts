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
     * @param args Arguments resolved by decorators or the raw interaction.
     */
    execute(...args: any[]): Promise<void> | void;

    /**
     * Optional method for handling autocomplete for this specific command.
     * @param args Arguments resolved by decorators or the raw interaction.
     */
    autocomplete?(...args: any[]): Promise<void> | void;
}
