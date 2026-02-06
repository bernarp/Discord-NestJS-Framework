import { Injectable, Inject, Optional } from '@nestjs/common';
import type { Interaction } from 'discord.js';
import { IInteractionsManager } from './interfaces/interactions-manager.interface.js';
import type { ICommandHandler } from './interfaces/command-handler.interface.js';
import type { IButtonHandler } from './interfaces/button-handler.interface.js';
import type { ISelectMenuHandler } from './interfaces/select-menu-handler.interface.js';
import type { IModalHandler } from './interfaces/modal-handler.interface.js';
import { ICOMMAND_HANDLER_TOKEN, IBUTTON_HANDLER_TOKEN, ISELECT_MENU_HANDLER_TOKEN, IMODAL_HANDLER_TOKEN } from '@/client/client.token.js';
import { LogMethod, LogLevel } from '@common/decorators/log-method.decorator.js';
import { LOG } from '@/common/_logger/constants/LoggerConfig.js';
import type { ILogger } from '@/common/_logger/interfaces/ICustomLogger.js';

/**
 * Manager responsible for routing Discord interactions to their respective handlers.
 */
@Injectable()
export class InteractionsManager implements IInteractionsManager {

    constructor(
        @Optional() @Inject(ICOMMAND_HANDLER_TOKEN) private _commandHandler: ICommandHandler | undefined,
        @Optional() @Inject(IBUTTON_HANDLER_TOKEN) private _buttonHandler: IButtonHandler | undefined,
        @Optional() @Inject(ISELECT_MENU_HANDLER_TOKEN) private _selectMenuHandler: ISelectMenuHandler | undefined,
        @Optional() @Inject(IMODAL_HANDLER_TOKEN) private _modalHandler: IModalHandler | undefined,
        @Inject(LOG.LOGGER) private readonly _logger: ILogger
    ) { }

    /**
     * Main entry point for processing any incoming interaction.
     * Dispatches the interaction to the appropriate specialized handler.
     * @param interaction The interaction to handle.
     */
    @LogMethod({
        description: 'Global interaction entry point',
        level: LogLevel.DEBUG,
        logInput: false
    })
    public async handleInteraction(interaction: Interaction): Promise<void> {
        try {
            if (interaction.isChatInputCommand() || interaction.isAutocomplete()) {
                await this._commandHandler?.execute(interaction as any);
                if (interaction.isAutocomplete() && this._commandHandler?.autocomplete) {
                    await this._commandHandler.autocomplete(interaction);
                }
            } else if (interaction.isButton()) {
                await this._buttonHandler?.execute(interaction);
            } else if (interaction.isAnySelectMenu()) {
                await this._selectMenuHandler?.execute(interaction);
            } else if (interaction.isModalSubmit()) {
                await this._modalHandler?.execute(interaction);
            }
        } catch (error) {
            const err = error as Error;
            this._logger.error(`Error handling interaction: ${err.message}`, err.stack);
            if (interaction.isRepliable()) {
                const errorMessage = 'An internal error occurred while processing this request.';
                if (interaction.deferred || interaction.replied) {
                    await interaction.followUp({ content: errorMessage, ephemeral: true });
                } else {
                    await interaction.reply({ content: errorMessage, ephemeral: true });
                }
            }
        }
    }

    public setCommandHandler(handler: ICommandHandler): void {
        this._commandHandler = handler;
        this._logger.debug('Global command handler set');
    }

    public setButtonHandler(handler: IButtonHandler): void {
        this._buttonHandler = handler;
        this._logger.debug('Global button handler set');
    }

    public setSelectMenuHandler(handler: ISelectMenuHandler): void {
        this._selectMenuHandler = handler;
        this._logger.debug('Global select menu handler set');
    }

    public setModalHandler(handler: IModalHandler): void {
        this._modalHandler = handler;
        this._logger.debug('Global modal handler set');
    }
}
