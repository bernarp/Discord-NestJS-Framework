import {ModalSubmitInteraction} from 'discord.js';

/**
 * Interface for individual modal submission definitions.
 */
export interface IModal {
    /**
     * The unique custom ID of the modal.
     */
    readonly customId: string;

    /**
     * Executes the logic when the modal is submitted.
     * @param interaction The modal submit interaction object.
     */
    execute(interaction: ModalSubmitInteraction): Promise<void> | void;
}
