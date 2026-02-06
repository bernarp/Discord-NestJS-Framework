import {ButtonInteraction} from 'discord.js';

/**
 * Interface for individual button interaction definitions.
 */
export interface IButton {
    /**
     * The unique custom ID of the button.
     */
    readonly customId: string;

    /**
     * Executes the logic when the button is clicked.
     * @param interaction The button interaction object.
     */
    execute(interaction: ButtonInteraction): Promise<void> | void;
}
