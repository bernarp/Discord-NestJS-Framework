import {Interaction} from 'discord.js';

/**
 * Base interface for all interaction handlers.
 * @template T The type of interaction this handler processes.
 */
export interface IBaseHandler {
    /**
     * Executes the interaction processing logic.
     * @param interaction The Discord interaction object.
     */
    execute(interaction: Interaction): Promise<void> | void;

    /**
     * Checks if this handler supports the given interaction.
     * @param interaction The Discord interaction object.
     */
    supports(interaction: Interaction): boolean;
}
