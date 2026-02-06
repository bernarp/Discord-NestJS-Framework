import {Interaction} from 'discord.js';

/**
 * Base interface for all interaction handlers.
 * @template T The type of interaction this handler processes.
 */
export interface IBaseHandler<T extends Interaction> {
    /**
     * Executes the interaction processing logic.
     * @param interaction The Discord interaction object.
     */
    execute(interaction: T): Promise<void> | void;
}
