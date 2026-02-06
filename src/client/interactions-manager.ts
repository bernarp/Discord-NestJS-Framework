import {Injectable, Logger} from '@nestjs/common';
import {Interaction} from 'discord.js';
import {IInteractionsManager} from './interfaces/interactions-manager.interface.js';
import type {ICommandHandler} from './interfaces/command-handler.interface.js';
import type {IButtonHandler} from './interfaces/button-handler.interface.js';
import type {ISelectMenuHandler} from './interfaces/select-menu-handler.interface.js';
import type {IModalHandler} from './interfaces/modal-handler.interface.js';
import {Inject, Optional} from '@nestjs/common';
import {ICOMMAND_HANDLER_TOKEN, IBUTTON_HANDLER_TOKEN, ISELECT_MENU_HANDLER_TOKEN, IMODAL_HANDLER_TOKEN} from '@/client/client.token.js';

/**
 * Manager responsible for routing Discord interactions to their respective handlers.
 */
@Injectable()
export class InteractionsManager implements IInteractionsManager {
    private readonly logger = new Logger(InteractionsManager.name);

    constructor(
        @Optional() @Inject(ICOMMAND_HANDLER_TOKEN) private commandHandler?: ICommandHandler,
        @Optional() @Inject(IBUTTON_HANDLER_TOKEN) private buttonHandler?: IButtonHandler,
        @Optional() @Inject(ISELECT_MENU_HANDLER_TOKEN) private selectMenuHandler?: ISelectMenuHandler,
        @Optional() @Inject(IMODAL_HANDLER_TOKEN) private modalHandler?: IModalHandler
    ) {}

    /**
     * Main entry point for processing any incoming interaction.
     * Dispatches the interaction to the appropriate specialized handler.
     * @param interaction The interaction to handle.
     */
    public async handleInteraction(interaction: Interaction): Promise<void> {
        try {
            if (interaction.isChatInputCommand() || interaction.isAutocomplete()) {
                await this.commandHandler?.execute(interaction as any);
                if (interaction.isAutocomplete() && this.commandHandler?.autocomplete) {
                    await this.commandHandler.autocomplete(interaction);
                }
            } else if (interaction.isButton()) {
                await this.buttonHandler?.execute(interaction);
            } else if (interaction.isAnySelectMenu()) {
                await this.selectMenuHandler?.execute(interaction);
            } else if (interaction.isModalSubmit()) {
                await this.modalHandler?.execute(interaction);
            }
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error handling interaction: ${err.message}`, err.stack);

            if (interaction.isRepliable()) {
                const errorMessage = 'An internal error occurred while processing this request.';
                if (interaction.deferred || interaction.replied) {
                    await interaction.followUp({content: errorMessage, ephemeral: true});
                } else {
                    await interaction.reply({content: errorMessage, ephemeral: true});
                }
            }
        }
    }

    public setCommandHandler(handler: ICommandHandler): void {
        this.commandHandler = handler;
        this.logger.debug('Global command handler set');
    }

    public setButtonHandler(handler: IButtonHandler): void {
        this.buttonHandler = handler;
        this.logger.debug('Global button handler set');
    }

    public setSelectMenuHandler(handler: ISelectMenuHandler): void {
        this.selectMenuHandler = handler;
        this.logger.debug('Global select menu handler set');
    }

    public setModalHandler(handler: IModalHandler): void {
        this.modalHandler = handler;
        this.logger.debug('Global modal handler set');
    }
}
