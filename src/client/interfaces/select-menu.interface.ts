import {AnySelectMenuInteraction} from 'discord.js';

/**
 * Interface for individual select menu interaction definitions.
 */
export interface ISelectMenu {
    /**
     * The unique custom ID of the select menu.
     */
    readonly customId: string;

    /**
     * Executes the logic when an option is selected.
     * @param interaction The select menu interaction object.
     */
    execute(interaction: AnySelectMenuInteraction): Promise<void> | void;
}
