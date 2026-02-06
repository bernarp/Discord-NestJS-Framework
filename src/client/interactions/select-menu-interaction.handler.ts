import {Injectable, Inject} from '@nestjs/common';
import {AnySelectMenuInteraction} from 'discord.js';
import {ISelectMenuHandler} from '../interfaces/select-menu-handler.interface.js';
import {ISelectMenu} from '../interfaces/select-menu.interface.js';
import {LOG} from '@/common/_logger/constants/LoggerConfig.js';
import type {ILogger} from '@/common/_logger/interfaces/ICustomLogger.js';

/**
 * Specialized handler for processing all select menu interactions.
 */
@Injectable()
export class SelectMenuInteractionHandler implements ISelectMenuHandler {
    private readonly _selectMenus = new Map<string, ISelectMenu>();

    constructor(@Inject(LOG.LOGGER) private readonly _logger: ILogger) {}

    /**
     * Executes the appropriate select menu logic based on the custom ID.
     * @param interaction The select menu interaction.
     */
    public async execute(interaction: AnySelectMenuInteraction): Promise<void> {
        const selectMenu = this._selectMenus.get(interaction.customId);

        if (selectMenu) {
            try {
                await selectMenu.execute(interaction);
            } catch (error) {
                const err = error as Error;
                this._logger.error(`Error executing select menu ${interaction.customId}: ${err.message}`, err.stack);
                throw error;
            }
        } else {
            this._logger.warn(`Received unknown select menu interaction: ${interaction.customId}`);
        }
    }

    /**
     * Registers a specific select menu implementation.
     * @param selectMenu The select menu to register.
     */
    public registerSelectMenu(selectMenu: ISelectMenu): void {
        this._selectMenus.set(selectMenu.customId, selectMenu);
        this._logger.debug(`Registered entity select menu: ${selectMenu.customId}`);
    }
}
