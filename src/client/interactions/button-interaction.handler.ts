import {Injectable, Logger} from '@nestjs/common';
import {ButtonInteraction} from 'discord.js';
import {IButtonHandler} from '../interfaces/button-handler.interface.js';
import {IButton} from '../interfaces/button.interface.js';

/**
 * Specialized handler for processing all button interactions.
 */
@Injectable()
export class ButtonInteractionHandler implements IButtonHandler {
    private readonly logger = new Logger(ButtonInteractionHandler.name);
    private readonly buttons = new Map<string, IButton>();

    /**
     * Executes the appropriate button logic based on the custom ID.
     * @param interaction The button interaction.
     */
    public async execute(interaction: ButtonInteraction): Promise<void> {
        const button = this.buttons.get(interaction.customId);

        if (button) {
            try {
                await button.execute(interaction);
            } catch (error) {
                const err = error as Error;
                this.logger.error(`Error executing button ${interaction.customId}: ${err.message}`, err.stack);
                throw error;
            }
        } else {
            this.logger.warn(`Received unknown button interaction: ${interaction.customId}`);
        }
    }

    /**
     * Registers a specific button implementation.
     * @param button The button to register.
     */
    public registerButton(button: IButton): void {
        this.buttons.set(button.customId, button);
        this.logger.debug(`Registered entity button: ${button.customId}`);
    }
}
