import {Injectable, Inject} from '@nestjs/common';
import {ButtonInteraction, Interaction} from 'discord.js';
import {AbstractInteractionHandler} from './base/abstract-interaction.handler.js';
import {IButtonHandler} from '../interfaces/button-handler.interface.js';
import {IButton} from '../interfaces/button.interface.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';

/**
 * @class ButtonInteractionHandler
 * @extends AbstractInteractionHandler
 * @implements IButtonHandler
 * @description Specialized handler for processing all Discord UI button interactions.
 * Matches incoming interactions with registered button entities via customId.
 */
@Injectable()
export class ButtonInteractionHandler extends AbstractInteractionHandler<ButtonInteraction, IButton> implements IButtonHandler {
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
     * @returns {boolean} True if the interaction is a button.
     * @description Determines if this handler can process the given interaction.
     */
    public supports(interaction: Interaction): boolean {
        return interaction.isButton();
    }

    /**
     * @public
     * @param {IButton} button - The button entity to register.
     * @returns {void}
     * @description Registers a button entity in the local registry using its customId.
     */
    public registerButton(button: IButton): void {
        this.register(button);
        this._logger.debug(`Registered entity button: ${button.customId}`);
    }

    /**
     * @protected
     * @override
     * @param {IButton} button - The button entity.
     * @returns {string} The customId of the button.
     * @description Returns the key used for button registration.
     */
    protected getEntityKey(button: IButton): string {
        return button.customId;
    }

    /**
     * @protected
     * @override
     * @param {ButtonInteraction} interaction - The button interaction.
     * @returns {string} The customId from the interaction.
     * @description Returns the customId from the interaction to match against the registry.
     */
    protected getInteractionKey(interaction: ButtonInteraction): string {
        return interaction.customId;
    }
}
