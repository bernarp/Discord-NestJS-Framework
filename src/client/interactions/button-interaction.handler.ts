import {Injectable, Inject} from '@nestjs/common';
import {ButtonInteraction} from 'discord.js';
import {IButtonHandler} from '../interfaces/button-handler.interface.js';
import {IButton} from '../interfaces/button.interface.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';

/**
 * Specialized handler for processing all button interactions.
 */
@Injectable()
export class ButtonInteractionHandler implements IButtonHandler {
    private readonly _buttons = new Map<string, IButton>();

    constructor(@Inject(LOG.LOGGER) private readonly _logger: ILogger) {}

    /**
     * Executes the appropriate button logic based on the custom ID.
     * @param interaction The button interaction.
     */
    public async execute(interaction: ButtonInteraction): Promise<void> {
        const button = this._buttons.get(interaction.customId);

        if (button) {
            try {
                await button.execute(interaction);
            } catch (error) {
                const err = error as Error;
                this._logger.error(`Error executing button ${interaction.customId}: ${err.message}`, err.stack);
                throw error;
            }
        } else {
            this._logger.warn(`Received unknown button interaction: ${interaction.customId}`);
        }
    }

    /**
     * Registers a specific button implementation.
     * @param button The button to register.
     */
    public registerButton(button: IButton): void {
        this._buttons.set(button.customId, button);
        this._logger.debug(`Registered entity button: ${button.customId}`);
    }
}
