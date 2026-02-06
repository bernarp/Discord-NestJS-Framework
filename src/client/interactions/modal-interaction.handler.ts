import {Injectable, Logger} from '@nestjs/common';
import {ModalSubmitInteraction} from 'discord.js';
import {IModalHandler} from '../interfaces/modal-handler.interface.js';
import {IModal} from '../interfaces/modal.interface.js';

/**
 * Specialized handler for processing all modal submission interactions.
 */
@Injectable()
export class ModalInteractionHandler implements IModalHandler {
    private readonly logger = new Logger(ModalInteractionHandler.name);
    private readonly modals = new Map<string, IModal>();

    /**
     * Executes the appropriate modal logic based on the custom ID.
     * @param interaction The modal submit interaction.
     */
    public async execute(interaction: ModalSubmitInteraction): Promise<void> {
        const modal = this.modals.get(interaction.customId);

        if (modal) {
            try {
                await modal.execute(interaction);
            } catch (error) {
                const err = error as Error;
                this.logger.error(`Error executing modal ${interaction.customId}: ${err.message}`, err.stack);
                throw error;
            }
        } else {
            this.logger.warn(`Received unknown modal interaction: ${interaction.customId}`);
        }
    }

    /**
     * Registers a specific modal implementation.
     * @param modal The modal to register.
     */
    public registerModal(modal: IModal): void {
        this.modals.set(modal.customId, modal);
        this.logger.debug(`Registered entity modal: ${modal.customId}`);
    }
}
