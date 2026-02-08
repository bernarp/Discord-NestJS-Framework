import { Injectable, Inject } from '@nestjs/common';
import { ModalSubmitInteraction, Interaction } from 'discord.js';
import { AbstractInteractionHandler } from './base/abstract-interaction.handler.js';
import { IModalHandler } from '../interfaces/modal-handler.interface.js';
import { IModal } from '../interfaces/modal.interface.js';
import { LOG } from '@/common/_logger/constants/LoggerConfig.js';
import type { ILogger } from '@/common/_logger/interfaces/ICustomLogger.js';

/**
 * @class ModalInteractionHandler
 * @extends AbstractInteractionHandler
 * @implements IModalHandler
 * @description Specialized handler for processing all Discord modal submission interactions.
 * Matches incoming interactions with registered modal entities via customId.
 */
@Injectable()
export class ModalInteractionHandler
    extends AbstractInteractionHandler<ModalSubmitInteraction, IModal>
    implements IModalHandler {

    /**
     * @constructor
     * @param {ILogger} logger - Custom logger instance.
     */
    constructor(@Inject(LOG.LOGGER) logger: ILogger) {
        super(logger);
    }

    /**
     * @public
     * @param {Interaction} interaction - The Discord interaction object.
     * @returns {boolean} True if the interaction is a modal submission.
     * @description Determines if this handler can process the given interaction.
     */
    public supports(interaction: Interaction): boolean {
        return interaction.isModalSubmit();
    }

    /**
     * @public
     * @param {IModal} modal - The modal entity to register.
     * @returns {void}
     * @description Registers a modal entity in the local registry using its customId.
     */
    public registerModal(modal: IModal): void {
        this.register(modal);
        this._logger.debug(`Registered entity modal: ${modal.customId}`);
    }

    /**
     * @protected
     * @override
     * @param {IModal} modal - The modal entity.
     * @returns {string} The customId of the modal.
     * @description Returns the key used for modal registration.
     */
    protected getEntityKey(modal: IModal): string {
        return modal.customId;
    }

    /**
     * @protected
     * @override
     * @param {ModalSubmitInteraction} interaction - The modal interaction.
     * @returns {string} The customId from the interaction.
     * @description Returns the customId from the interaction to match against the registry.
     */
    protected getInteractionKey(interaction: ModalSubmitInteraction): string {
        return interaction.customId;
    }
}
