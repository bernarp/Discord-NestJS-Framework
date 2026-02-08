import {Injectable, Inject} from '@nestjs/common';
import type {Interaction} from 'discord.js';
import {IInteractionsManager} from './interfaces/interactions-manager.interface.js';
import type {ICommandHandler} from './interfaces/command-handler.interface.js';
import type {IButtonHandler} from './interfaces/button-handler.interface.js';
import type {ISelectMenuHandler} from './interfaces/select-menu-handler.interface.js';
import type {IModalHandler} from './interfaces/modal-handler.interface.js';
import {ICOMMAND_HANDLER_TOKEN, IBUTTON_HANDLER_TOKEN, ISELECT_MENU_HANDLER_TOKEN, IMODAL_HANDLER_TOKEN, IDISCORD_INTERACTION_HANDLERS_TOKEN} from '@/client/client.token.js';
import {LogMethod, LogLevel} from '@common/decorators/log-method.decorator.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';
import {IBaseHandler} from './interfaces/base-handler.interface.js';

/**
 * @class InteractionsManager
 * @implements IInteractionsManager
 * @description Central coordinator for all Discord interactions.
 * Uses the Registry pattern to discover and delegate interactions to specialized handlers.
 */
@Injectable()
export class InteractionsManager implements IInteractionsManager {
    /**
     * @constructor
     * @param {IBaseHandler[]} _handlers - Array of all registered interaction handlers.
     * @param {ILogger} _logger - Custom logger instance.
     */
    constructor(
        @Inject(IDISCORD_INTERACTION_HANDLERS_TOKEN) private readonly _handlers: IBaseHandler[],
        @Inject(LOG.LOGGER) private readonly _logger: ILogger
    ) {}

    /**
     * @public
     * @param {Interaction} interaction - The incoming Discord interaction.
     * @returns {Promise<void>}
     * @description Main entry point for processing any incoming interaction.
     * Automatically finds the first handler that supports the given interaction type.
     */
    @LogMethod({
        description: 'Global interaction entry point',
        level: LogLevel.DEBUG,
        logInput: true
    })
    public async handleInteraction(interaction: Interaction): Promise<void> {
        try {
            const handler = this._handlers.find(h => h.supports(interaction));

            if (handler) {
                await handler.execute(interaction);
            } else {
                this._logger.warn(`No handler supported for interaction type: ${interaction.type}`);
            }
        } catch (error) {
            const err = error as Error;
            this._logger.error(`Error handling interaction: ${err.message}`, err.stack);

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

    /**
     * @public
     * @param {ICommandHandler} handler - The command handler.
     * @description Legacy setter for backward compatibility or direct injection.
     * @deprecated Use DI with IDISCORD_INTERACTION_HANDLERS_TOKEN
     */
    public setCommandHandler(handler: ICommandHandler): void {
        this._logger.debug('setCommandHandler called (legacy)');
    }

    /**
     * @public
     * @param {IButtonHandler} handler - The button handler.
     * @description Legacy setter for backward compatibility or direct injection.
     * @deprecated Use DI with IDISCORD_INTERACTION_HANDLERS_TOKEN
     */
    public setButtonHandler(handler: IButtonHandler): void {
        this._logger.debug('setButtonHandler called (legacy)');
    }

    /**
     * @public
     * @param {ISelectMenuHandler} handler - The select menu handler.
     * @description Legacy setter for backward compatibility or direct injection.
     * @deprecated Use DI with IDISCORD_INTERACTION_HANDLERS_TOKEN
     */
    public setSelectMenuHandler(handler: ISelectMenuHandler): void {
        this._logger.debug('setSelectMenuHandler called (legacy)');
    }

    /**
     * @public
     * @param {IModalHandler} handler - The modal handler.
     * @description Legacy setter for backward compatibility or direct injection.
     * @deprecated Use DI with IDISCORD_INTERACTION_HANDLERS_TOKEN
     */
    public setModalHandler(handler: IModalHandler): void {
        this._logger.debug('setModalHandler called (legacy)');
    }
}
