import {Injectable, Inject} from '@nestjs/common';
import {ModalSubmitInteraction} from 'discord.js';
import {IModalHandler} from '../interfaces/modal-handler.interface.js';
import {IModal} from '../interfaces/modal.interface.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';

/**
 * Specialized handler for processing all modal submission interactions.
 */
@Injectable()
export class ModalInteractionHandler implements IModalHandler {
    private readonly _modals = new Map<string, IModal>();

    constructor(@Inject(LOG.LOGGER) private readonly _logger: ILogger) {}

    /**
     * Executes the appropriate modal logic based on the custom ID.
     * @param interaction The modal submit interaction.
     */
    public async execute(interaction: ModalSubmitInteraction): Promise<void> {
        const modal = this._modals.get(interaction.customId);

        if (modal) {
            try {
                await modal.execute(interaction);
            } catch (error) {
                const err = error as Error;
                this._logger.error(`Error executing modal ${interaction.customId}: ${err.message}`, err.stack);
                throw error;
            }
        } else {
            this._logger.warn(`Received unknown modal interaction: ${interaction.customId}`);
        }
    }

    /**
     * Registers a specific modal implementation.
     * @param modal The modal to register.
     */
    public registerModal(modal: IModal): void {
        this._modals.set(modal.customId, modal);
        this._logger.debug(`Registered entity modal: ${modal.customId}`);
    }
}
